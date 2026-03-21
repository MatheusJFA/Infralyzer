"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations';
import type { Language, TranslationKeys } from './translations';

interface I18nContextType {
  locale: Language;
  setLocale: (lang: Language) => void;
  t: (key: TranslationKeys, params?: Record<string, string | number>) => string;
  formatNumber: (num: number, options?: Intl.NumberFormatOptions) => string;
  formatDataSize: (gb: number) => string;
  getStorageDetails: (gb: number) => React.ReactNode;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Language>('en');

  // Load language from localStorage if possible (client side only)
  useEffect(() => {
    const saved = localStorage.getItem('Infralyzer_lang') as Language;
    if (saved && (saved === 'en' || saved === 'pt')) setLocale(saved);
    else if (navigator.language.startsWith('pt')) setLocale('pt');
  }, []);

  const changeLocale = (lang: Language) => {
    setLocale(lang);
    localStorage.setItem('Infralyzer_lang', lang);
  };

  const t = (key: TranslationKeys, params?: Record<string, string | number>) => {
    let str = translations[locale][key] || translations['en'][key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        str = str.replace(new RegExp(`{${k}}`, 'g'), String(v));
      });
    }
    return str;
  };

  const formatNumber = (num: number, options?: Intl.NumberFormatOptions) => {
    return num.toLocaleString(locale === 'pt' ? 'pt-BR' : 'en-US', options);
  };

  const formatDataSize = (gb: number) => {
    if (gb < 1024) return `${formatNumber(gb, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} GB`;
    const tb = gb / 1024;
    if (tb < 1024) return `${formatNumber(tb, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TB`;
    const pb = tb / 1024;
    if (pb < 1024) return `${formatNumber(pb, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PB`;
    const eb = pb / 1024;
    return `${formatNumber(eb, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EB`;
  };

  const getStorageDetails = (gb: number) => {
    const mb = gb * 1024;
    const tb = gb / 1024;
    return (
      <div className="flex flex-col gap-1 text-left w-full mt-1">
         <div className="flex justify-between items-center gap-4 border-b border-white/10 pb-1 mb-1">
           <span className="opacity-70 text-[9px] uppercase tracking-widest">Megabytes</span>
           <span className="font-bold text-terminal-primary">{formatNumber(mb, { maximumFractionDigits: 2 })} MB</span>
         </div>
         <div className="flex justify-between items-center gap-4 border-b border-white/10 pb-1 mb-1">
           <span className="opacity-70 text-[9px] uppercase tracking-widest">Gigabytes</span>
           <span className="font-bold text-terminal-primary">{formatNumber(gb, { maximumFractionDigits: 2 })} GB</span>
         </div>
         <div className="flex justify-between items-center gap-4">
           <span className="opacity-70 text-[9px] uppercase tracking-widest">Terabytes</span>
           <span className="font-bold text-terminal-primary">{formatNumber(tb, { maximumFractionDigits: 2 })} TB</span>
         </div>
      </div>
    );
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale: changeLocale, t, formatNumber, formatDataSize, getStorageDetails }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
}
