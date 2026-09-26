'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../../lib/i18n/LanguageContext';
import { Activity, ShieldCheck, FileText, Globe2 } from 'lucide-react';

export function Footer() {
  const { t, locale, toggleLocale } = useLanguage();

  return (
    <footer className="border-t border-slate-200 dark:border-pulse-800/80 bg-white/80 dark:bg-pulse-950/80 backdrop-blur-sm py-10 mt-16 text-xs text-slate-500 dark:text-pulse-400 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-pulse-800/60">
          <div className="space-y-1.5 max-w-md">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight">
                {t.nav.brand}
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                {t.nav.tagline}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-pulse-300 leading-relaxed">
              {t.footer.description}
            </p>
          </div>

          {/* Quick links & language switch */}
          <div className="flex items-center gap-4 flex-wrap text-xs font-mono">
            <Link
              href="/"
              className="text-slate-600 dark:text-pulse-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              {t.nav.radar}
            </Link>
            <span>•</span>
            <Link
              href="/gold"
              className="text-slate-600 dark:text-pulse-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              {t.nav.goldHub}
            </Link>
            <span>•</span>
            <Link
              href="/methodology"
              className="text-slate-600 dark:text-pulse-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              {t.nav.methodology}
            </Link>
            <span>•</span>
            <button
              onClick={toggleLocale}
              className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 hover:underline font-semibold"
              aria-label={t.common.switchLang}
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>{locale === 'vi' ? 'English (EN)' : 'Tiếng Việt (VI)'}</span>
            </button>
          </div>
        </div>

        {/* Disclaimer and copyright */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[11px] leading-relaxed">
          <p className="max-w-2xl text-slate-500 dark:text-pulse-400">
            {t.footer.disclaimer}
          </p>
          <div className="shrink-0 font-mono text-slate-500 dark:text-pulse-500">
            © {new Date().getFullYear()} FrabPulse. {t.footer.allRights}
          </div>
        </div>
      </div>
    </footer>
  );
}
