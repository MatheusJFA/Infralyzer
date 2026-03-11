"use client";

import { useState, useMemo } from "react";
import { useTranslation } from "@/lib/i18n/I18nContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { MetricsForm } from "@/components/forms/MetricsForm";
import { CostEstimation } from "@/components/charts/CostEstimation";
import { InfoTooltip } from "@/components/InfoTooltip";
import { calculateInfrastructure } from "@/lib/core/engine";
import type { BusinessMetrics } from "@/types";

export default function DashboardPage() {
  const { t } = useTranslation();

  const [metrics, setMetrics] = useState<BusinessMetrics>({
    DAU: 100000,
    RequestsPerUser: 50,
    PeakFactor: 2.0,
    ReadRatioPercentage: 80,
    WriteRatioPercentage: 20,
    AvgPayloadSizeBytes: 500, // 500 bytes per write
    AvgResponseSizeBytes: 2048, // 2 KB per read
    RetentionDays: 30,
    ReplicationFactor: 3,
  });

  const [hasCalculated, setHasCalculated] = useState(false);
  const [isEstimating, setIsEstimating] = useState(false);

  const projections = useMemo(() => calculateInfrastructure(metrics), [metrics]);

  const handleMetricsChange = (newMetrics: BusinessMetrics) => {
    setMetrics(newMetrics);
    setHasCalculated(false); // Esconde resultados quando altera as specs
  }

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">{t('dashboardTitle')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('dashboardDesc')}
          </p>
        </div>
        <LanguageSwitcher />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: Inputs */}
        <section className="bg-card border rounded-xl p-6 shadow-sm flex flex-col">
          <h2 className="text-2xl font-bold mb-6">{t('businessMetrics')}</h2>
          <MetricsForm metrics={metrics} onChange={handleMetricsChange} />

          <div className="mt-8 pt-4 mt-auto">
            <button
              onClick={() => setHasCalculated(true)}
              className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg shadow-sm hover:bg-primary/90 transition-colors focus:ring-2 focus:ring-ring focus:outline-none"
            >
              {t('calculateButton', { defaultValue: 'Calculate Projections' })}
            </button>
          </div>
        </section>

        {/* Right Side: Outputs */}
        <section className={`bg-card border rounded-xl p-6 shadow-sm flex flex-col space-y-6 transition-all duration-500 ${hasCalculated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          {hasCalculated && (
            <>
              {isEstimating && (
                <div className="flex flex-col items-center justify-center p-12 text-primary animate-pulse h-full">
                  <svg className="animate-spin h-8 w-8 mb-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="font-semibold">{t('loadingPricing')}</p>
                </div>
              )}

              {/* Invisível, mas no DOM para permitir que o Componente filho `CostEstimation` rode o effect dele */}
              <div className={`${isEstimating ? 'hidden' : 'block'} space-y-6`}>
                <h2 className="text-2xl font-bold mb-2">{t('technicalProjections')}</h2>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/50 border rounded-lg">
                    <p className="text-sm text-muted-foreground font-medium flex items-center">
                      {t('avgQPS')} <InfoTooltip content={t('descAvgQPS')} />
                    </p>
                    <p className="text-2xl font-black">{Math.round(projections.avgQPS).toLocaleString()}</p>
                  </div>

                  <div className="p-4 bg-muted/50 border rounded-lg">
                    <p className="text-sm text-muted-foreground font-medium flex items-center">
                      {t('peakQPS')} <InfoTooltip content={t('descPeakQPS')} />
                    </p>
                    <p className="text-2xl font-black text-primary">{Math.round(projections.peakQPS).toLocaleString()}</p>
                  </div>

                  <div className="p-4 bg-muted/50 border rounded-lg">
                    <p className="text-sm text-muted-foreground font-medium flex items-center">
                      {t('readQPS')} <InfoTooltip content={t('descReadQPS')} />
                    </p>
                    <p className="text-xl font-bold">{Math.round(projections.readQPS).toLocaleString()}</p>
                  </div>

                  <div className="p-4 bg-muted/50 border rounded-lg">
                    <p className="text-sm text-muted-foreground font-medium flex items-center">
                      {t('writeQPS')} <InfoTooltip content={t('descWriteQPS')} />
                    </p>
                    <p className="text-xl font-bold">{Math.round(projections.writeQPS).toLocaleString()}</p>
                  </div>
                </div>

                <h3 className="text-lg font-semibold mt-6 border-b pb-2">{t('monthlyAccumulation')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-secondary/20 border border-secondary/30 rounded-lg">
                    <p className="text-sm text-muted-foreground font-medium flex items-center">
                      {t('monthlyEgress')} <InfoTooltip content={t('descEgress')} />
                    </p>
                    <p className="text-2xl font-black text-accent-foreground">{projections.totalEgressGB.toFixed(2)} GB</p>
                  </div>

                  <div className="p-4 bg-secondary/20 border border-secondary/30 rounded-lg">
                    <p className="text-sm text-muted-foreground font-medium flex items-center">
                      {t('dbStorage')} <InfoTooltip content={t('descStorage')} />
                    </p>
                    <p className="text-2xl font-black text-accent-foreground">{projections.totalStorageGB.toFixed(2)} GB</p>
                  </div>
                </div>

                <div className="pt-4">
                  <CostEstimation
                    projections={projections}
                    hideLoader
                    onLoadingChange={setIsEstimating}
                  />
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
