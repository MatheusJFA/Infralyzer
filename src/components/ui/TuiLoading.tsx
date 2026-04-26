import React from 'react';
import { useTranslation } from "@/lib/i18n/I18nContext";

interface TuiLoadingProps {
  message?: string;
  minHeight?: string;
}

export function TuiLoading({ message, minHeight = "400px" }: TuiLoadingProps) {
  const { t } = useTranslation();

  return (
    <div className={`flex flex-col items-center justify-center p-12 text-paper-primary h-full`} style={{ minHeight }}>
      <div className="relative w-16 h-16 mb-8 group/load">
        {/* Drafting Grid Box */}
        <div className="absolute inset-0 border border-paper-primary/20"></div>

        {/* Horizontal Laser Line */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-paper-primary/60 animate-[loadingLine_2s_ease-in-out_infinite]"></div>

        {/* Construction Lines */}
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-paper-primary/10"></div>
        <div className="absolute top-0 left-1/2 w-[1px] h-full bg-paper-primary/10"></div>

        {/* Sweeping Vertical Line */}
        <div className="absolute top-0 left-0 w-[1px] h-full bg-paper-primary/40 animate-[loadingLineVert_3s_ease-in-out_infinite]"></div>

        <div className="absolute text-[9px] font-bold text-paper-primary/80 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 tracking-[0.2em] animate-pulse">
          PROJ_INFRA
        </div>
      </div>

      <p className="font-bold tracking-[0.3em] uppercase text-[11px] text-paper-primary/70">
        {message || t('loadingPricing' as any)}
      </p>

      <style jsx>{`
        @keyframes loadingLine {
          0%, 100% { top: 0; opacity: 0.1; }
          50% { top: 100%; opacity: 0.8; }
        }
        @keyframes loadingLineVert {
          0%, 100% { left: 0; opacity: 0.1; }
          50% { left: 100%; opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
