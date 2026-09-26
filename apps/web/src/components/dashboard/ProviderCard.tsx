'use client';

import React from 'react';
import { PriceSnapshot, ASSET_DEFINITIONS, formatVndMillions, formatUsd, formatPercent } from '@frabpulse/shared';
import { ArrowUpRight, ArrowDownRight, Layers, ChevronRight, Clock } from 'lucide-react';
import { MarketHealthBadge } from './MarketHealthBadge';
import { formatTimeAgo, formatAbsoluteDateTime } from '../../lib/utils';
import Link from 'next/link';
import { useLanguage } from '../../lib/i18n/LanguageContext';
import { formatPriceLocale, formatPercentLocale } from '../../lib/formatters';

interface ProviderCardProps {
  price: PriceSnapshot;
}

export function ProviderCard({ price }: ProviderCardProps) {
  const { t, locale } = useLanguage();
  const meta = ASSET_DEFINITIONS[price.assetCode];
  const isUp = (price.change24hPercent ?? 0) >= 0;
  const isDomesticGold = price.currency === 'VND' && price.assetCode !== 'USD_VND';
  const isForex = price.assetCode === 'USD_VND';
  const slug = meta ? meta.slug : price.assetCode.toLowerCase();

  const syncTime = price.lastFetchedAt || price.timestamp;
  const relativeFreshness = syncTime ? formatTimeAgo(syncTime) : null;
  const absoluteDates = syncTime ? formatAbsoluteDateTime(syncTime) : null;

  const formatPrice = (amount: number) => {
    if (isDomesticGold) return formatPriceLocale(amount, 'VND', locale, true);
    if (isForex) return formatPriceLocale(amount, 'VND', locale, false);
    return formatPriceLocale(amount, 'USD', locale, false);
  };

  const formatSpread = (spread: number) => {
    if (isDomesticGold) return formatPriceLocale(spread, 'VND', locale, true);
    if (isForex) return formatPriceLocale(spread, 'VND', locale, false);
    return formatPriceLocale(spread, 'USD', locale, false);
  };

  return (
    <div className="relative rounded-2xl bg-white dark:bg-pulse-900/90 border border-slate-200 dark:border-pulse-800 hover:border-slate-300 dark:hover:border-pulse-700 p-4 sm:p-5 transition-all shadow-xs hover:shadow-sm dark:shadow-lg dark:shadow-black/20 group flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-1">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-pulse-800 text-slate-700 dark:text-pulse-300 border border-slate-200 dark:border-pulse-700">
                {meta ? meta.symbol : price.assetCode}
              </span>
              <span className="text-[11px] font-mono text-slate-500 dark:text-pulse-400 truncate max-w-[120px]" title={price.providerCode}>
                {price.providerCode}
              </span>
              <MarketHealthBadge
                sourceType={price.sourceType}
                lastSync={syncTime}
                compact
              />
            </div>
            <Link
              href={`/gold/${slug}`}
              className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors block hover:underline underline-offset-2 truncate"
            >
              {meta ? meta.name : price.assetCode}
            </Link>
          </div>

          {price.change24hPercent !== undefined && (
            <div
              className={`flex items-center text-xs font-mono font-bold px-2 py-1 rounded-lg shrink-0 ${
                isUp
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'
              }`}
            >
              {isUp ? (
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5 shrink-0" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5 shrink-0" />
              )}
              <span>{formatPercent(price.change24hPercent)}</span>
            </div>
          )}
        </div>

        {/* Buy / Sell display */}
        <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-slate-100 dark:border-pulse-800/80">
          <div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-pulse-400 block mb-0.5">{t.providers.buyBid}</span>
            <span className="text-base sm:text-lg font-extrabold font-mono tabular-nums text-slate-700 dark:text-pulse-200 truncate block">
              {formatPrice(price.buyPrice)}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-pulse-400 block mb-0.5">{t.providers.sellAsk}</span>
            <span className="text-base sm:text-lg font-extrabold font-mono tabular-nums text-slate-900 dark:text-white truncate block">
              {formatPrice(price.sellPrice)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 dark:border-pulse-800/40 text-[11px] text-slate-500 dark:text-pulse-400">
        <span className="flex items-center gap-1 truncate" title={absoluteDates ? `${absoluteDates.ict} | ${absoluteDates.utc}` : undefined}>
          <Layers className="w-3 h-3 text-slate-400 dark:text-pulse-500 shrink-0" />
          <span className="truncate font-mono">{t.providers.spread}: {formatSpread(price.spread)}</span>
          {relativeFreshness && (
            <span className="text-slate-400 dark:text-pulse-500 text-[10px] hidden xs:inline truncate">
              · {relativeFreshness}
            </span>
          )}
        </span>

        <Link
          href={`/gold/${slug}`}
          className="text-emerald-700 dark:text-emerald-400/90 hover:text-emerald-600 dark:hover:text-emerald-300 font-mono text-[11px] font-semibold flex items-center gap-0.5 shrink-0 min-h-[36px]"
          aria-label={`View detailed historical quotes for ${meta?.name || price.assetCode}`}
        >
          <span>{t.providers.details}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
