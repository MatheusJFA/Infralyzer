import React from 'react';
import { useTranslation} from "@/lib/i18n/I18nContext";

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
    border: "border-paper-primary/80",
    text: "text-paper-primary",
    textMuted: "text-paper-primary/70",
    textDim: "text-paper-primary/20",
    textSoft: "text-paper-primary/80",
    textStrong: "text-paper-primary/90",
    borderMuted: "border-paper-primary/50",
  },
  blue: {
    border: "border-paper-primary/80",
    text: "text-paper-primary",
    textMuted: "text-paper-primary/70",
    textDim: "text-paper-primary/20",
    textSoft: "text-paper-primary/80",
    textStrong: "text-paper-primary/90",
    borderMuted: "border-paper-primary/50",
  },
  green: {
    border: "border-paper-primary/80",
    text: "text-paper-primary",
    textMuted: "text-paper-primary/70",
    textDim: "text-paper-primary/20",
    textSoft: "text-paper-primary/80",
    textStrong: "text-paper-primary/90",
    borderMuted: "border-paper-primary/50",
  },
  red: {
    border: "border-paper-primary/80",
    text: "text-paper-primary",
    textMuted: "text-paper-primary/70",
    textDim: "text-paper-primary/20",
    textSoft: "text-paper-primary/80",
    textStrong: "text-paper-primary/90",
    borderMuted: "border-paper-primary/50",
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
 const { t, formatNumber} = useTranslation();
 const theme = themeConfigs[themeColor];

 return (
 <div className="w-full p-6 bg-card border border-paper-outline/20 hover:border-paper-primary/40 transition-all duration-300 relative group uppercase">
 
 <div className="flex justify-between items-start mb-6">
 <p className={`text-[11px] ${theme.text} font-bold tracking-widest`}>{providerTitle}</p>
 <div className={`px-2 py-0.5 border ${theme.border} ${theme.text} text-[9px] font-black bg-transparent`}>
 {providerCode.replace('[', '').replace(']', '')}
 </div>
 </div>

 <div className="relative z-10">
 <div className="mb-6">
 <p className="text-2xl font-black text-paper-primary tracking-tighter ">
 ${formatNumber(totalUsd, { minimumFractionDigits: 2, maximumFractionDigits: 2})}
 <span className="text-[10px] font-bold text-paper-primary/70 tracking-widest ml-1">{t('mo', { defaultValue: '/MO'})}</span>
 </p>
 <div className="flex items-center gap-2 mt-2">
 <p className="text-[11px] font-bold text-paper-primary/90">
 ~ R$ {formatNumber(totalBrl, { minimumFractionDigits: 2, maximumFractionDigits: 2})}
 </p>
 <span className={`text-[8px] px-1 border font-black tracking-widest ${isMocked ? 'border-paper-outline/30 text-paper-outline' : 'border-paper-primary text-paper-primary'}`}>
 {isMocked ? t('mocked') : t('live', { defaultValue: 'LIVE'})}
 </span>
 </div>
 </div>

 <div className="space-y-2 text-[10px] tracking-widest border-t border-dashed border-paper-outline/30 pt-4 mt-6 group-hover:border-paper-primary/50 transition-colors">
 <div className="flex justify-between text-paper-primary/80">
 <span className="opacity-80">{t('storageCost', { defaultValue: 'STORAGE COST'})}</span>
 <span className="font-bold text-paper-primary/90">${formatNumber(storageCostUsd, { minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
 </div>
 <div className="flex justify-between text-paper-primary/80">
 <span className="opacity-80">{t('dataEgress', { defaultValue: 'DATA EGRESS'})}</span>
 <span className="font-bold text-paper-primary/90">${formatNumber(egressCostUsd, { minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
 </div>
 </div>
 </div>
 </div>
 );
}
