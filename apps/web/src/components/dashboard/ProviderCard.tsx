import React from 'react';
import { PriceSnapshot, ASSET_DEFINITIONS, formatVndMillions, formatUsd, formatPercent } from '@frabpulse/shared';
import { ArrowUpRight, ArrowDownRight, Layers, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface ProviderCardProps {
  price: PriceSnapshot;
}

export function ProviderCard({ price }: ProviderCardProps) {
  const meta = ASSET_DEFINITIONS[price.assetCode];
  const isUp = (price.change24hPercent ?? 0) >= 0;
  const isDomesticGold = price.currency === 'VND' && price.assetCode !== 'USD_VND';
  const isForex = price.assetCode === 'USD_VND';
  const slug = meta ? meta.slug : price.assetCode.toLowerCase();

  const formatPrice = (amount: number) => {
    if (isDomesticGold) return formatVndMillions(amount);
    if (isForex) return `${amount.toLocaleString()} ₫`;
    return formatUsd(amount);
  };

  const formatSpread = (spread: number) => {
    if (isDomesticGold) return formatVndMillions(spread);
    if (isForex) return `${spread} ₫`;
    return `$${spread.toFixed(2)}`;
  };

  return (
    <div className="relative rounded-2xl bg-pulse-900/90 border border-pulse-800 hover:border-pulse-700 p-4 sm:p-5 transition-all hover:shadow-lg hover:shadow-black/20 group flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-pulse-800 text-pulse-300">
                {meta ? meta.symbol : price.assetCode}
              </span>
              <span className="text-[11px] sm:text-xs text-pulse-400">{price.providerCode}</span>
            </div>
            <Link
              href={`/gold/${slug}`}
              className="text-sm font-semibold text-white mt-1 group-hover:text-emerald-300 transition-colors block hover:underline underline-offset-2"
            >
              {meta ? meta.name : price.assetCode}
            </Link>
          </div>

          {price.change24hPercent !== undefined && (
            <div
              className={`flex items-center text-xs font-mono font-medium px-2 py-1 rounded-lg ${
                isUp
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
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
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-pulse-800/80">
          <div>
            <span className="text-[10px] sm:text-[11px] text-pulse-400 block mb-0.5">Buy (Bid)</span>
            <span className="text-sm sm:text-base font-bold font-mono text-pulse-200 truncate block">
              {formatPrice(price.buyPrice)}
            </span>
          </div>
          <div>
            <span className="text-[10px] sm:text-[11px] text-pulse-400 block mb-0.5">Sell (Ask)</span>
            <span className="text-sm sm:text-base font-bold font-mono text-white truncate block">
              {formatPrice(price.sellPrice)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-pulse-800/40 text-[11px] text-pulse-400">
        <span className="flex items-center gap-1 truncate">
          <Layers className="w-3 h-3 text-pulse-500 shrink-0" />
          <span className="truncate">Spread: {formatSpread(price.spread)}</span>
        </span>

        <Link
          href={`/gold/${slug}`}
          className="text-emerald-400/90 hover:text-emerald-300 font-mono text-[10px] flex items-center gap-0.5 shrink-0 min-h-[36px] items-center"
          aria-label={`View detailed historical quotes for ${meta?.name || price.assetCode}`}
        >
          <span>Details</span>
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
