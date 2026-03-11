import React from 'react';
import { useTranslation } from "@/lib/i18n/I18nContext";

interface TuiLoadingProps {
  message?: string;
  minHeight?: string;
}

export function TuiLoading({ message, minHeight = "400px" }: TuiLoadingProps) {
  const { t } = useTranslation();
  
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-primary animate-pulse h-full`} style={{ minHeight }}>
      <div className="font-mono text-4xl mb-6 text-primary animate-spin">
        [\]
      </div>
      <p className="font-bold tracking-widest uppercase">
        {message || t('loadingPricing')}
      </p>
    </div>
  );
}
