'use client';

import React, { useState } from 'react';
import { GoldGapAnalysis, formatVndMillions, formatPercent, formatUsd, formatVnd } from '@frabpulse/shared';
import { Scale, ArrowUpRight, HelpCircle, ChevronDown, ChevronUp, Calculator, ShieldCheck, TrendingUp, Info } from 'lucide-react';
import { MarketHealthBadge } from './MarketHealthBadge';
import { useLanguage } from '../../lib/i18n/LanguageContext';
import { formatPriceLocale, formatPercentLocale } from '../../lib/formatters';

interface GoldGapCardProps {
  gapData: GoldGapAnalysis;
}

export function GoldGapCard({ gapData }: GoldGapCardProps) {
  const [showFormula, setShowFormula] = useState(false);
  const { t, locale } = useLanguage();

  // Categorize spread level
  const gapPercent = gapData.gapPercent;
  const spreadCategory =
    gapPercent > 20
      ? { label: t.gapCard.extremePremium, color: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30' }
      : gapPercent > 12
      ? { label: t.gapCard.elevatedPremium, color: 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30' }
      : { label: t.gapCard.normalSpread, color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30' };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-pulse-900/90 border border-slate-200 dark:border-pulse-800 p-4 sm:p-6 shadow-sm hover:shadow-md dark:shadow-xl dark:shadow-black/20 transition-all">
      {/* Background glow accent */}
      <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-amber-500/10 dark:bg-emerald-500/10 blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 dark:bg-emerald-500/10 border border-amber-500/20 dark:border-emerald-500/20 text-amber-600 dark:text-emerald-400 shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                {t.gapCard.title}
              </h2>
              <span className={`px-2 py-0.5 text-[10px] font-sans font-bold tracking-wider rounded-lg border ${spreadCategory.color}`}>
                {spreadCategory.label}
              </span>
              <MarketHealthBadge
                sourceType={gapData.sourceType}
                lastSync={gapData.timestamp}
                compact
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-pulse-400 mt-0.5">
              {t.gapCard.subtitle}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowFormula(!showFormula)}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 min-h-[38px] px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-pulse-800/80 dark:hover:bg-pulse-800 border border-slate-200 dark:border-pulse-700 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
          aria-expanded={showFormula}
          aria-label={t.gapCard.inspectFormula}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>{showFormula ? t.gapCard.hideFormula : t.gapCard.inspectFormula}</span>
          {showFormula ? <ChevronUp className="w-3.5 h-3.5 ml-0.5" /> : <ChevronDown className="w-3.5 h-3.5 ml-0.5" />}
        </button>
      </div>

      {/* 4-Metric Scientific Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Arbitrage Spread */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-pulse-950/70 border border-slate-200/80 dark:border-pulse-800/80">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
            {t.gapCard.arbitrageSpread}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-amber-700 dark:text-emerald-400">
              +{formatPriceLocale(gapData.gapVnd, 'VND', locale, true)}
            </span>
          </div>
          <span className="text-[11px] font-sans text-slate-500 dark:text-slate-400 mt-1 block truncate">
            <span className="font-mono tabular-nums">{formatPriceLocale(gapData.gapVnd, 'VND', locale, false)}</span> / {locale === 'vi' ? 'lượng' : 'tael'}
          </span>
        </div>

        {/* Metric 2: Percentage Premium */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-pulse-950/70 border border-slate-200/80 dark:border-pulse-800/80">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
            {t.gapCard.domesticPremium}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums text-amber-700 dark:text-emerald-400 flex items-center">
              {formatPercentLocale(gapData.gapPercent, locale)}
              <ArrowUpRight className="w-5 h-5 ml-0.5 shrink-0" />
            </span>
          </div>
          <span className="text-[11px] font-sans text-slate-500 dark:text-slate-400 mt-1 block">
            {t.gapCard.arbitrageSpread}
          </span>
        </div>

        {/* Metric 3: Domestic SJC Benchmark */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-pulse-950/70 border border-slate-200/80 dark:border-pulse-800/80">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
            {t.gapCard.sjcBenchmark}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {formatPriceLocale(gapData.domesticPriceVndPerTael, 'VND', locale, true)}
            </span>
          </div>
          <span className="text-[11px] font-sans text-slate-500 dark:text-slate-400 mt-1 block truncate">
            <span className="font-mono tabular-nums">{formatPriceLocale(gapData.domesticPriceVndPerTael, 'VND', locale, false)}</span> / {locale === 'vi' ? 'lượng' : 'tael'}
          </span>
        </div>

        {/* Metric 4: Converted World Gold */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-pulse-950/70 border border-slate-200/80 dark:border-pulse-800/80">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
            {t.gapCard.worldBenchmark}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-slate-700 dark:text-slate-200">
              {formatPriceLocale(gapData.worldPriceVndPerTael, 'VND', locale, true)}
            </span>
          </div>
          <span className="text-[11px] font-sans text-slate-500 dark:text-slate-400 mt-1 block truncate">
            <span className="font-mono tabular-nums">{formatPriceLocale(gapData.xauUsd, 'USD', locale, false)}/oz</span> @ <span className="font-mono tabular-nums">{formatPriceLocale(gapData.usdVnd, 'VND', locale, false)}</span>
          </span>
        </div>
      </div>

      {/* Expandable Scientific Formula Inspector */}
      {showFormula && (
        <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-pulse-950 border border-slate-200 dark:border-pulse-800 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-900 dark:text-white">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t.gapCard.formulaTitle}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            {/* Step 1 */}
            <div className="p-3 rounded-lg bg-white dark:bg-pulse-900 border border-slate-200 dark:border-pulse-800">
              <span className="text-[10px] text-slate-500 dark:text-pulse-400 font-bold uppercase block mb-1">
                {t.gapCard.step3}
              </span>
              <div className="text-slate-800 dark:text-pulse-200 leading-relaxed">
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">World Converted</span> =<br />
                {formatUsd(gapData.xauUsd)} × {gapData.usdVnd.toLocaleString()} ₫/USD × 1.20565<br />
                = <span className="font-bold text-slate-900 dark:text-white">{formatVnd(gapData.worldPriceVndPerTael)}</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-pulse-400 mt-2">
                * {t.gapCard.step1}; {t.gapCard.step2}.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-3 rounded-lg bg-white dark:bg-pulse-900 border border-slate-200 dark:border-pulse-800">
              <span className="text-[10px] text-slate-500 dark:text-pulse-400 font-bold uppercase block mb-1">
                {t.gapCard.step5}
              </span>
              <div className="text-slate-800 dark:text-pulse-200 leading-relaxed">
                <span className="text-amber-700 dark:text-amber-400 font-bold">Spread</span> = SJC Ask - World Converted<br />
                = {formatVnd(gapData.domesticPriceVndPerTael)} - {formatVnd(gapData.worldPriceVndPerTael)}<br />
                = <span className="font-bold text-emerald-700 dark:text-emerald-400">+{formatVnd(gapData.gapVnd)} / lượng</span><br />
                <span className="text-slate-600 dark:text-pulse-300">Premium = ({gapData.gapVnd.toLocaleString()} / {gapData.worldPriceVndPerTael.toLocaleString()}) = </span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">+{gapData.gapPercent.toFixed(2)}%</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-pulse-400 mt-2 italic">
                {t.gapCard.decreeNotice}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
