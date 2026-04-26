import React from 'react';
import { useTranslation } from "@/lib/i18n/I18nContext";
import type { BusinessMetrics, InfrastructureProjections } from '@/types';
import { Info, Zap, Server, Database } from 'lucide-react';
import { InfoTooltip } from "@/components/InfoTooltip";

interface TermInfo {
  word: string;
  hint: string;
}

interface InsightItem {
  icon: React.ReactNode;
  title: string;
  desc: string;
  terms?: TermInfo[];
}

interface ArchitectureAIProps {
  metrics: BusinessMetrics;
  projections: InfrastructureProjections;
}

export function ArchitectureAI({ metrics, projections }: ArchitectureAIProps) {
  const { t } = useTranslation();

  const getInsights = (): InsightItem[] => {
    const insights: InsightItem[] = [];

    // Baseline Insight
    if (projections.peakQPS < 1000) {
      insights.push({
        icon: <Zap size={18} className="text-paper-primary/50" />,
        title: t('aiStdTitle' as any),
        desc: t('aiStdDesc' as any),
      });
    }

    const isReadHeavy = metrics.ReadRatioPercentage >= 70;
    const isWriteHeavy = metrics.WriteRatioPercentage >= 60;

    if (isReadHeavy) {
      insights.push({
        icon: <Database size={18} className="text-paper-primary/60" />,
        title: t('aiReadHeavyTitle' as any),
        desc: t('aiReadHeavyDesc' as any),
        terms: [
          { word: "Database Replication", hint: t('tooltipReplication' as any) },
          { word: "Read Replicas", hint: t('tooltipReadReplicas' as any) },
          { word: "Redis", hint: t('aiCacheTitle' as any) }
        ]
      })
    }

    if (isWriteHeavy) {
      insights.push({
        icon: <Database size={18} className="text-paper-primary/80" />,
        title: t('aiWriteHeavyTitle' as any),
        desc: t('aiWriteHeavyDesc' as any),
        terms: [
          { word: "Sharding", hint: t('tooltipSharding' as any) },
          { word: "Partitioning", hint: t('tooltipPartitioning' as any) },
          { word: "NoSQL", hint: "Database approach designed for unstructured or highly-scalable inserts." }
        ]
      })
    }

    // Caching
    if (metrics.ReadRatioPercentage >= 75 && projections.peakQPS > 5000) {
      insights.push({
        icon: <Zap size={18} className="text-paper-primary" />,
        title: t('aiCacheTitle' as any),
        desc: t('aiCacheDesc' as any),
      });
    }

    // High Write Storage
    if (metrics.WriteRatioPercentage >= 50 && projections.totalStorageGB > 2000) {
      insights.push({
        icon: <Server size={18} className="text-paper-primary/90" />,
        title: t('aiDbTitle' as any),
        desc: t('aiDbDbDesc' as any),
      });
    }

    // CDN and Edge Warning
    if (projections.totalEgressGB > 2000) {
      insights.push({
        icon: <Info size={18} className="text-paper-primary/40" />,
        title: t('aiCdnTitle' as any),
        desc: t('aiCdnDesc' as any),
        terms: [
          { word: "Edge Computing", hint: t('tooltipEdgeComputing' as any) },
          { word: "CDN", hint: "Content Delivery Network - Edge cache for media." }
        ]
      });
    }

    // Serverless
    if ((metrics.PeakFactor || 1.0) > 3.0) {
      insights.push({
        icon: <Zap size={18} className="text-paper-primary/70" />,
        title: t('aiServerlessTitle' as any),
        desc: t('aiServerlessDesc' as any),
        terms: [
          { word: "Serverless Compute", hint: t('tooltipServerlessCompute' as any) },
          { word: "Compute", hint: "Processing VMs and CPUs like EC2 or droplets." }
        ]
      });
    }

    return insights;
  };

  const insights = getInsights();

  if (insights.length === 0) return null;

  const renderHighlightedDesc = (desc: string, terms?: TermInfo[]) => {
    if (!terms || terms.length === 0) return <>{desc}</>;

    let parts: React.ReactNode[] = [desc];

    terms.forEach(term => {
      const newParts: React.ReactNode[] = [];
      parts.forEach(part => {
        if (typeof part === 'string') {
          const regex = new RegExp(`(${term.word})`, 'gi');
          const splitted = part.split(regex);

          splitted.forEach(s => {
            if (s.toLowerCase() === term.word.toLowerCase()) {
              newParts.push(
                <InfoTooltip key={`${s}-${Math.random()}`} content={term.hint}>
                  <span className="inline-flex items-center text-paper-primary font-bold border-b border-paper-primary/30 hover:border-paper-primary transition-colors cursor-help">
                    {s}
                  </span>
                </InfoTooltip>
              );
            } else if (s) {
              newParts.push(s);
            }
          });
        } else {
          newParts.push(part);
        }
      });
      parts = newParts;
    });

    return <>{parts.map((p, i) => <React.Fragment key={i}>{p}</React.Fragment>)}</>;
  };

  return (
    <div className="w-full mt-10">
      <h3 className="text-[11px] font-bold tracking-[0.2em] uppercase text-paper-primary flex items-center gap-2 mb-6">
        <Zap size={14} className="fill-paper-primary/20 text-paper-primary" /> {'>'} {t('aiInsights')}
      </h3>
      <div className="flex flex-col gap-4">
        {insights.map((insight, idx) => (
          <div key={idx} className="flex flex-col gap-2 p-4 border border-paper-primary/30 border-dashed bg-card/10 group hover:border-solid hover:bg-paper-primary/5 transition-all">
            <div className="flex items-center gap-3">
              <span className="p-1 scale-110">{insight.icon}</span>
              <h4 className="font-bold text-[10px] tracking-[0.1em] text-paper-primary uppercase ">
                {insight.title}
              </h4>
            </div>
            <p className="text-[11px] tracking-wide text-paper-primary/70 leading-relaxed mt-1 ml-10">
              {renderHighlightedDesc(insight.desc, insight.terms)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
