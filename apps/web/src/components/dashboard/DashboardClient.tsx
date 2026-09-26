'use client';

import React, { useEffect, useState } from 'react';
import {
  PriceSnapshot,
  GoldGapAnalysis,
  MarketEvent,
  PriceCandle,
  MarketHealthStatus
} from '@frabpulse/shared';
import {
  fetchLatestPrices,
  fetchGoldGap,
  fetchHistoricalChart,
  fetchMarketEvents,
  fetchMarketHealth
} from '../../lib/api-client';
import { usePulseStream } from '../../lib/use-pulse-stream';
import { MarketHealthBadge } from './MarketHealthBadge';
import { GoldGapCard } from './GoldGapCard';
import { ProviderCard } from './ProviderCard';
import { PriceEventChart } from '../chart/PriceEventChart';
import { LiveEventsFeed } from './LiveEventsFeed';
import { RefreshCw, Layers, Compass, ArrowRight, Activity, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface DashboardClientProps {
  initialPrices: PriceSnapshot[];
  initialGap: GoldGapAnalysis;
  initialEvents: MarketEvent[];
  initialXauCandles: PriceCandle[];
  initialSjcCandles: PriceCandle[];
}

export function DashboardClient({
  initialPrices,
  initialGap,
  initialEvents,
  initialXauCandles,
  initialSjcCandles
}: DashboardClientProps) {
  const [prices, setPrices] = useState<PriceSnapshot[]>(initialPrices);
  const [gapData, setGapData] = useState<GoldGapAnalysis>(initialGap);
  const [events, setEvents] = useState<MarketEvent[]>(initialEvents);
  const [xauCandles, setXauCandles] = useState<PriceCandle[]>(initialXauCandles);
  const [sjcCandles, setSjcCandles] = useState<PriceCandle[]>(initialSjcCandles);
  const [health, setHealth] = useState<MarketHealthStatus | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { status, latestPriceTick, latestGap, latestEvent, lastHeartbeat } = usePulseStream();

  // Load health status on mount
  useEffect(() => {
    fetchMarketHealth().then(setHealth).catch(() => {});
    const interval = setInterval(() => {
      fetchMarketHealth().then(setHealth).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const [p, g, evts, xau, sjc, h] = await Promise.all([
        fetchLatestPrices(),
        fetchGoldGap(),
        fetchMarketEvents(),
        fetchHistoricalChart('XAU_USD'),
        fetchHistoricalChart('SJC_VN'),
        fetchMarketHealth()
      ]);
      setPrices(p);
      setGapData(g);
      setEvents(evts);
      setXauCandles(xau);
      setSjcCandles(sjc);
      setHealth(h);
    } finally {
      setIsRefreshing(false);
    }
  };

  // SSE real-time ticks
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
    <div className="space-y-6 sm:space-y-8">
      {/* Reconnection Status Banner (when SSE disconnected or degraded) */}
      {status !== 'ONLINE' && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between gap-3 text-xs text-amber-300"
        >
          <div className="flex items-center gap-2 truncate">
            <RefreshCw className="w-3.5 h-3.5 shrink-0 animate-spin text-amber-400" />
            <span className="truncate">
              {status === 'CONNECTING'
                ? 'Reconnecting to real-time market ingestion worker...'
                : 'Real-time stream offline. Serving cached quotes with automatic background retry.'}
            </span>
          </div>
          <button
            onClick={handleRefresh}
            className="text-[11px] font-mono underline hover:text-white shrink-0"
          >
            Retry now
          </button>
        </div>
      )}

      {/* Action Header & Live Health Radar */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-2 border-b border-pulse-800/60">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2 py-1 text-[10px] sm:text-xs font-mono font-bold tracking-wider rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 shrink-0">
            <Compass className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>VERTICAL 01</span>
          </span>

          <MarketHealthBadge
            status={health?.status}
            streamStatus={status}
            lastSync={health?.lastSync || lastHeartbeat}
            circuitBreakers={health?.circuitBreakers}
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-pulse-900 hover:bg-pulse-800 text-pulse-300 hover:text-white border border-pulse-800 text-xs font-medium min-h-[44px] transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
            aria-label="Refresh price and event data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            href="/gold"
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-medium min-h-[44px] transition-colors"
          >
            <span>Gold Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Vietnam vs World Gold Gap Hero Card */}
      <GoldGapCard gapData={gapData} />

      {/* High-priority Section: Bullion & Rates */}
      <section aria-labelledby="bullion-heading" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="bullion-heading" className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Domestic Bullion & Supporting Rates</span>
          </h2>
          <Link
            href="/gold"
            className="text-[11px] font-mono text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>View All Specs</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Responsive Grid: 1 col on mobile, 2 col on tablet, 3 col on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {domesticPrices.map((price) => (
            <ProviderCard key={price.assetCode} price={price} />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
          {macroPrices.map((price) => (
            <ProviderCard key={price.assetCode} price={price} />
          ))}
        </div>
      </section>

      {/* Financial Chart with Interactive Event Markers */}
      <section aria-labelledby="chart-heading">
        <h2 id="chart-heading" className="sr-only">Price Timeline Chart</h2>
        <PriceEventChart
          xauCandles={xauCandles}
          sjcCandles={sjcCandles}
          events={events}
        />
      </section>

      {/* Live Clustered Events Feed */}
      <section aria-labelledby="events-heading">
        <h2 id="events-heading" className="sr-only">Live Event Intelligence Feed</h2>
        <LiveEventsFeed events={events} />
      </section>
    </div>
  );
}
