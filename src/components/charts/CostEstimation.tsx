"use client"

import { useEffect, useState } from "react"
import { useTranslation } from "@/lib/i18n/I18nContext"
import type { InfrastructureProjections } from "@/types"

interface CostEstimationProps {
  projections: InfrastructureProjections;
  onLoadingChange?: (loading: boolean) => void;
  hideLoader?: boolean;
}

interface PricingData {
  storage: number;
  egress: number;
}

export function CostEstimation({ projections, onLoadingChange, hideLoader = false }: CostEstimationProps) {
  const { t } = useTranslation();
  const [awsPricing, setAwsPricing] = useState<PricingData>({ storage: 0, egress: 0 });
  const [azurePricing, setAzurePricing] = useState<PricingData>({ storage: 0, egress: 0 });
  const [gcpPricing, setGcpPricing] = useState<PricingData>({ storage: 0, egress: 0 });
  const [oraclePricing, setOraclePricing] = useState<PricingData>({ storage: 0, egress: 0 });
  const [exchangeRate, setExchangeRate] = useState<number>(5.0);
  const [isLoading, setIsLoading] = useState(true);
  const [cacheTime, setCacheTime] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPricing() {
      setIsLoading(true);
      onLoadingChange?.(true);
      try {
        const CACHE_KEY = "infralyze_cloud_pricing_cache";
        const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.timestamp && (Date.now() - parsed.timestamp < CACHE_DURATION_MS)) {
            setAwsPricing(parsed.aws);
            setAzurePricing(parsed.azure);
            setGcpPricing(parsed.gcp);
            setOraclePricing(parsed.oracle);
            if (parsed.exchangeRate) setExchangeRate(parsed.exchangeRate);
            setCacheTime(new Date(parsed.timestamp).toLocaleString());
            setIsLoading(false);
            onLoadingChange?.(false);
            return;
          }
        }
        const [
          awsStorageRes, awsEgressRes,
          azureStorageRes, azureEgressRes,
          gcpStorageRes, gcpEgressRes,
          oracleStorageRes, oracleEgressRes,
          exchangeRes
        ] = await Promise.all([
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

        const newAws = {
          storage: awsStorageRes.pricePerGB || 0.023,
          egress: awsEgressRes.pricePerGB || 0.09,
        };
        const newAzure = {
          storage: azureStorageRes.pricePerGB || 0.0184,
          egress: azureEgressRes.pricePerGB || 0.087,
        };
        const newGcp = {
          storage: gcpStorageRes.pricePerGB || 0.020,
          egress: gcpEgressRes.pricePerGB || 0.085,
        };
        const newOracle = {
          storage: oracleStorageRes.pricePerGB || 0.0255,
          egress: oracleEgressRes.pricePerGB || 0.0085,
        };

        setAwsPricing(newAws);
        setAzurePricing(newAzure);
        setGcpPricing(newGcp);
        setOraclePricing(newOracle);

        const newExchangeRate = exchangeRes?.rates?.BRL || 5.0;
        setExchangeRate(newExchangeRate);

        const now = Date.now();
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          aws: newAws, azure: newAzure, gcp: newGcp, oracle: newOracle, exchangeRate: newExchangeRate, timestamp: now
        }));
        setCacheTime(new Date(now).toLocaleString());
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
          <div className="mb-4 p-3 bg-black border border-primary border-dashed text-xl text-primary font-bold tracking-widest uppercase mt-4">
            {t('sysInfoPricing', { rate: exchangeRate.toFixed(2) })}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* AWS Card */}
            <div className="p-4 bg-black border-2 border-orange-500 relative group uppercase">
              <div className="absolute top-0 right-0 p-3 text-orange-500/20 font-bold text-4xl group-hover:text-orange-500/40 transition-colors pointer-events-none">
                [AWS]
              </div>
              <p className="text-sm text-orange-500/70 font-bold tracking-widest mb-1">{t('awsDetails')}</p>
              <div className="mb-4">
                <p className="text-3xl font-black text-orange-500">
                  ${totalAWS.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  <span className="text-sm font-bold text-orange-500/70 tracking-widest"> {t('mo')}</span>
                </p>
                <p className="text-lg font-bold text-orange-500/80">
                  ~ R$ {(totalAWS * exchangeRate).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              
              <div className="space-y-1 text-sm border-t-2 border-orange-500 border-dashed pt-3">
                <div className="flex justify-between text-orange-500/90">
                  <span className="tracking-widest">{t('storageCost')}</span>
                  <span className="font-bold">${(projections.totalStorageGB * awsPricing.storage).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-orange-500/90">
                  <span className="tracking-widest">{t('dataEgress')}</span>
                  <span className="font-bold">${(projections.totalEgressGB * awsPricing.egress).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Azure Card */}
            <div className="p-4 bg-black border-2 border-blue-500 relative group uppercase">
              <div className="absolute top-0 right-0 p-3 text-blue-500/20 font-bold text-4xl group-hover:text-blue-500/40 transition-colors pointer-events-none">
                [AZR]
              </div>
              <p className="text-sm text-blue-500/70 font-bold tracking-widest mb-1">{t('azureDetails')}</p>
              <div className="mb-4">
                <p className="text-3xl font-black text-blue-500">
                  ${totalAzure.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  <span className="text-sm font-bold text-blue-500/70 tracking-widest"> {t('mo')}</span>
                </p>
                <p className="text-lg font-bold text-blue-500/80">
                  ~ R$ {(totalAzure * exchangeRate).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              <div className="space-y-1 text-sm border-t-2 border-blue-500 border-dashed pt-3">
                <div className="flex justify-between text-blue-500/90">
                  <span className="tracking-widest">{t('storageCost')}</span>
                  <span className="font-bold">${(projections.totalStorageGB * azurePricing.storage).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-blue-500/90">
                  <span className="tracking-widest">{t('dataEgress')}</span>
                  <span className="font-bold">${(projections.totalEgressGB * azurePricing.egress).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* GCP Card */}
            <div className="p-4 bg-black border-2 border-green-500 relative group uppercase">
              <div className="absolute top-0 right-0 p-3 text-green-500/20 font-bold text-4xl group-hover:text-green-500/40 transition-colors pointer-events-none">
                [GCP]
              </div>
              <p className="text-sm text-green-500/70 font-bold tracking-widest mb-1">{t('gcpDetails')}</p>
              <div className="mb-4">
                <p className="text-3xl font-black text-green-500">
                  ${totalGcp.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  <span className="text-sm font-bold text-green-500/70 tracking-widest"> {t('mo')}</span>
                </p>
                <p className="text-lg font-bold text-green-500/80">
                  ~ R$ {(totalGcp * exchangeRate).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

              <div className="space-y-1 text-sm border-t-2 border-green-500 border-dashed pt-3">
                <div className="flex justify-between text-green-500/90">
                  <span className="tracking-widest">{t('storageCost')}</span>
                  <span className="font-bold">${(projections.totalStorageGB * gcpPricing.storage).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-green-500/90">
                  <span className="tracking-widest">{t('dataEgress')}</span>
                  <span className="font-bold">${(projections.totalEgressGB * gcpPricing.egress).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Oracle Card */}
            <div className="p-4 bg-black border-2 border-red-500 relative group uppercase">
              <div className="absolute top-0 right-0 p-3 text-red-500/20 font-bold text-4xl group-hover:text-red-500/40 transition-colors pointer-events-none">
                [OCI]
              </div>
              <p className="text-sm text-red-500/70 font-bold tracking-widest mb-1">{t('oracleDetails')}</p>
              <div className="mb-4">
                <p className="text-3xl font-black text-red-500">
                  ${totalOracle.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  <span className="text-sm font-bold text-red-500/70 tracking-widest"> {t('mo')}</span>
                </p>
                <p className="text-lg font-bold text-red-500/80">
                  ~ R$ {(totalOracle * exchangeRate).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>

            <div className="space-y-1 text-sm border-t-2 border-red-500 border-dashed pt-3">
              <div className="flex justify-between text-red-500/90">
                <span className="tracking-widest">{t('storageCost')}</span>
                <span className="font-bold">${(projections.totalStorageGB * oraclePricing.storage).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-red-500/90">
                <span className="tracking-widest">{t('dataEgress')}</span>
                <span className="font-bold">${(projections.totalEgressGB * oraclePricing.egress).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>
        </>
      )}
    </div>
  );
}
