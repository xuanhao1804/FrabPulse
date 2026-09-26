'use client';

import React, { useState, useMemo } from 'react';
import {
  convertGoldWeight,
  estimateGoldValue,
  GoldUnit,
  GRAMS_PER_TAEL,
  GRAMS_PER_CHI,
  GRAMS_PER_TROY_OZ,
  TROY_OZ_TO_TAEL_FACTOR
} from '@frabpulse/shared';
import { useLanguage } from '../../lib/i18n/LanguageContext';
import { formatPriceLocale, formatNumberLocale } from '../../lib/formatters';
import { Calculator, Scale, ArrowRightLeft, Sparkles, ChevronDown, ChevronUp, Info } from 'lucide-react';

interface GoldUnitConverterProps {
  sjcPrice?: number;
  spotGoldUsd?: number;
  usdVnd?: number;
}

export function GoldUnitConverter({
  sjcPrice = 90_500_000,
  spotGoldUsd = 2650.5,
  usdVnd = 25440
}: GoldUnitConverterProps) {
  const { locale, t } = useLanguage();
  const [amount, setAmount] = useState<number>(1);
  const [unit, setUnit] = useState<GoldUnit>('LUONG');
  const [showFormula, setShowFormula] = useState<boolean>(false);

  // Quick preset pills
  const presets: { label: string; amount: number; unit: GoldUnit }[] = [
    { label: '1 Chỉ', amount: 1, unit: 'CHI' },
    { label: '5 Chỉ', amount: 5, unit: 'CHI' },
    { label: '1 Lượng (Cây)', amount: 1, unit: 'LUONG' },
    { label: '10 Lượng', amount: 10, unit: 'LUONG' },
    { label: '1 Troy Oz', amount: 1, unit: 'TROY_OZ' },
    { label: '100 Grams', amount: 100, unit: 'GRAM' },
    { label: '1 Kg', amount: 1, unit: 'KG' }
  ];

  const weights = useMemo(() => {
    return convertGoldWeight(amount, unit);
  }, [amount, unit]);

  const valuation = useMemo(() => {
    return estimateGoldValue(weights, sjcPrice, spotGoldUsd, usdVnd);
  }, [weights, sjcPrice, spotGoldUsd, usdVnd]);

  const unitLabels: Record<GoldUnit, string> = {
    LUONG: t.converter.unitLuong,
    CHI: t.converter.unitChi,
    TROY_OZ: t.converter.unitOz,
    GRAM: t.converter.unitGram,
    KG: t.converter.unitKg
  };

  return (
    <section
      aria-labelledby="converter-heading"
      className="rounded-2xl bg-white dark:bg-pulse-900/90 border border-slate-200 dark:border-pulse-800 p-4 sm:p-6 shadow-sm dark:shadow-xl dark:shadow-black/20 transition-all space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-pulse-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 id="converter-heading" className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>{t.converter.title}</span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-lg bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-500/20">
                PRO MATH
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-pulse-400">
              {t.converter.subtitle}
            </p>
          </div>
        </div>

        {/* Toggle formula button */}
        <button
          onClick={() => setShowFormula(!showFormula)}
          className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-600 dark:text-pulse-300 hover:text-emerald-600 dark:hover:text-emerald-400 self-start sm:self-center transition-colors min-h-[36px]"
        >
          <Info className="w-3.5 h-3.5" />
          <span>{showFormula ? 'Ẩn công thức' : 'Xem công thức'}</span>
          {showFormula ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Input Row & Presets */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1">
            <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-pulse-400 block mb-1">
              {t.converter.amount}
            </label>
            <div className="relative">
              <input
                type="number"
                min="0.001"
                step="any"
                value={amount || ''}
                onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-pulse-800 bg-slate-50 dark:bg-pulse-950 font-mono text-base font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 min-h-[44px]"
                placeholder="1.0"
              />
            </div>
          </div>

          <div className="sm:w-64">
            <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-pulse-400 block mb-1">
              {t.converter.unit}
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as GoldUnit)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-pulse-800 bg-slate-50 dark:bg-pulse-950 font-mono text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 min-h-[44px]"
            >
              <option value="LUONG">{unitLabels.LUONG} (37.5g)</option>
              <option value="CHI">{unitLabels.CHI} (3.75g)</option>
              <option value="TROY_OZ">{unitLabels.TROY_OZ} (31.10g)</option>
              <option value="GRAM">{unitLabels.GRAM}</option>
              <option value="KG">{unitLabels.KG}</option>
            </select>
          </div>
        </div>

        {/* Quick presets pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-[11px] font-mono font-semibold text-slate-400 dark:text-pulse-500 mr-1">
            {t.converter.quickPresets}
          </span>
          {presets.map((p) => (
            <button
              key={`${p.amount}-${p.unit}`}
              onClick={() => {
                setAmount(p.amount);
                setUnit(p.unit);
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-100 hover:bg-slate-200 dark:bg-pulse-950 dark:hover:bg-pulse-800 border border-slate-200 dark:border-pulse-800 text-slate-700 dark:text-pulse-300 transition-colors min-h-[32px]"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Equivalent Physical Weights Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
        {/* Lượng (Tael) */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-pulse-950/70 border border-slate-200/80 dark:border-pulse-800/80">
          <span className="text-[11px] font-mono text-slate-500 dark:text-pulse-400 block mb-0.5">
            {t.converter.unitLuong}
          </span>
          <span className="text-lg sm:text-xl font-mono font-extrabold text-slate-900 dark:text-white tabular-nums block truncate">
            {formatNumberLocale(weights.luong, locale, 4)}
          </span>
          <span className="text-[10px] font-mono text-slate-400 dark:text-pulse-500 block">
            = {formatNumberLocale(weights.chi, locale, 2)} chỉ
          </span>
        </div>

        {/* Chỉ */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-pulse-950/70 border border-slate-200/80 dark:border-pulse-800/80">
          <span className="text-[11px] font-mono text-slate-500 dark:text-pulse-400 block mb-0.5">
            {t.converter.unitChi}
          </span>
          <span className="text-lg sm:text-xl font-mono font-extrabold text-slate-900 dark:text-white tabular-nums block truncate">
            {formatNumberLocale(weights.chi, locale, 3)}
          </span>
          <span className="text-[10px] font-mono text-slate-400 dark:text-pulse-500 block">
            = 0.1 lượng
          </span>
        </div>

        {/* Troy Ounce (oz) */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-pulse-950/70 border border-slate-200/80 dark:border-pulse-800/80">
          <span className="text-[11px] font-mono text-slate-500 dark:text-pulse-400 block mb-0.5">
            {t.converter.unitOz}
          </span>
          <span className="text-lg sm:text-xl font-mono font-extrabold text-sky-700 dark:text-sky-400 tabular-nums block truncate">
            {formatNumberLocale(weights.troyOz, locale, 4)}
          </span>
          <span className="text-[10px] font-mono text-slate-400 dark:text-pulse-500 block">
            = 31.1035 grams
          </span>
        </div>

        {/* Grams & Kg */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-pulse-950/70 border border-slate-200/80 dark:border-pulse-800/80">
          <span className="text-[11px] font-mono text-slate-500 dark:text-pulse-400 block mb-0.5">
            {t.converter.unitGram}
          </span>
          <span className="text-lg sm:text-xl font-mono font-extrabold text-slate-900 dark:text-white tabular-nums block truncate">
            {formatNumberLocale(weights.grams, locale, 2)} g
          </span>
          <span className="text-[10px] font-mono text-slate-400 dark:text-pulse-500 block">
            = {formatNumberLocale(weights.kg, locale, 4)} kg
          </span>
        </div>
      </div>

      {/* Live Financial Valuation Card */}
      <div className="p-4 sm:p-5 rounded-xl bg-linear-to-r from-emerald-500/10 via-sky-500/5 to-amber-500/10 border border-emerald-500/20 dark:border-emerald-500/30">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <span className="text-[11px] font-mono text-slate-600 dark:text-pulse-300 block mb-1">
              {t.converter.domesticValue} (SJC):
            </span>
            <span className="text-lg sm:text-xl font-mono font-extrabold text-slate-900 dark:text-white tabular-nums block">
              {formatPriceLocale(valuation.domesticVnd, 'VND', locale)}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-mono text-slate-600 dark:text-pulse-300 block mb-1">
              {t.converter.worldValue} (XAU):
            </span>
            <span className="text-lg sm:text-xl font-mono font-extrabold text-sky-700 dark:text-sky-400 tabular-nums block">
              {formatPriceLocale(valuation.worldVnd, 'VND', locale)}
            </span>
            <span className="text-[11px] font-mono text-slate-500 dark:text-pulse-400 block">
              ≈ {formatPriceLocale(valuation.worldUsd, 'USD', locale)}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-mono text-slate-600 dark:text-pulse-300 block mb-1">
              {t.converter.arbitrageSpread}:
            </span>
            <span className="text-lg sm:text-xl font-mono font-extrabold text-amber-700 dark:text-amber-400 tabular-nums block">
              +{formatPriceLocale(valuation.arbitrageDiffVnd, 'VND', locale)}
            </span>
          </div>
        </div>
      </div>

      {/* Expandable Formula Explanation */}
      {showFormula && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-pulse-950 border border-slate-200 dark:border-pulse-800 text-xs font-mono space-y-2 animate-in fade-in duration-200">
          <span className="font-bold text-slate-900 dark:text-white block">
            {t.converter.formulaTitle}
          </span>
          <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-pulse-300">
            <li>1 Lượng (cây) = 10 Chỉ = 37.5 grams</li>
            <li>1 Troy Ounce quốc tế = 31.1034768 grams</li>
            <li>Hệ số quy đổi vật lý: 37.5 / 31.1034768 = 1.20565 oz/lượng</li>
            <li>Giá thế giới quy đổi (VND) = Khối lượng (oz) × XAU/USD × Tỷ giá USD/VND</li>
          </ul>
        </div>
      )}
    </section>
  );
}
