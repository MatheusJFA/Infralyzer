"use client";

import { useState, useMemo, useRef } from "react";
import { useTranslation } from "@/lib/i18n/I18nContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { MetricsForm } from "@/components/forms/MetricsForm";
import { CostEstimation } from "@/components/charts/CostEstimation";
import { InfoTooltip } from "@/components/InfoTooltip";
import { calculateInfrastructure } from "@/lib/core/engine";
import type { BusinessMetrics } from "@/types";
import { TuiSection } from "@/components/ui/TuiSection";
import { TuiDataBox } from "@/components/ui/TuiDataBox";
import { TuiButton } from "@/components/ui/TuiButton";
import { TuiLoading } from "@/components/ui/TuiLoading";
import { ExportPDFButton } from "@/components/ui/ExportPDFButton";

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
  const [isCalculating, setIsCalculating] = useState(false);
  const [pricingData, setPricingData] = useState<any>(null);
  const resultsRef = useRef<HTMLElement>(null);

  const projections = useMemo(() => calculateInfrastructure(metrics), [metrics]);

  const handleMetricsChange = (newMetrics: BusinessMetrics) => {
    setMetrics(newMetrics);
    setHasCalculated(false); // Esconde resultados quando altera as specs
  }

  return (
    <main id="pdf-report-content" className="container mx-auto p-4 md:p-8 scanlines relative min-h-screen bg-black">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b-2 border-primary border-dashed pb-4 max-w-5xl mx-auto">
        <div>
          <h1 className="text-4xl font-bold tracking-tight uppercase">
            <span className="text-primary">{'>'}</span> {t('dashboardTitle')} <span className="animate-pulse font-black text-primary">_</span>
          </h1>
          <p className="text-muted-foreground mt-2 uppercase tracking-wide">
            $ {t('dashboardDesc')}
          </p>
        </div>
        <div className="bg-card border border-primary p-2" data-html2canvas-ignore="true">
          <LanguageSwitcher />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 max-w-5xl mx-auto">
        {/* Left Side: Inputs */}
        <TuiSection title={t('businessMetrics')} variant="left">
          <MetricsForm metrics={metrics} onChange={handleMetricsChange} />

          <div className="mt-8 pt-4 mt-auto" data-html2canvas-ignore="true">
            <TuiButton
              onClick={() => {
                if (isCalculating) return;
                setIsCalculating(true);
                setHasCalculated(true);
                setTimeout(() => {
                  resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
                setTimeout(() => {
                  setIsCalculating(false);
                }, 2000);
              }}
              loading={isCalculating}
            >
              {isCalculating ? t('processingButton') : t('calculateButton', { defaultValue: 'Calculate Projections' })}
            </TuiButton>
          </div>
        </TuiSection>

        {/* Right Side: Outputs */}
        <TuiSection 
          variant="right" 
          sectionRef={resultsRef} 
          className={`transition-all duration-500 uppercase ${hasCalculated ? 'opacity-100 translate-y-0 relative mt-8' : 'opacity-0 translate-y-4 pointer-events-none absolute'}`}
        >
          {hasCalculated && (
            <>
              {(isCalculating || isEstimating) && (
                <TuiLoading message={isCalculating ? t('processingData') : t('loadingPricing')} />
              )}

              {/* Invisível, mas no DOM para permitir que o Componente filho `CostEstimation` rode o effect dele */}
              <div className={`${isCalculating || isEstimating ? 'hidden' : 'block'} space-y-6`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <h2 className="text-2xl font-bold mb-2 bg-primary text-primary-foreground self-start px-2 py-1 inline-block tracking-widest leading-none">
                    {t('technicalProjections')}
                  </h2>
                  <div data-html2canvas-ignore="true">
                    <ExportPDFButton 
                      filename="infralyzer-report.pdf" 
                      metrics={metrics} 
                      projections={projections} 
                      pricingData={pricingData} 
                    />
                  </div>
                </div>
                
                <div className="space-y-6 bg-black p-4 -mx-4 rounded border-2 border-transparent">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <TuiDataBox 
                      label={t('avgQPS')} 
                      value={Math.round(projections.avgQPS).toLocaleString()} 
                      infoText={t('descAvgQPS')} 
                    />
                    <TuiDataBox 
                      label={t('peakQPS')} 
                      value={Math.round(projections.peakQPS).toLocaleString()} 
                      infoText={t('descPeakQPS')} 
                    />
                    <TuiDataBox 
                      label={t('readQPS')} 
                      value={Math.round(projections.readQPS).toLocaleString()} 
                      infoText={t('descReadQPS')} 
                      largeValue={false}
                    />
                    <TuiDataBox 
                      label={t('writeQPS')} 
                      value={Math.round(projections.writeQPS).toLocaleString()} 
                      infoText={t('descWriteQPS')} 
                      largeValue={false}
                    />
                  </div>

                  <div className="border border-primary border-dashed my-6"></div>
                  <h3 className="text-lg font-bold tracking-widest uppercase">{'>'} {t('monthlyAccumulation')}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <TuiDataBox 
                      label={t('monthlyEgress')} 
                      value={`${projections.totalEgressGB.toFixed(2)} GB`} 
                      infoText={t('descEgress')} 
                    />
                    <TuiDataBox 
                      label={t('dbStorage')} 
                      value={`${projections.totalStorageGB.toFixed(2)} GB`} 
                      infoText={t('descStorage')} 
                    />
                  </div>

                  <div className="pt-4">
                    <CostEstimation
                      projections={projections}
                      hideLoader
                      onLoadingChange={setIsEstimating}
                      onPricingLoaded={setPricingData}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </TuiSection>
      </div>
    </main>
  );
}
