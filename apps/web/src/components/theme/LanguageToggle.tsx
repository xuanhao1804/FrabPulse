'use client';

import React from 'react';
import { useLanguage } from '../../lib/i18n/LanguageContext';
import { Globe } from 'lucide-react';

interface LanguageToggleProps {
  className?: string;
  compact?: boolean;
}

export function LanguageToggle({ className = '', compact = false }: LanguageToggleProps) {
  const { locale, toggleLocale, t } = useLanguage();

  return (
    <button
      onClick={toggleLocale}
      className={`relative inline-flex items-center justify-center gap-1.5 min-h-[38px] min-w-[38px] sm:min-h-[40px] px-2.5 py-1.5 rounded-lg border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 bg-slate-50/80 hover:bg-slate-100 dark:bg-pulse-900/60 dark:hover:bg-pulse-800 border-slate-200 dark:border-pulse-800/80 text-slate-700 dark:text-slate-200 font-sans ${className}`}
      aria-label={t.common.switchLang}
      title={t.common.switchLang}
    >
      <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
      <span className="font-sans text-xs font-semibold tracking-wider">
        {locale === 'vi' ? 'VI' : 'EN'}
      </span>
      {!compact && (
        <span className="text-[10px] text-slate-400 dark:text-pulse-400 font-sans">
          /{locale === 'vi' ? 'EN' : 'VI'}
        </span>
      )}
    </button>
  );
}
