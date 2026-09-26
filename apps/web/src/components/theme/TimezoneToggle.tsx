'use client';

import React from 'react';
import { useLanguage } from '../../lib/i18n/LanguageContext';
import { Clock } from 'lucide-react';

export function TimezoneToggle() {
  const { timezone, toggleTimezone, locale } = useLanguage();

  const titleText =
    timezone === 'ICT'
      ? locale === 'vi'
        ? 'Múi giờ: ICT (Giờ Việt Nam UTC+7) — Nhấp để đổi sang UTC'
        : 'Timezone: ICT (Vietnam UTC+7) — Click to switch to UTC'
      : locale === 'vi'
        ? 'Múi giờ: UTC (Giờ Quốc Tế) — Nhấp để đổi sang ICT'
        : 'Timezone: UTC (Universal Coordinated Time) — Click to switch to ICT';

  return (
    <button
      onClick={toggleTimezone}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-pulse-800/80 bg-slate-50/80 dark:bg-pulse-900/60 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-pulse-800 transition-colors font-sans text-xs font-semibold min-h-[38px] min-w-[38px] sm:min-h-[40px] justify-center focus-visible:ring-2 focus-visible:ring-emerald-500"
      title={titleText}
      aria-label={titleText}
    >
      <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
      <span>{timezone}</span>
      <span className="text-[10px] text-slate-400 dark:text-pulse-400 hidden sm:inline font-mono">
        {timezone === 'ICT' ? '+7' : '+0'}
      </span>
    </button>
  );
}
