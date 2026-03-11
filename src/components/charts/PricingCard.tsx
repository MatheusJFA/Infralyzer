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
    <div className={`p-4 bg-black border-2 ${theme.border} relative group uppercase`}>
      <div className={`absolute top-0 right-0 p-3 ${theme.textDim} font-bold text-4xl group-hover:${theme.textMuted.replace('/70', '/40')} transition-colors pointer-events-none`}>
        {providerCode}
      </div>
      <p className={`text-sm ${theme.textMuted} font-bold tracking-widest mb-1`}>{providerTitle}</p>
      <div className="mb-4">
        <p className={`text-3xl font-black ${theme.text}`}>
          ${totalUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          <span className={`text-sm font-bold ${theme.textMuted} tracking-widest`}> {t('mo')}</span>
        </p>
        <div className="flex items-center gap-2">
          <p className={`text-lg font-bold ${theme.textSoft}`}>
            ~ R$ {totalBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className={`text-[10px] px-1 border font-black ${isMocked ? `${theme.borderMuted} ${theme.textMuted}` : `${theme.border} ${theme.text}`}`}>
            {isMocked ? t('mocked') : t('live')}
          </span>
        </div>
      </div>

      <div className={`space-y-1 text-sm border-t-2 ${theme.border} border-dashed pt-3`}>
        <div className={`flex justify-between ${theme.textStrong}`}>
          <span className="tracking-widest">{t('storageCost')}</span>
          <span className="font-bold">${storageCostUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
        <div className={`flex justify-between ${theme.textStrong}`}>
          <span className="tracking-widest">{t('dataEgress')}</span>
          <span className="font-bold">${egressCostUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>
    </div>
  );
}
