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
      className={`relative inline-flex items-center justify-center gap-1.5 min-h-[44px] min-w-[44px] px-2.5 py-1.5 rounded-xl border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 bg-white hover:bg-slate-100 dark:bg-pulse-900 dark:hover:bg-pulse-800 border-slate-200 dark:border-pulse-800 text-slate-700 dark:text-pulse-200 shadow-sm ${className}`}
      aria-label={t.common.switchLang}
      title={t.common.switchLang}
    >
      <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
      <span className="font-mono text-xs font-bold tracking-wider">
        {locale === 'vi' ? 'VI' : 'EN'}
      </span>
      {!compact && (
        <span className="text-[10px] text-slate-400 dark:text-pulse-500 font-mono">
          /{locale === 'vi' ? 'EN' : 'VI'}
        </span>
      )}
    </button>
  );
}
