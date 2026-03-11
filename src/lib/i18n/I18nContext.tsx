"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from './translations';
import type { Language, TranslationKeys } from './translations';

interface I18nContextType {
  locale: Language;
  setLocale: (lang: Language) => void;
  t: (key: TranslationKeys, params?: Record<string, string | number>) => string;
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

  return (
    <I18nContext.Provider value={{ locale, setLocale: changeLocale, t }}>
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
