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
  const { t, formatNumber } = useTranslation();
  const theme = themeConfigs[themeColor];

  return (
    <div className="w-full p-6 bg-terminal-black border border-terminal-tertiary/20 hover:border-terminal-primary/40 transition-all duration-300 relative group uppercase">
      
      <div className="flex justify-between items-start mb-6">
        <p className={`text-[11px] ${theme.text} font-bold tracking-widest`}>{providerTitle}</p>
        <div className={`px-2 py-0.5 border ${theme.border} ${theme.text} text-[9px] font-black bg-transparent`}>
          {providerCode.replace('[', '').replace(']', '')}
        </div>
      </div>

      <div className="relative z-10">
        <div className="mb-6">
          <p className="text-2xl font-black text-terminal-primary tracking-tighter drop-shadow-[0_0_8px_rgba(0,255,0,0.6)]">
            ${formatNumber(totalUsd, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-[10px] font-bold text-terminal-primary/70 tracking-widest ml-1">{t('mo', { defaultValue: '/MO' })}</span>
          </p>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-[11px] font-bold text-terminal-primary/90">
              ~ R$ {formatNumber(totalBrl, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <span className={`text-[8px] px-1 border font-black tracking-widest ${isMocked ? 'border-terminal-tertiary/30 text-terminal-tertiary' : 'border-terminal-primary text-terminal-primary'}`}>
              {isMocked ? t('mocked') : t('live', { defaultValue: 'LIVE' })}
            </span>
          </div>
        </div>

        <div className="space-y-2 text-[10px] tracking-widest border-t border-dashed border-terminal-tertiary/30 pt-4 mt-6 group-hover:border-terminal-primary/50 transition-colors">
          <div className="flex justify-between text-terminal-primary/80">
            <span className="opacity-80">{t('storageCost', { defaultValue: 'STORAGE COST' })}</span>
            <span className="font-bold text-terminal-primary/90">${formatNumber(storageCostUsd, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-terminal-primary/80">
            <span className="opacity-80">{t('dataEgress', { defaultValue: 'DATA EGRESS' })}</span>
            <span className="font-bold text-terminal-primary/90">${formatNumber(egressCostUsd, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
