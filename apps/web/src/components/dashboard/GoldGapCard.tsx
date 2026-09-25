'use client';

import React, { useState } from 'react';
import { GoldGapAnalysis, formatVndMillions, formatPercent, formatUsd, formatVnd } from '@frabpulse/shared';
import { Scale, Info, ArrowUpRight, HelpCircle } from 'lucide-react';

interface GoldGapCardProps {
  gapData: GoldGapAnalysis;
}

export function GoldGapCard({ gapData }: GoldGapCardProps) {
  const [showFormula, setShowFormula] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pulse-900 via-pulse-900/90 to-pulse-850 border border-emerald-500/20 p-6 shadow-xl shadow-black/20">
      {/* Background glow accent */}
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-white tracking-tight">
                Vietnam vs. World Gold Gap
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ARBITRAGE METRIC
              </span>
            </div>
            <p className="text-xs text-pulse-400 mt-0.5">
              Empirical spread between domestic SJC 9999 and converted international XAU/USD
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowFormula(!showFormula)}
          className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 px-3 py-1.5 rounded-lg bg-pulse-800/80 hover:bg-pulse-800 border border-emerald-500/20 transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{showFormula ? 'Hide Formula' : 'Inspect Math'}</span>
        </button>
      </div>

      {/* Main Stats Display */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-xl bg-pulse-950/60 border border-pulse-800/80">
          <span className="text-xs text-pulse-400 block mb-1">Domestic Premium (VND)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-400">
              +{formatVndMillions(gapData.gapVnd)}
            </span>
          </div>
          <span className="text-[11px] text-pulse-500 mt-1 block">
            {formatVnd(gapData.gapVnd)} / lượng
          </span>
        </div>

        <div className="p-4 rounded-xl bg-pulse-950/60 border border-pulse-800/80">
          <span className="text-xs text-pulse-400 block mb-1">Percentage Premium</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-400 flex items-center">
              {formatPercent(gapData.gapPercent)}
              <ArrowUpRight className="w-4 h-4 ml-0.5 text-emerald-400" />
            </span>
          </div>
          <span className="text-[11px] text-pulse-500 mt-1 block">
            Relative to world spot benchmark
          </span>
        </div>

        <div className="p-4 rounded-xl bg-pulse-950/60 border border-pulse-800/80">
          <span className="text-xs text-pulse-400 block mb-1">Converted World Spot (VND)</span>
          <div className="text-2xl font-bold font-mono text-white">
            {formatVndMillions(gapData.worldPriceVndPerTael)}
          </div>
          <span className="text-[11px] text-pulse-500 mt-1 block">
            @{formatUsd(gapData.xauUsd)}/oz × {gapData.usdVnd.toLocaleString()} VND/USD
          </span>
        </div>
      </div>

      {/* Formula Transparency Drawer */}
      {showFormula && (
        <div className="mt-4 p-4 rounded-xl bg-pulse-950/90 border border-emerald-500/30 text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-2">
            <Info className="w-4 h-4" />
            <span>Mathematical Conversion Standard</span>
          </div>
          <p className="text-pulse-300 leading-relaxed font-mono">
            World Price (VND/lượng) = XAU/USD ({formatUsd(gapData.xauUsd)}) × USD/VND ({gapData.usdVnd.toLocaleString()}) × 1.20565
          </p>
          <p className="text-pulse-300 leading-relaxed font-mono mt-1">
            Gap (VND) = Domestic SJC ({formatVndMillions(gapData.domesticPriceVndPerTael)}) - Converted World ({formatVndMillions(gapData.worldPriceVndPerTael)}) = +{formatVndMillions(gapData.gapVnd)}
          </p>
          <p className="text-pulse-400 mt-2 text-[11px]">
            * 1 Vietnamese lượng (cây) equals 37.5 grams. 1 Troy Ounce equals 31.1035 grams. 37.5 / 31.1035 = 1.20565 ratio.
          </p>
        </div>
      )}
    </div>
  );
}
