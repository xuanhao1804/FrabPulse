'use client';

import React from 'react';
import { PriceSnapshot, GoldGapAnalysis, formatVndMillions, formatUsd, formatPercent } from '@frabpulse/shared';
import { TrendingUp, TrendingDown, Scale } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '../../lib/i18n/LanguageContext';

interface MarketTickerTapeProps {
  prices: PriceSnapshot[];
  gapData?: GoldGapAnalysis;
}

export function MarketTickerTape({ prices, gapData }: MarketTickerTapeProps) {
  const { t } = useLanguage();
  if (!prices || prices.length === 0) return null;

  return (
    <div className="w-full overflow-hidden border-y border-slate-200 dark:border-pulse-800 bg-white/70 dark:bg-pulse-950/70 backdrop-blur-xs py-2 px-3 text-xs font-mono">
      <div className="flex items-center gap-6 overflow-x-auto scrollbar-none whitespace-nowrap">
        {/* Real-time Ticker Tag */}
        <div className="flex items-center gap-1.5 shrink-0 pr-3 border-r border-slate-200 dark:border-pulse-800 text-[11px] font-bold text-slate-500 dark:text-pulse-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span>{t.ticker.liveTicker}</span>
        </div>

        {/* Gold Gap Item */}
        {gapData && (
          <div className="flex items-center gap-2 shrink-0 px-2 py-0.5 rounded-lg bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 text-amber-800 dark:text-amber-300">
            <Scale className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="font-semibold">{t.ticker.gap.toUpperCase()}:</span>
            <span className="font-bold">+{formatVndMillions(gapData.gapVnd)}</span>
            <span className="text-[10px] text-amber-700 dark:text-amber-300/80">({formatPercent(gapData.gapPercent)})</span>
          </div>
        )}

        {/* Asset Items */}
        {prices.map((p) => {
          const isUp = (p.change24hPercent ?? 0) >= 0;
          const isVnd = p.currency === 'VND' && p.assetCode !== 'USD_VND';
          const isFx = p.assetCode === 'USD_VND';

          const formattedPrice = isVnd
            ? formatVndMillions(p.sellPrice)
            : isFx
            ? `${p.sellPrice.toLocaleString()} ₫`
            : formatUsd(p.sellPrice);

          return (
            <div key={p.assetCode} className="flex items-center gap-2 shrink-0">
              <span className="font-bold text-slate-800 dark:text-slate-200">{p.assetCode}</span>
              <span className="text-slate-900 dark:text-white font-semibold">{formattedPrice}</span>
              {p.change24hPercent !== undefined && (
                <span
                  className={`inline-flex items-center text-[10px] font-semibold px-1 rounded ${
                    isUp
                      ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
                      : 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10'
                  }`}
                >
                  {isUp ? <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> : <TrendingDown className="w-2.5 h-2.5 mr-0.5" />}
                  {formatPercent(p.change24hPercent)}
                </span>
              )}
              <span className="text-slate-300 dark:text-pulse-800 select-none">|</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
