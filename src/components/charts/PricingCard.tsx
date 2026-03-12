import React from 'react';
import { useTranslation } from "@/lib/i18n/I18nContext";

interface PricingCardProps {
  providerCode: string; // e.g., [AWS], [AZR]
  providerTitle: string;
  totalUsd: number;
  totalBrl: number;
  isMocked: boolean;
  storageCostUsd: number;
  egressCostUsd: number;
  themeColor: 'orange' | 'blue' | 'green' | 'red';
}

const themeConfigs = {
  orange: {
    border: "border-orange-500",
    text: "text-orange-500",
    textMuted: "text-orange-500/70",
    textDim: "text-orange-500/20",
    textSoft: "text-orange-500/80",
    textStrong: "text-orange-500/90",
    borderMuted: "border-orange-500/50",
  },
  blue: {
    border: "border-blue-500",
    text: "text-blue-500",
    textMuted: "text-blue-500/70",
    textDim: "text-blue-500/20",
    textSoft: "text-blue-500/80",
    textStrong: "text-blue-500/90",
    borderMuted: "border-blue-500/50",
  },
  green: {
    border: "border-green-500",
    text: "text-green-500",
    textMuted: "text-green-500/70",
    textDim: "text-green-500/20",
    textSoft: "text-green-500/80",
    textStrong: "text-green-500/90",
    borderMuted: "border-green-500/50",
  },
  red: {
    border: "border-red-500",
    text: "text-red-500",
    textMuted: "text-red-500/70",
    textDim: "text-red-500/20",
    textSoft: "text-red-500/80",
    textStrong: "text-red-500/90",
    borderMuted: "border-red-500/50",
  },
};

export function PricingCard({
  providerCode,
  providerTitle,
  totalUsd,
  totalBrl,
  isMocked,
  storageCostUsd,
  egressCostUsd,
  themeColor,
}: PricingCardProps) {
  const { t } = useTranslation();
  const theme = themeConfigs[themeColor];

  return (
    <div className="w-full p-4 bg-black border border-primary/50 hover:border-primary transition-all duration-300 relative group uppercase">
      <div className="flex justify-between items-start mb-4">
        <p className="text-xs text-primary/70 font-bold tracking-widest">{providerTitle}</p>
        <div className={`px-2 py-0.5 border ${theme.border} ${theme.text} text-[10px] font-black bg-black`}>
          {providerCode.replace('[', '').replace(']', '')}
        </div>
      </div>

      <div className="relative z-10">
        <div className="mb-4">
          <p className="text-2xl font-black text-primary tracking-tighter">
            ${totalUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-xs font-bold text-primary/70 tracking-widest ml-1">{t('mo')}</span>
          </p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm font-bold text-primary/80">
              ~ R$ {totalBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <span className={`text-[9px] px-1 border font-black ${isMocked ? 'border-primary/30 text-primary/50' : 'border-primary text-primary'}`}>
              {isMocked ? t('mocked') : t('live')}
            </span>
          </div>
        </div>

        <div className="space-y-1.5 text-xs border-t border-dashed border-primary/30 pt-3 group-hover:border-primary/50 transition-colors">
          <div className="flex justify-between text-primary/80">
            <span className="tracking-widest opacity-80">{t('storageCost')}</span>
            <span className="font-bold text-primary">${storageCostUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-primary/80">
            <span className="tracking-widest opacity-80">{t('dataEgress')}</span>
            <span className="font-bold text-primary">${egressCostUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
