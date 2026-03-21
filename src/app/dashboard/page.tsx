"use client";

import Link from "next/link";

import { useState, useMemo, useRef } from "react";
import { useTranslation } from "@/lib/i18n/I18nContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { MetricsForm } from "@/components/forms/MetricsForm";
import { CostEstimation } from "@/components/charts/CostEstimation";
import { calculateInfrastructure } from "@/lib/core/engine";
import type { BusinessMetrics } from "@/types";
import { TuiSection } from "@/components/ui/TuiSection";
import { TuiDataBox } from "@/components/ui/TuiDataBox";
import { TuiButton } from "@/components/ui/TuiButton";
import { TuiLoading } from "@/components/ui/TuiLoading";
import { ExportPDFButton } from "@/components/ui/ExportPDFButton";
import { StorageEvolutionChart } from "@/components/charts/StorageEvolutionChart";
import { ArchitectureAI } from "@/components/ArchitectureAI";
import { PeakComparisonChart } from "@/components/charts/PeakComparisonChart";
import { InfoTooltip } from "@/components/InfoTooltip";

import { LayoutGrid, BarChart2, Server, Terminal, Calculator } from "lucide-react";

export default function DashboardPage() {
  const { t, formatNumber, formatDataSize, getStorageDetails } = useTranslation();

  const [metrics, setMetrics] = useState<BusinessMetrics>({
    DAU: 1250000,
    RequestsPerUser: 42,
    PeakFactor: 2.0,
    ReadRatioPercentage: 80,
    WriteRatioPercentage: 20,
    AvgPayloadSizeBytes: 500,
    AvgResponseSizeBytes: 2048,
    RetentionDays: 30,
    ReplicationFactor: 3,
  });

  const handleMetricsChange = (newMetrics: BusinessMetrics) => {
    setMetrics(newMetrics);
    setHasCalculated(false); 
  }

  const [hasCalculated, setHasCalculated] = useState(false);
  const [isEstimating, setIsEstimating] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [pricingData, setPricingData] = useState<any>(null);
  const resultsRef = useRef<HTMLElement>(null);

  const activeMetrics = metrics;
  const projections = useMemo(() => calculateInfrastructure(activeMetrics), [activeMetrics]);
  const normalProjections = useMemo(() => calculateInfrastructure({ ...activeMetrics, PeakFactor: 1.0 }), [activeMetrics]);

  return (
    <main id="pdf-report-content" className={`min-h-screen uppercase flex flex-col relative overflow-x-hidden mx-auto border-x border-terminal-tertiary/20 transition-all duration-700 ease-in-out px-4 md:px-0 w-full ${hasCalculated ? 'max-w-[1400px]' : 'md:max-w-4xl'}`}>
      
      <header className="flex justify-between items-center p-4 border-b border-terminal-tertiary/30 bg-terminal-neutral/50 backdrop-blur-sm z-10 sticky top-0">
        <h1 className="text-xl tracking-widest font-bold drop-shadow-[0_0_8px_rgba(0,255,0,0.8)]">
          INFRALYZER_DB <span className="animate-pulse">_</span>
        </h1>
        <div className="text-terminal-primary scale-90 origin-right">
          <LanguageSwitcher />
        </div>
      </header>

      <div className="bg-terminal-secondary py-2 px-4 flex flex-col gap-1 border-b border-terminal-tertiary/30">
        <div className="text-[10px] text-muted-foreground tracking-widest font-mono">SYSTEM STATUS</div>
        <div className="flex justify-between items-center">
          <div className="text-sm font-bold tracking-widest">PROJECTION_CMD</div>
          <div className="flex items-center gap-2 text-xs">
            <span className="tracking-widest">LIVE_FEED</span>
            <div className="w-2 h-2 rounded-full bg-terminal-primary animate-pulse shadow-[0_0_5px_rgba(0,255,0,0.8)]"></div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 pb-24 flex flex-col gap-6">

      <div className={`grid grid-cols-1 w-full items-start gap-6 transition-all duration-700 ${hasCalculated ? 'xl:grid-cols-2' : ''}`}>
        {/* Left Side: Inputs */}
        <TuiSection title={t('businessMetrics')} variant="left">
          


          <MetricsForm metrics={metrics} onChange={handleMetricsChange} />

          <div className="mt-8 pt-4 mt-auto border-t border-terminal-tertiary/30 border-dashed">
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
              className="w-full py-5 text-lg flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <span>[ {isCalculating ? t('processingButton') : t('calculateButton', { defaultValue: 'Calculate Projections' })} ]</span>
              {!isCalculating && <Calculator size={20} />}
            </TuiButton>
          </div>
        </TuiSection>
        {/* Right Side: Outputs */}
        <TuiSection
          variant="right"
          sectionRef={resultsRef}
          className={`transition-all duration-700 uppercase ${hasCalculated ? 'opacity-100 translate-y-0 relative mt-8 xl:mt-0' : 'opacity-0 translate-y-4 pointer-events-none absolute'}`}
        >
          {hasCalculated && (
            <>
              {(isCalculating || isEstimating) && (
                <TuiLoading message={isCalculating ? t('processingData') : t('loadingPricing')} />
              )}

              {/* Invisível, mas no DOM para permitir que o Componente filho `CostEstimation` rode o effect dele */}
              <div className={`${isCalculating || isEstimating ? 'hidden' : 'block'} space-y-6`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <h2 className="text-sm font-bold tracking-widest mb-6 flex items-center gap-2 uppercase">
                    <span className="text-terminal-primary drop-shadow-[0_0_5px_rgba(0,255,0,0.5)]">{'>'}</span> 
                    [ {t('technicalProjections')} ]
                  </h2>
                  <div>
                      <ExportPDFButton 
                        filename="infralyzer-report.pdf" 
                        metrics={activeMetrics}
                        scenarios={[metrics]}
                        projections={projections} 
                        pricingData={pricingData} 
                      />
                  </div>
                </div>



                <div className="space-y-6 bg-terminal-black p-4 -mx-4 border border-terminal-tertiary/20">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <TuiDataBox
                      label={t('avgQPS')}
                      value={formatNumber(Math.round(projections.avgQPS))}
                      infoText={t('descAvgQPS')}
                    />
                    <TuiDataBox 
                      label={t('peakQPS')} 
                      value={formatNumber(Math.round(projections.peakQPS))} 
                      infoText={t('descPeakQPS')}
                      subValue={(activeMetrics.PeakFactor || 1) > 1.0 ? `+${formatNumber(Math.round(projections.peakQPS - normalProjections.peakQPS))} vs Normal` : undefined}
                    />
                    <TuiDataBox 
                      label={t('readQPS')} 
                      value={formatNumber(Math.round(projections.readQPS))} 
                      infoText={t('descReadQPS')} 
                      largeValue={false}
                      subValue={(activeMetrics.PeakFactor || 1) > 1.0 ? `Peak: ~${formatNumber(Math.round(projections.readQPS * (activeMetrics.PeakFactor || 1)))}` : undefined}
                    />
                    <TuiDataBox 
                      label={t('writeQPS')} 
                      value={formatNumber(Math.round(projections.writeQPS))} 
                      infoText={t('descWriteQPS')} 
                      largeValue={false}
                      subValue={(activeMetrics.PeakFactor || 1) > 1.0 ? `Peak: ~${formatNumber(Math.round(projections.writeQPS * (activeMetrics.PeakFactor || 1)))}` : undefined}
                    />
                  </div>

                  <div className="border border-terminal-tertiary/30 border-dashed my-6"></div>
                  <h3 className="text-sm font-bold tracking-widest uppercase flex items-center gap-2">
                    <span className="text-terminal-primary drop-shadow-[0_0_5px_rgba(0,255,0,0.5)]">{'>'}</span> 
                    [ {t('monthlyAccumulation')} ]
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <TuiDataBox
                      label={t('monthlyEgress')}
                      value={
                        <InfoTooltip content={getStorageDetails(projections.totalEgressGB)}>
                          <span className="cursor-help border-b border-terminal-primary/30 border-dashed hover:border-terminal-primary transition-colors">{formatDataSize(projections.totalEgressGB)}</span>
                        </InfoTooltip>
                      }
                      infoText={t('descEgress')}
                    />
                    <TuiDataBox
                      label={t('dbStorage')}
                      value={
                        <InfoTooltip content={getStorageDetails(projections.totalStorageGB)}>
                          <span className="cursor-help border-b border-terminal-primary/30 border-dashed hover:border-terminal-primary transition-colors">{formatDataSize(projections.totalStorageGB)}</span>
                        </InfoTooltip>
                      }
                      infoText={t('descStorage')}
                    />
                  </div>

                  <PeakComparisonChart metrics={activeMetrics} projections={projections} />
                  <StorageEvolutionChart metrics={activeMetrics} projections={projections} />
                  <ArchitectureAI metrics={activeMetrics} projections={projections} />

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
      </div>

      <footer className="mt-auto bg-terminal-black border-t border-terminal-primary/30 p-8 flex flex-col md:flex-row justify-between items-center text-[10px] font-bold text-terminal-primary/60 tracking-widest uppercase gap-4 md:gap-0">
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6">
          <span>© 2026 INFRALYZER - VERSION 1.0.0</span>
          <Link href="/design-system" className="hover:text-terminal-primary transition-colors flex items-center gap-1 group">
            <span className="text-terminal-primary drop-shadow-[0_0_5px_rgba(0,255,0,0.5)]">[</span>
            <span className="group-hover:text-terminal-primary transition-colors">DESIGN SYSTEM</span>
            <span className="text-terminal-primary drop-shadow-[0_0_5px_rgba(0,255,0,0.5)]">]</span>
          </Link>
        </div>
        <div>
          <a
            href="https://github.com/matheusjfa"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-terminal-primary transition-colors flex items-center gap-2"
          >
            <span className="text-terminal-primary drop-shadow-[0_0_5px_rgba(0,255,0,0.5)]">{'>'}</span> DEVELOPED BY MATHEUSJFA
          </a>
        </div>
      </footer>
    </main>
  );
}
