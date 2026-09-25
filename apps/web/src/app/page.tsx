'use client';

import React, { useEffect, useState } from 'react';
import {
  PriceSnapshot,
  GoldGapAnalysis,
  MarketEvent,
  PriceCandle,
  calculateGoldGap
} from '@frabpulse/shared';
import {
  fetchLatestPrices,
  fetchGoldGap,
  fetchHistoricalChart,
  fetchMarketEvents
} from '../lib/api-client';
import { usePulseStream } from '../lib/use-pulse-stream';
import { GoldGapCard } from '../components/dashboard/GoldGapCard';
import { ProviderCard } from '../components/dashboard/ProviderCard';
import { PriceEventChart } from '../components/chart/PriceEventChart';
import { LiveEventsFeed } from '../components/dashboard/LiveEventsFeed';
import { Sparkles, RefreshCw, Layers, Compass } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [prices, setPrices] = useState<PriceSnapshot[]>([]);
  const [gapData, setGapData] = useState<GoldGapAnalysis | null>(null);
  const [events, setEvents] = useState<MarketEvent[]>([]);
  const [xauCandles, setXauCandles] = useState<PriceCandle[]>([]);
  const [sjcCandles, setSjcCandles] = useState<PriceCandle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { latestPriceTick, latestGap, latestEvent } = usePulseStream();

  // Load initial data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [p, g, evts, xau, sjc] = await Promise.all([
        fetchLatestPrices(),
        fetchGoldGap(),
        fetchMarketEvents(),
        fetchHistoricalChart('XAU_USD'),
        fetchHistoricalChart('SJC_VN')
      ]);
      setPrices(p);
      setGapData(g);
      setEvents(evts);
      setXauCandles(xau);
      setSjcCandles(sjc);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update in real-time when SSE messages arrive
  useEffect(() => {
    if (latestPriceTick) {
      setPrices((prev) =>
        prev.map((item) =>
          item.assetCode === latestPriceTick.assetCode ? latestPriceTick : item
        )
      );
    }
  }, [latestPriceTick]);

  useEffect(() => {
    if (latestGap) {
      setGapData(latestGap);
    }
  }, [latestGap]);

  useEffect(() => {
    if (latestEvent) {
      setEvents((prev) => [latestEvent, ...prev.filter((e) => e.id !== latestEvent.id)]);
    }
  }, [latestEvent]);

  const domesticPrices = prices.filter((p) => p.currency === 'VND' && p.assetCode !== 'USD_VND');
  const macroPrices = prices.filter((p) => p.assetCode === 'XAU_USD' || p.assetCode === 'USD_VND');

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 pb-2 border-b border-pulse-800/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-mono font-bold tracking-wider rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span>VERTICAL 01</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Gold Pulse Radar
            </h1>
          </div>
          <p className="text-sm text-pulse-400 mt-1 max-w-2xl">
            Real-time domestic bullion quotations, global spot gold correlation, and multi-source event intelligence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-pulse-900 hover:bg-pulse-800 text-pulse-300 hover:text-white border border-pulse-800 text-xs font-medium transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Snapshot</span>
          </button>

          <Link
            href="/methodology"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-medium transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Epistemology Guide</span>
          </Link>
        </div>
      </div>

      {/* Vietnam vs World Gold Gap Hero Card */}
      {gapData && <GoldGapCard gapData={gapData} />}

      {/* Provider Quotations Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Domestic Bullion & Supporting Rates</span>
          </h2>
          <span className="text-[11px] font-mono text-pulse-400">
            PRICES IN VND / LƯỢNG & USD / OZ
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {domesticPrices.map((price) => (
            <ProviderCard key={price.assetCode} price={price} />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {macroPrices.map((price) => (
            <ProviderCard key={price.assetCode} price={price} />
          ))}
        </div>
      </div>

      {/* Financial Chart with Interactive Event Markers */}
      <PriceEventChart
        xauCandles={xauCandles}
        sjcCandles={sjcCandles}
        events={events}
      />

      {/* Live Event Stream */}
      <LiveEventsFeed events={events} />
    </div>
  );
}
