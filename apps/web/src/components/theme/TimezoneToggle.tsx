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
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-pulse-800 bg-white dark:bg-pulse-900 text-slate-700 dark:text-pulse-200 hover:border-slate-300 dark:hover:border-pulse-700 transition-colors font-mono text-xs font-bold shadow-2xs min-h-[44px] min-w-[44px] justify-center focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50"
      title={titleText}
      aria-label={titleText}
    >
      <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-pulse-400 shrink-0" />
      <span>{timezone}</span>
      <span className="text-[10px] text-slate-400 dark:text-pulse-500 hidden sm:inline">
        {timezone === 'ICT' ? '+7' : '+0'}
      </span>
    </button>
  );
}
