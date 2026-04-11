"use client"

import { useTranslation } from "@/lib/i18n/I18nContext";

export function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();

  return (
    <div className="flex bg-paper-secondary/30 p-0.5 border border-paper-outline/30 backdrop-blur-sm">
      <button
        onClick={() => setLocale('en')}
        className={`px-3 py-1.5 text-[10px] font-bold transition-all uppercase tracking-widest ${
          locale === 'en'
            ? 'bg-paper-primary text-card shadow-lg'
            : 'text-paper-primary/50 hover:text-paper-primary hover:bg-paper-primary/5'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLocale('pt')}
        className={`px-3 py-1.5 text-[10px] font-bold transition-all uppercase tracking-widest ${
          locale === 'pt'
            ? 'bg-paper-primary text-card shadow-lg'
            : 'text-paper-primary/50 hover:text-paper-primary hover:bg-paper-primary/5'
        }`}
      >
        PT
      </button>
    </div>
  );
}
