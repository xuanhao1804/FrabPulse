'use client';

import React, { useState } from 'react';
import { GoldGapAnalysis, formatVndMillions, formatPercent, formatUsd, formatVnd } from '@frabpulse/shared';
import { Scale, Info, ArrowUpRight, HelpCircle, Layers } from 'lucide-react';
import Link from 'next/link';

interface GoldGapCardProps {
  gapData: GoldGapAnalysis;
}

export function GoldGapCard({ gapData }: GoldGapCardProps) {
  const [showFormula, setShowFormula] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pulse-900 via-pulse-900/90 to-pulse-850 border border-emerald-500/20 p-4 sm:p-6 shadow-xl shadow-black/20">
      {/* Background glow accent */}
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
            <Scale className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-semibold text-white tracking-tight">
                Vietnam vs. World Gold Gap
              </h2>
              <span className="px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-mono rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ARBITRAGE SPREAD
              </span>
              {gapData.sourceType === 'LIVE_FEED' && (
                <span className="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  REAL-TIME MARKET
                </span>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-pulse-400 mt-0.5">
              Empirical spread between SJC 9999 and converted international spot bullion
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setShowFormula(!showFormula)}
            className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 min-h-[44px] px-3 py-2 rounded-xl bg-pulse-800/80 hover:bg-pulse-800 border border-emerald-500/20 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
            aria-expanded={showFormula}
            aria-label="Inspect mathematical conversion formula"
          >
            <HelpCircle className="w-4 h-4" />
            <span>{showFormula ? 'Hide Formula' : 'Inspect Math'}</span>
          </button>
        </div>
      </div>

      {/* Main Stats Display: 1 col on mobile, 3 cols on tablet/desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-1">
        <div className="p-3.5 sm:p-4 rounded-xl bg-pulse-950/70 border border-pulse-800/80">
          <span className="text-[11px] sm:text-xs text-pulse-400 block mb-1">Domestic Premium (VND)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
              +{formatVndMillions(gapData.gapVnd)}
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-pulse-500 mt-1 block truncate">
            {formatVnd(gapData.gapVnd)} / lượng
          </span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-xl bg-pulse-950/70 border border-pulse-800/80">
          <span className="text-[11px] sm:text-xs text-pulse-400 block mb-1">Percentage Premium</span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 flex items-center">
              {formatPercent(gapData.gapPercent)}
              <ArrowUpRight className="w-4 h-4 ml-0.5 text-emerald-400 shrink-0" />
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-pulse-500 mt-1 block">
            Relative to world spot benchmark
          </span>
        </div>

        <div className="p-3.5 sm:p-4 rounded-xl bg-pulse-950/70 border border-pulse-800/80">
          <span className="text-[11px] sm:text-xs text-pulse-400 block mb-1">Converted World Spot</span>
          <div className="text-xl sm:text-2xl font-bold font-mono text-white">
            {formatVndMillions(gapData.worldPriceVndPerTael)}
          </div>
          <span className="text-[10px] sm:text-[11px] text-pulse-500 mt-1 block truncate">
            @{formatUsd(gapData.xauUsd)}/oz × {gapData.usdVnd.toLocaleString()} ₫
          </span>
        </div>
      </div>

      {/* Formula Transparency Drawer */}
      {showFormula && (
        <div className="mt-4 p-4 rounded-xl bg-pulse-950/95 border border-emerald-500/30 text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-2">
            <Info className="w-4 h-4 shrink-0" />
            <span>Mathematical Conversion Standard</span>
          </div>
          <div className="space-y-1 text-pulse-300 font-mono text-[11px] sm:text-xs break-all sm:break-normal">
            <p>
              World (VND/lượng) = {formatUsd(gapData.xauUsd)} × {gapData.usdVnd.toLocaleString()} × 1.20565 = {formatVndMillions(gapData.worldPriceVndPerTael)}
            </p>
            <p>
              Gap (VND) = {formatVndMillions(gapData.domesticPriceVndPerTael)} (SJC) - {formatVndMillions(gapData.worldPriceVndPerTael)} = +{formatVndMillions(gapData.gapVnd)}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-pulse-900 flex items-center justify-between flex-wrap gap-2 text-[11px]">
            <span className="text-pulse-500">
              * 1 Vietnamese lượng = 37.5g; 1 Troy Ounce = 31.1035g (ratio: 1.20565).
            </span>
            <Link
              href="/methodology"
              className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 flex items-center gap-1 font-sans"
            >
              <span>Read Methodology</span>
              <Layers className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
