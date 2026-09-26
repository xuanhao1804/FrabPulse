'use client';

import React from 'react';
import { PriceSnapshot, ASSET_DEFINITIONS, formatVndMillions, formatUsd, formatPercent } from '@frabpulse/shared';
import { ArrowUpRight, ArrowDownRight, ChevronRight } from 'lucide-react';
import { MarketHealthBadge } from './MarketHealthBadge';
import { formatTimeAgo, formatAbsoluteDateTime } from '../../lib/utils';
import Link from 'next/link';

interface AssetTableViewProps {
  prices: PriceSnapshot[];
}

export function AssetTableView({ prices }: AssetTableViewProps) {
  if (!prices || prices.length === 0) return null;

  return (
    <div className="w-full overflow-x-auto rounded-2xl bg-white dark:bg-pulse-900/90 border border-slate-200 dark:border-pulse-800 shadow-xs">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-slate-200 dark:border-pulse-800 bg-slate-50/80 dark:bg-pulse-950/60 font-mono text-[11px] text-slate-500 dark:text-pulse-400 uppercase tracking-wider">
            <th className="py-3 px-4">Asset</th>
            <th className="py-3 px-3">Provider</th>
            <th className="py-3 px-4 text-right">Bid (Buy)</th>
            <th className="py-3 px-4 text-right">Ask (Sell)</th>
            <th className="py-3 px-3 text-right">Spread</th>
            <th className="py-3 px-3 text-right">24h Change</th>
            <th className="py-3 px-3 text-center">Status</th>
            <th className="py-3 px-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-pulse-800/60 font-mono">
          {prices.map((p) => {
            const meta = ASSET_DEFINITIONS[p.assetCode];
            const isUp = (p.change24hPercent ?? 0) >= 0;
            const isVnd = p.currency === 'VND' && p.assetCode !== 'USD_VND';
            const isFx = p.assetCode === 'USD_VND';
            const slug = meta ? meta.slug : p.assetCode.toLowerCase();

            const formatVal = (amt: number) => {
              if (isVnd) return formatVndMillions(amt);
              if (isFx) return `${amt.toLocaleString()} ₫`;
              return formatUsd(amt);
            };

            const syncTime = p.lastFetchedAt || p.timestamp;
            const absoluteDates = syncTime ? formatAbsoluteDateTime(syncTime) : null;

            return (
              <tr
                key={p.assetCode}
                className="hover:bg-slate-50/80 dark:hover:bg-pulse-850/60 transition-colors"
              >
                {/* Asset */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {meta ? meta.symbol : p.assetCode}
                    </span>
                    <span className="font-sans text-[11px] text-slate-500 dark:text-pulse-400 hidden sm:inline truncate max-w-[130px]">
                      {meta ? meta.name : ''}
                    </span>
                  </div>
                </td>

                {/* Provider */}
                <td className="py-3 px-3 text-slate-600 dark:text-pulse-300 text-[11px]">
                  {p.providerCode}
                </td>

                {/* Bid */}
                <td className="py-3 px-4 text-right font-bold text-slate-700 dark:text-pulse-200 tabular-nums">
                  {formatVal(p.buyPrice)}
                </td>

                {/* Ask */}
                <td className="py-3 px-4 text-right font-extrabold text-slate-900 dark:text-white tabular-nums">
                  {formatVal(p.sellPrice)}
                </td>

                {/* Spread */}
                <td className="py-3 px-3 text-right text-slate-600 dark:text-pulse-300 tabular-nums">
                  {isVnd ? formatVndMillions(p.spread) : isFx ? `${p.spread} ₫` : `$${p.spread.toFixed(2)}`}
                </td>

                {/* 24h Change */}
                <td className="py-3 px-3 text-right">
                  {p.change24hPercent !== undefined && (
                    <span
                      className={`inline-flex items-center font-bold px-1.5 py-0.5 rounded text-[11px] tabular-nums ${
                        isUp
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                          : 'bg-rose-500/10 text-rose-700 dark:text-rose-400'
                      }`}
                    >
                      {isUp ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                      {formatPercent(p.change24hPercent)}
                    </span>
                  )}
                </td>

                {/* Status */}
                <td className="py-3 px-3 text-center">
                  <MarketHealthBadge
                    sourceType={p.sourceType}
                    lastSync={syncTime}
                    compact
                  />
                </td>

                {/* Action */}
                <td className="py-3 px-4 text-right">
                  <Link
                    href={`/gold/${slug}`}
                    className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    <span>Inspect</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
