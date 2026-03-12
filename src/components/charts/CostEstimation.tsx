"use client"

import { useEffect, useState } from "react"
import { useTranslation } from "@/lib/i18n/I18nContext"
import type { InfrastructureProjections } from "@/types"
import { PricingCard } from "./PricingCard"
import { TuiBanner } from "@/components/ui/TuiBanner"

interface CostEstimationProps {
  projections: InfrastructureProjections;
  onLoadingChange?: (loading: boolean) => void;
  hideLoader?: boolean;
}

interface PricingData {
  storage: number;
  egress: number;
  isMocked: boolean;
}

export function CostEstimation({ projections, onLoadingChange, hideLoader = false }: CostEstimationProps) {
  const { t } = useTranslation();
  const [awsPricing, setAwsPricing] = useState<PricingData>({ storage: 0, egress: 0, isMocked: true });
  const [azurePricing, setAzurePricing] = useState<PricingData>({ storage: 0, egress: 0, isMocked: true });
  const [gcpPricing, setGcpPricing] = useState<PricingData>({ storage: 0, egress: 0, isMocked: true });
  const [oraclePricing, setOraclePricing] = useState<PricingData>({ storage: 0, egress: 0, isMocked: true });
  const [exchangeRate, setExchangeRate] = useState<number>(5.0);
  const [isLoading, setIsLoading] = useState(true);
  const [cacheTime, setCacheTime] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPricing() {
      const CACHE_KEY = "Infralyzer_local_pricing_fallback";
      const CACHE_DURATION_MS = 3 * 60 * 60 * 1000; // 3 hours

      setIsLoading(true);
      onLoadingChange?.(true);

      // 1. Tentar ler do LocalStorage primeiro (Fallback de velocidade/indisponibilidade)
      const localCached = localStorage.getItem(CACHE_KEY);
      if (localCached) {
        try {
          const parsed = JSON.parse(localCached);
          // Ignora cache se tiver dados mockados (força refresh para ver os novos dados live)
          const hasMocks = parsed.aws?.isMocked || parsed.azure?.isMocked || parsed.gcp?.isMocked || parsed.oracle?.isMocked;
          
          if (!hasMocks && parsed.timestamp && (Date.now() - parsed.timestamp < CACHE_DURATION_MS)) {
            setAwsPricing(parsed.aws);
            setAzurePricing(parsed.azure);
            setGcpPricing(parsed.gcp);
            setOraclePricing(parsed.oracle);
            setExchangeRate(parsed.exchangeRate || 5.0);
            setCacheTime(new Date(parsed.timestamp).toLocaleTimeString() + " (LOCAL)");
            
            // Se o cache for bem recente (ex: < 5 min), podemos pular o fetch
            if (Date.now() - parsed.timestamp < 5 * 60 * 1000) {
              setIsLoading(false);
              onLoadingChange?.(false);
              return;
            }
          }
        } catch (e) {
          console.error("Local cache corrupt", e);
        }
      }

      try {
        const responses = await Promise.allSettled([
          fetch("/api/aws?service=storage").then(res => res.json()),
          fetch("/api/aws?service=egress").then(res => res.json()),
          fetch("/api/azure?service=storage").then(res => res.json()),
          fetch("/api/azure?service=egress").then(res => res.json()),
          fetch("/api/gcp?service=storage").then(res => res.json()),
          fetch("/api/gcp?service=egress").then(res => res.json()),
          fetch("/api/oracle?service=storage").then(res => res.json()),
          fetch("/api/oracle?service=egress").then(res => res.json()),
          fetch("https://open.er-api.com/v6/latest/USD").then(res => res.json()).catch(() => ({ rates: { BRL: 5.0 } }))
        ]);

        const getRes = (index: number) => responses[index].status === 'fulfilled' ? (responses[index] as PromiseFulfilledResult<any>).value : null;

        const awsStorageRes = getRes(0);
        const awsEgressRes = getRes(1);
        const azureStorageRes = getRes(2);
        const azureEgressRes = getRes(3);
        const gcpStorageRes = getRes(4);
        const gcpEgressRes = getRes(5);
        const oracleStorageRes = getRes(6);
        const oracleEgressRes = getRes(7);
        const exchangeRes = getRes(8);

        const isMocked = (res1: any, res2: any) => {
          if (!res1 || !res2) return true;
          return res1.status === "mock" || res2.status === "mock";
        };

        const newAws = {
          storage: awsStorageRes?.pricePerGB || 0.023,
          egress: awsEgressRes?.pricePerGB || 0.09,
          isMocked: isMocked(awsStorageRes, awsEgressRes),
        };
        const newAzure = {
          storage: azureStorageRes?.pricePerGB || 0.0184,
          egress: azureEgressRes?.pricePerGB || 0.087,
          isMocked: isMocked(azureStorageRes, azureEgressRes),
        };
        const newGcp = {
          storage: gcpStorageRes?.pricePerGB || 0.020,
          egress: gcpEgressRes?.pricePerGB || 0.085,
          isMocked: isMocked(gcpStorageRes, gcpEgressRes),
        };
        const newOracle = {
          storage: oracleStorageRes?.pricePerGB || 0.0255,
          egress: oracleEgressRes?.pricePerGB || 0.0085,
          isMocked: isMocked(oracleStorageRes, oracleEgressRes),
        };

        const newExchangeRate = exchangeRes?.rates?.BRL || 5.0;

        setAwsPricing(newAws);
        setAzurePricing(newAzure);
        setGcpPricing(newGcp);
        setOraclePricing(newOracle);
        setExchangeRate(newExchangeRate);

        // 2. Salvar no LocalStorage para a próxima visita ou fallback
        const now = Date.now();
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          aws: newAws,
          azure: newAzure,
          gcp: newGcp,
          oracle: newOracle,
          exchangeRate: newExchangeRate,
          timestamp: now
        }));

        const isRedisCached = [awsStorageRes, azureStorageRes, gcpStorageRes, oracleStorageRes].some(r => r?.status === "cached");
        setCacheTime(new Date(now).toLocaleTimeString() + (isRedisCached ? " (REDIS)" : " (LIVE)"));

      } catch (error) {
        console.error("Failed to fetch cloud pricing", error);
      } finally {
        setIsLoading(false);
        onLoadingChange?.(false);
      }
    }

    fetchPricing();
  }, []);

  const totalAWS = (projections.totalStorageGB * awsPricing.storage) + (projections.totalEgressGB * awsPricing.egress);
  const totalAzure = (projections.totalStorageGB * azurePricing.storage) + (projections.totalEgressGB * azurePricing.egress);
  const totalGcp = (projections.totalStorageGB * gcpPricing.storage) + (projections.totalEgressGB * gcpPricing.egress);
  const totalOracle = (projections.totalStorageGB * oraclePricing.storage) + (projections.totalEgressGB * oraclePricing.egress);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b-2 border-primary border-dashed pb-2">
        <h3 className="text-lg font-bold tracking-widest uppercase text-primary">{t('estimatedCosts')}</h3>
        {cacheTime && !isLoading && (
          <span className="text-xs font-bold tracking-widest uppercase px-2 py-1 bg-black text-primary border border-primary">
            {t('lastUpdated', { time: cacheTime })}
          </span>
        )}
      </div>

      {isLoading ? (
        !hideLoader && (
          <div className="flex justify-center items-center text-sm text-primary font-bold animate-pulse p-6 border border-primary bg-black tracking-widest uppercase">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {t('loadingPricing')}
          </div>
        )
      ) : (
        <>
          <TuiBanner className="mt-0">
            {t('sysInfoPricing', { rate: exchangeRate.toFixed(2) })}
          </TuiBanner>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <PricingCard
              providerCode="[AWS]"
              providerTitle={t('awsDetails')}
              totalUsd={totalAWS}
              totalBrl={totalAWS * exchangeRate}
              isMocked={awsPricing.isMocked}
              storageCostUsd={projections.totalStorageGB * awsPricing.storage}
              egressCostUsd={projections.totalEgressGB * awsPricing.egress}
              themeColor="orange"
            />

            <PricingCard
              providerCode="[AZR]"
              providerTitle={t('azureDetails')}
              totalUsd={totalAzure}
              totalBrl={totalAzure * exchangeRate}
              isMocked={azurePricing.isMocked}
              storageCostUsd={projections.totalStorageGB * azurePricing.storage}
              egressCostUsd={projections.totalEgressGB * azurePricing.egress}
              themeColor="blue"
            />

            <PricingCard
              providerCode="[GCP]"
              providerTitle={t('gcpDetails')}
              totalUsd={totalGcp}
              totalBrl={totalGcp * exchangeRate}
              isMocked={gcpPricing.isMocked}
              storageCostUsd={projections.totalStorageGB * gcpPricing.storage}
              egressCostUsd={projections.totalEgressGB * gcpPricing.egress}
              themeColor="green"
            />

            <PricingCard
              providerCode="[OCI]"
              providerTitle={t('oracleDetails')}
              totalUsd={totalOracle}
              totalBrl={totalOracle * exchangeRate}
              isMocked={oraclePricing.isMocked}
              storageCostUsd={projections.totalStorageGB * oraclePricing.storage}
              egressCostUsd={projections.totalEgressGB * oraclePricing.egress}
              themeColor="red"
            />
          </div>
        </>
      )}
    </div>
  );
}
