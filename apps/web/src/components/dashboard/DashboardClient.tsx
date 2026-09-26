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
import { MarketTickerTape } from './MarketTickerTape';
import { GoldGapCard } from './GoldGapCard';
import { ProviderCard } from './ProviderCard';
import { AssetTableView } from './AssetTableView';
import { PriceEventChart } from '../chart/PriceEventChart';
import { LiveEventsFeed } from './LiveEventsFeed';
import {
  RefreshCw,
  Layers,
  Compass,
  ArrowRight,
  Activity,
  LayoutGrid,
  Table as TableIcon,
  Clock,
  Globe2
} from 'lucide-react';
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
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');
  const [clockString, setClockString] = useState<string>('');

  const { status, latestPriceTick, latestGap, latestEvent, lastHeartbeat } = usePulseStream();

  // Load health status on mount
  useEffect(() => {
    fetchMarketHealth().then(setHealth).catch(() => {});
    const interval = setInterval(() => {
      fetchMarketHealth().then(setHealth).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Update clock every minute
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const ictTime = new Date(now.getTime() + 7 * 3600000).toISOString().slice(11, 16);
      const utcTime = now.toISOString().slice(11, 16);
      setClockString(`${ictTime} ICT · ${utcTime} UTC`);
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
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

  // Domestic session detection (Mon-Sat 08:00 - 17:00 ICT)
  const isDomesticOpen = (() => {
    const d = new Date();
    const ict = new Date(d.getTime() + 7 * 3600000);
    const day = ict.getUTCDay();
    const mins = ict.getUTCHours() * 60 + ict.getUTCMinutes();
    return day >= 1 && day <= 6 && mins >= 480 && mins < 1020;
  })();

  const domesticPrices = prices.filter((p) => p.currency === 'VND' && p.assetCode !== 'USD_VND');
  const macroPrices = prices.filter((p) => p.assetCode === 'XAU_USD' || p.assetCode === 'USD_VND');

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Financial Ticker Tape */}
      <MarketTickerTape prices={prices} gapData={gapData} />

      {/* Reconnection Status Banner (when SSE disconnected or degraded) */}
      {status !== 'ONLINE' && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between gap-3 text-xs text-amber-800 dark:text-amber-300"
        >
          <div className="flex items-center gap-2 truncate">
            <RefreshCw className="w-3.5 h-3.5 shrink-0 animate-spin text-amber-600 dark:text-amber-400" />
            <span className="truncate">
              {status === 'CONNECTING'
                ? 'Reconnecting to real-time market ingestion worker...'
                : 'Real-time stream offline. Serving cached quotes with automatic background retry.'}
            </span>
          </div>
          <button
            onClick={handleRefresh}
            className="text-[11px] font-mono font-bold underline hover:text-amber-950 dark:hover:text-white shrink-0"
          >
            Retry now
          </button>
        </div>
      )}

      {/* Action Header & Live Session Status Radar */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-slate-200 dark:border-pulse-800/80">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="px-2.5 py-1 text-[11px] font-mono font-bold tracking-wider rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 shrink-0">
            <Compass className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>VERTICAL 01</span>
          </span>

          <MarketHealthBadge
            status={health?.status}
            streamStatus={status}
            lastSync={health?.lastSync || lastHeartbeat}
            circuitBreakers={health?.circuitBreakers}
          />

          {/* Market Session Status Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-pulse-950 border border-slate-200 dark:border-pulse-800 text-[11px] font-mono">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                isDomesticOpen ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-pulse-600'
              }`}
            />
            <span className="text-slate-600 dark:text-pulse-400 font-medium">
              VN BULLION: <strong className={isDomesticOpen ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500'}>{isDomesticOpen ? 'OPEN' : 'CLOSED'}</strong>
            </span>
            {clockString && <span className="text-slate-400 dark:text-pulse-500">· {clockString}</span>}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-pulse-900 dark:hover:bg-pulse-800 text-slate-700 dark:text-pulse-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-pulse-800 text-xs font-semibold min-h-[44px] transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
            aria-label="Refresh price and event data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            href="/gold"
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:text-emerald-400 border border-transparent dark:border-emerald-500/20 text-xs font-semibold min-h-[44px] transition-colors shadow-xs"
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
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 id="bullion-heading" className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-wide flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Domestic Bullion & Supporting Rates</span>
          </h2>

          <div className="flex items-center gap-3">
            {/* View Mode Switcher (Grid vs Table) */}
            <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-pulse-950 border border-slate-200 dark:border-pulse-800">
              <button
                onClick={() => setViewMode('GRID')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'GRID'
                    ? 'bg-white dark:bg-pulse-800 text-emerald-700 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-500 dark:text-pulse-400 hover:text-slate-800'
                }`}
                title="Grid Cards View"
                aria-label="Switch to Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('TABLE')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'TABLE'
                    ? 'bg-white dark:bg-pulse-800 text-emerald-700 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-500 dark:text-pulse-400 hover:text-slate-800'
                }`}
                title="Table View"
                aria-label="Switch to Table View"
              >
                <TableIcon className="w-3.5 h-3.5" />
              </button>
            </div>

            <Link
              href="/gold"
              className="text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>View All Specs</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {viewMode === 'GRID' ? (
          <>
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
          </>
        ) : (
          <AssetTableView prices={prices} />
        )}
      </section>

      {/* Upgraded Multi-View Financial Chart with Interactive Event Markers */}
      <section aria-labelledby="chart-heading">
        <h2 id="chart-heading" className="sr-only">Interactive Price Timeline Chart</h2>
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
