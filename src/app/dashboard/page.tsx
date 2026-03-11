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
    <main className="container mx-auto p-4 md:p-8 scanlines relative min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b-2 border-primary border-dashed pb-4 max-w-5xl mx-auto">
        <div>
          <h1 className="text-4xl font-bold tracking-tight uppercase">
            <span className="text-primary">{'>'}</span> {t('dashboardTitle')} <span className="animate-pulse font-black text-primary">_</span>
          </h1>
          <p className="text-muted-foreground mt-2 uppercase tracking-wide">
            $ {t('dashboardDesc')}
          </p>
        </div>
        <div className="bg-card border border-primary p-2">
          <LanguageSwitcher />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 max-w-5xl mx-auto">
        {/* Left Side: Inputs */}
        <section className="bg-black border-2 border-primary p-6 flex flex-col relative before:content-[''] before:absolute before:top-0 before:left-0 before:w-4 before:h-4 before:border-t-4 before:border-l-4 before:border-primary after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-4 after:h-4 after:border-b-4 after:border-r-4 after:border-primary">
          <h2 className="text-2xl font-bold mb-6 bg-primary text-primary-foreground self-start px-2 py-1 uppercase tracking-widest">
            {t('businessMetrics')}
          </h2>
          <MetricsForm metrics={metrics} onChange={handleMetricsChange} />

          <div className="mt-8 pt-4 mt-auto">
            <button
              onClick={() => setHasCalculated(true)}
              className="w-full bg-primary text-primary-foreground font-bold py-3 uppercase tracking-widest border-2 border-primary hover:bg-transparent hover:text-primary transition-colors focus:ring-0 focus:outline-none"
            >
              [ {t('calculateButton', { defaultValue: 'Calculate Projections' })} ]
            </button>
          </div>
        </section>

        {/* Right Side: Outputs */}
        <section className={`bg-black border-2 border-primary p-6 flex flex-col space-y-6 transition-all duration-500 uppercase before:content-[''] before:absolute before:top-0 before:right-0 before:w-4 before:h-4 before:border-t-4 before:border-r-4 before:border-primary after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-4 after:h-4 after:border-b-4 after:border-l-4 after:border-primary ${hasCalculated ? 'opacity-100 translate-y-0 relative' : 'opacity-0 translate-y-4 pointer-events-none absolute'}`}>
          {hasCalculated && (
            <>
              {isEstimating && (
                <div className="flex flex-col items-center justify-center p-12 text-primary animate-pulse h-full">
                  <div className="font-mono text-2xl mb-4 text-primary">
                    [################--]
                  </div>
                  <p className="font-bold tracking-widest uppercase">{t('loadingPricing')}</p>
                </div>
              )}

              {/* Invisível, mas no DOM para permitir que o Componente filho `CostEstimation` rode o effect dele */}
              <div className={`${isEstimating ? 'hidden' : 'block'} space-y-6`}>
                <h2 className="text-2xl font-bold mb-2 bg-primary text-primary-foreground self-start px-2 py-1 inline-block tracking-widest">
                  {t('technicalProjections')}
                </h2>

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

                <div className="border border-primary border-dashed my-6"></div>
                <h3 className="text-lg font-bold tracking-widest uppercase">{'>'} {t('monthlyAccumulation')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-secondary/20 border border rounded-lg">
                    <p className="text-sm text-muted-foreground font-medium flex items-center">
                      {t('monthlyEgress')} <InfoTooltip content={t('descEgress')} />
                    </p>
                    <p className="text-2xl font-black  text-secondary-foreground">{projections.totalEgressGB.toFixed(2)} GB</p>
                  </div>

                  <div className="p-4 bg-secondary/20 border rounded-lg">
                    <p className="text-sm text-muted-foreground font-medium flex items-center">
                      {t('dbStorage')} <InfoTooltip content={t('descStorage')} />
                    </p>
                    <p className="text-2xl font-black text-secondary-foreground">{projections.totalStorageGB.toFixed(2)} GB</p>
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
