import React from 'react';
import { TuiBanner } from "@/components/ui/TuiBanner";
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
        icon: <Zap size={18} className="text-primary/70" />,
        title: t('aiStdTitle' as any),
        desc: t('aiStdDesc' as any),
      });
    }

    const isReadHeavy = metrics.ReadRatioPercentage >= 70;
    const isWriteHeavy = metrics.WriteRatioPercentage >= 60;

    if (isReadHeavy) {
      insights.push({
        icon: <Database size={18} className="text-cyan-400" />,
        title: t('aiReadHeavyTitle' as any),
        desc: t('aiReadHeavyDesc' as any),
        terms: [
          { word: "Database Replication", hint: t('tooltipReplication' as any) },
          { word: "Read Replicas", hint: t('tooltipReadReplicas' as any) },
          { word: "Redis", hint: t('aiCacheTitle' as any) } // A quick fallback hint
        ]
      })
    }

    if (isWriteHeavy) {
      insights.push({
        icon: <Database size={18} className="text-orange-400" />,
        title: t('aiWriteHeavyTitle' as any),
        desc: t('aiWriteHeavyDesc' as any),
        terms: [
          { word: "Sharding", hint: t('tooltipSharding' as any) },
          { word: "Partitioning", hint: t('tooltipPartitioning' as any) },
          { word: "NoSQL", hint: "Database approach designed for unstructured or highly-scalable inserts like DynamoDB or MongoDB." }
        ]
      })
    }

    // Caching
    if (metrics.ReadRatioPercentage >= 75 && projections.peakQPS > 5000) {
      insights.push({
        icon: <Zap size={18} className="text-yellow-500" />,
        title: t('aiCacheTitle' as any),
        desc: t('aiCacheDesc' as any),
      });
    }

    // High Write Storage
    if (metrics.WriteRatioPercentage >= 50 && projections.totalStorageGB > 2000) {
      insights.push({
        icon: <Server size={18} className="text-primary" />,
        title: t('aiDbTitle' as any),
        desc: t('aiDbDesc' as any),
      });
    }

    // CDN and Edge Warning
    if (projections.totalEgressGB > 2000) {
      insights.push({
        icon: <Info size={18} className="text-blue-500" />,
        title: t('aiCdnTitle' as any),
        desc: t('aiCdnDesc' as any),
        terms: [
          { word: "Edge Computing", hint: t('tooltipEdgeComputing' as any) },
          { word: "CDN", hint: "Content Delivery Network - Edge cache for media." }
        ]
      });
    }

    // Serverless (To save Peak Factor costs)
    if ((metrics.PeakFactor || 1.0) > 3.0) {
      insights.push({
        icon: <Zap size={18} className="text-pink-500" />,
        title: t('aiServerlessTitle' as any),
        desc: t('aiServerlessDesc' as any),
        terms: [
          { word: "Serverless Compute", hint: t('tooltipServerlessCompute' as any) },
          { word: "Compute", hint: "Standard term for Processing VMs and CPUs like EC2 or droplets." }
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
          // split keeping the matched word using generic case-insensitive regex
          const regex = new RegExp(`(${term.word})`, 'gi');
          const splitted = part.split(regex);
          
          splitted.forEach(s => {
            if (s.toLowerCase() === term.word.toLowerCase()) {
              newParts.push(
                <InfoTooltip key={`${s}-${Math.random()}`} content={term.hint}>
                  <span className="inline-flex items-center text-primary font-bold border-b border-primary/50 group-hover:border-primary transition-colors">
                    {s}
                  </span>
                </InfoTooltip>
              );
            } else if (s) {
              newParts.push(s);
            }
          });
        } else {
          newParts.push(part); // Already a React node
        }
      });
      parts = newParts;
    });

    return <>{parts.map((p, i) => <React.Fragment key={i}>{p}</React.Fragment>)}</>;
  };

  return (
    <div className="w-full mt-10">
      <h3 className="text-sm font-bold tracking-widest uppercase text-terminal-primary drop-shadow-[0_0_5px_rgba(0,255,0,0.8)] flex items-center gap-2 mb-6">
        <Zap size={16} className="fill-terminal-primary text-terminal-primary" /> {'>'} {t('aiInsights')}
      </h3>
      <div className="flex flex-col gap-4">
        {insights.map((insight, idx) => (
          <div key={idx} className="flex flex-col gap-2 p-4 border border-terminal-primary border-dashed bg-terminal-black/30 group hover:border-solid hover:bg-terminal-primary/5 transition-all">
            <div className="flex items-center gap-2">
              <span className="p-1">{insight.icon}</span>
              <h4 className="font-bold text-[11px] tracking-widest text-terminal-primary uppercase drop-shadow-[0_0_3px_rgba(0,255,0,0.5)]">
                {insight.title}
              </h4>
            </div>
            <p className="text-[11px] tracking-wider text-terminal-primary/80 leading-relaxed normal-case mt-1 ml-9">
              {renderHighlightedDesc(insight.desc, insight.terms)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
