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
  onPricingLoaded?: (data: any) => void;
}

interface PricingData {
  storage: number;
  egress: number;
  isMocked: boolean;
}

const PROVIDERS = [
  { id: 'aws', code: '[AWS]', titleKey: 'awsDetails', defaultStorage: 0.023, defaultEgress: 0.09, color: 'orange' as const },
  { id: 'azure', code: '[AZR]', titleKey: 'azureDetails', defaultStorage: 0.0184, defaultEgress: 0.087, color: 'blue' as const },
  { id: 'gcp', code: '[GCP]', titleKey: 'gcpDetails', defaultStorage: 0.020, defaultEgress: 0.085, color: 'green' as const },
  { id: 'oracle', code: '[OCI]', titleKey: 'oracleDetails', defaultStorage: 0.0255, defaultEgress: 0.0085, color: 'red' as const },
];

export function CostEstimation({ projections, onLoadingChange, onPricingLoaded, hideLoader = false }: CostEstimationProps) {
  const { t } = useTranslation();
  
  const [pricing, setPricing] = useState<Record<string, PricingData>>(
    Object.fromEntries(PROVIDERS.map(p => [p.id, { storage: 0, egress: 0, isMocked: true }]))
  );
  const [exchangeRate, setExchangeRate] = useState<number>(5.0);
  const [isLoading, setIsLoading] = useState(true);
  const [cacheTime, setCacheTime] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPricing() {
      const CACHE_KEY = "Infralyzer_local_pricing_fallback";
      const CACHE_DURATION_MS = 3 * 60 * 60 * 1000;

      setIsLoading(true);
      onLoadingChange?.(true);

      const localCached = localStorage.getItem(CACHE_KEY);
      if (localCached) {
        try {
          const parsed = JSON.parse(localCached);
          const hasMocks = PROVIDERS.some(p => parsed[p.id]?.isMocked);
          
          if (!hasMocks && parsed.timestamp && (Date.now() - parsed.timestamp < CACHE_DURATION_MS)) {
            const loadedPricing: Record<string, PricingData> = {};
            PROVIDERS.forEach(p => loadedPricing[p.id] = parsed[p.id]);
            setPricing(loadedPricing);
            setExchangeRate(parsed.exchangeRate || 5.0);
            setCacheTime(new Date(parsed.timestamp).toLocaleTimeString() + " (LOCAL)");
            
            if (Date.now() - parsed.timestamp < 5 * 60 * 1000) {
              onPricingLoaded?.(parsed);
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
        const fetchPromises = PROVIDERS.flatMap(p => [
          fetch(`/api/${p.id}?service=storage`).then(res => res.json()),
          fetch(`/api/${p.id}?service=egress`).then(res => res.json())
        ]);
        
        const responses = await Promise.allSettled([...fetchPromises, fetch("https://open.er-api.com/v6/latest/USD").then(res => res.json()).catch(() => ({ rates: { BRL: 5.0 } }))]);

        const getRes = (index: number) => responses[index].status === 'fulfilled' ? (responses[index] as PromiseFulfilledResult<any>).value : null;
        const isMocked = (res1: any, res2: any) => !res1 || !res2 || res1.status === "mock" || res2.status === "mock";
        
        const newPricing: Record<string, PricingData> = {};
        let isRedisCached = false;
        
        PROVIDERS.forEach((p, idx) => {
          const storageRes = getRes(idx * 2);
          const egressRes = getRes(idx * 2 + 1);
          newPricing[p.id] = {
            storage: storageRes?.pricePerGB || p.defaultStorage,
            egress: egressRes?.pricePerGB || p.defaultEgress,
            isMocked: isMocked(storageRes, egressRes)
          };
          if (storageRes?.status === "cached") isRedisCached = true;
        });

        const exchangeRes = getRes(PROVIDERS.length * 2);
        const newExchangeRate = exchangeRes?.rates?.BRL || 5.0;

        setPricing(newPricing);
        setExchangeRate(newExchangeRate);

        const now = Date.now();
        const cacheData = { ...newPricing, exchangeRate: newExchangeRate, timestamp: now };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));

        setCacheTime(new Date(now).toLocaleTimeString() + (isRedisCached ? " (REDIS)" : " (LIVE)"));
        onPricingLoaded?.(cacheData);

      } catch (error) {
        console.error("Failed to fetch cloud pricing", error);
      } finally {
        setIsLoading(false);
        onLoadingChange?.(false);
      }
    }

    fetchPricing();
  }, []);

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

      {isLoading && !hideLoader ? (
        <div className="flex justify-center items-center text-sm text-primary font-bold animate-pulse p-6 border border-primary bg-black tracking-widest uppercase">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {t('loadingPricing')}
        </div>
      ) : (
        <>
          <TuiBanner className="mt-0">
            {t('sysInfoPricing', { rate: exchangeRate.toFixed(2) })}
          </TuiBanner>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PROVIDERS.map(p => {
              const data = pricing[p.id];
              const totalUsd = (projections.totalStorageGB * data.storage) + (projections.totalEgressGB * data.egress);
              return (
                <PricingCard
                  key={p.id}
                  providerCode={p.code}
                  providerTitle={t(p.titleKey as any)}
                  totalUsd={totalUsd}
                  totalBrl={totalUsd * exchangeRate}
                  isMocked={data.isMocked}
                  storageCostUsd={projections.totalStorageGB * data.storage}
                  egressCostUsd={projections.totalEgressGB * data.egress}
                  themeColor={p.color as any}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
