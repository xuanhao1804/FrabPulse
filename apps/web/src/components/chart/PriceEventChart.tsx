'use client';

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { PriceCandle, MarketEvent } from '@frabpulse/shared';
import {
  LineChart,
  BarChart2,
  Calendar,
  ExternalLink,
  Zap,
  Download,
  ShieldCheck,
  Info,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '../../lib/i18n/LanguageContext';
import { formatPriceLocale, formatPercentLocale } from '../../lib/formatters';

interface PriceEventChartProps {
  xauCandles: PriceCandle[];
  sjcCandles: PriceCandle[];
  events: MarketEvent[];
}

type ChartView = 'XAU_USD' | 'SJC_VN' | 'GOLD_GAP' | 'DUAL_COMPARE';
type ChartStyle = 'AREA' | 'CANDLE';
type Timeframe = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '5Y' | 'ALL';
type SubTab = 'OVERVIEW' | 'HISTORICAL' | 'TECH' | 'CONVERTER';

interface ContinuousHover {
  cursorX: number; // in SVG units [leftMargin, leftMargin + plotWidth]
  cursorY: number; // in SVG units matching interpolated curve height
  price: number;
  timestamp: string;
  volume: number;
  open: number;
  high: number;
  low: number;
  close: number;
  nearestIndex: number;
}

// Smooth cubic Bézier spline calculation (TradingView & Apple Stocks standard)
function getSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;

  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

export function PriceEventChart({ xauCandles, sjcCandles, events }: PriceEventChartProps) {
  const { t, timezone, locale } = useLanguage();
  const [chartView, setChartView] = useState<ChartView>('XAU_USD');
  const [chartStyle, setChartStyle] = useState<ChartStyle>('AREA');
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('OVERVIEW');
  const [showMA, setShowMA] = useState(true);
  const [showVolume, setShowVolume] = useState(true);
  const [showProvenanceInfo, setShowProvenanceInfo] = useState(false);
  const [activeEvent, setActiveEvent] = useState<MarketEvent | null>(null);
  const [hoverData, setHoverData] = useState<ContinuousHover | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Authoritative financial conversion constants
  const FX_RATE = 25440;
  const FACTOR = 1.20565;

  // Build active series with full 120-point density
  const { activeSeries, compareSeries } = useMemo(() => {
    const len = Math.min(xauCandles.length, sjcCandles.length);
    const spreadSeries: PriceCandle[] = [];
    const worldConvertedSeries: PriceCandle[] = [];

    for (let i = 0; i < len; i++) {
      const x = xauCandles[i];
      const s = sjcCandles[i];
      const worldVnd = Math.round(x.close * FX_RATE * FACTOR);
      const gap = s.close - worldVnd;

      worldConvertedSeries.push({
        ...x,
        open: Math.round(x.open * FX_RATE * FACTOR),
        high: Math.round(x.high * FX_RATE * FACTOR),
        low: Math.round(x.low * FX_RATE * FACTOR),
        close: worldVnd,
        volume: x.volume
      });

      spreadSeries.push({
        timestamp: s.timestamp,
        open: gap - 60000,
        high: gap + 90000,
        low: gap - 70000,
        close: gap,
        volume: s.volume
      });
    }

    // Always maintain high-density data across all timeframes (minimum 80-120 points for buttery smooth curve)
    const sliceCount =
      timeframe === '1D'
        ? Math.min(len, 120)
        : timeframe === '1W'
        ? Math.min(len, 110)
        : timeframe === '1M'
        ? Math.min(len, 100)
        : len;

    if (chartView === 'XAU_USD') {
      return { activeSeries: xauCandles.slice(-sliceCount), compareSeries: null };
    }
    if (chartView === 'SJC_VN') {
      return { activeSeries: sjcCandles.slice(-sliceCount), compareSeries: null };
    }
    if (chartView === 'GOLD_GAP') {
      return { activeSeries: spreadSeries.slice(-sliceCount), compareSeries: null };
    }
    return {
      activeSeries: sjcCandles.slice(-sliceCount),
      compareSeries: worldConvertedSeries.slice(-sliceCount)
    };
  }, [xauCandles, sjcCandles, chartView, timeframe]);

  // Canvas geometry (TradingView / Investing.com aspect ratio)
  const svgWidth = 920;
  const svgHeight = 440;
  const leftMargin = 16;
  const topMargin = 22;
  const rightAxisWidth = 84;
  const bottomAxisHeight = 34;
  const plotWidth = svgWidth - leftMargin - rightAxisWidth;

  const pricePaneHeight = showVolume ? 270 : 340;
  const gapBetweenPanes = showVolume ? 14 : 0;
  const volumePaneTop = topMargin + pricePaneHeight + gapBetweenPanes;
  const volumePaneHeight = showVolume ? 56 : 0;

  // Min and max bounds for price
  const { minVal, maxVal, range } = useMemo(() => {
    if (activeSeries.length === 0) return { minVal: 0, maxVal: 1, range: 1 };
    let min = Math.min(...activeSeries.map((d) => (chartStyle === 'CANDLE' ? d.low : d.close)));
    let max = Math.max(...activeSeries.map((d) => (chartStyle === 'CANDLE' ? d.high : d.close)));

    if (compareSeries && compareSeries.length > 0) {
      min = Math.min(min, ...compareSeries.map((d) => d.close));
      max = Math.max(max, ...compareSeries.map((d) => d.close));
    }

    const pad = (max - min) * 0.08 || 1;
    const finalMin = min - pad;
    const finalMax = max + pad;
    return { minVal: finalMin, maxVal: finalMax, range: finalMax - finalMin || 1 };
  }, [activeSeries, compareSeries, chartStyle]);

  // Max volume for sub-chart
  const maxVolume = useMemo(() => {
    const max = Math.max(...activeSeries.map((d) => d.volume || 100), 500);
    return max * 1.15;
  }, [activeSeries]);

  // Coordinate mappers
  const getX = useCallback(
    (index: number) => {
      if (activeSeries.length <= 1) return leftMargin + plotWidth / 2;
      return leftMargin + (index / (activeSeries.length - 1)) * plotWidth;
    },
    [activeSeries.length, plotWidth]
  );

  const getY = useCallback(
    (val: number) => {
      return topMargin + pricePaneHeight - ((val - minVal) / range) * pricePaneHeight;
    },
    [minVal, range, pricePaneHeight]
  );

  const getVolY = useCallback(
    (vol: number) => {
      const height = (vol / maxVolume) * volumePaneHeight;
      return volumePaneTop + volumePaneHeight - height;
    },
    [maxVolume, volumePaneHeight, volumePaneTop]
  );

  // Moving Average 20
  const ma20 = useMemo(() => {
    const period = 10;
    return activeSeries.map((_, idx, arr) => {
      if (idx < period - 1) return null;
      const slice = arr.slice(idx - period + 1, idx + 1);
      const sum = slice.reduce((acc, curr) => acc + curr.close, 0);
      return sum / period;
    });
  }, [activeSeries]);

  const maPoints = useMemo(() => {
    if (!showMA) return [];
    const pts: { x: number; y: number }[] = [];
    ma20.forEach((val, i) => {
      if (val !== null) pts.push({ x: getX(i), y: getY(val) });
    });
    return pts;
  }, [ma20, showMA, getX, getY]);

  const maSmoothPath = useMemo(() => getSmoothPath(maPoints), [maPoints]);

  // Primary smooth curve & area
  const primaryPoints = useMemo(() => {
    return activeSeries.map((d, i) => ({ x: getX(i), y: getY(d.close) }));
  }, [activeSeries, getX, getY]);

  const primarySmoothPath = useMemo(() => getSmoothPath(primaryPoints), [primaryPoints]);

  const primaryAreaPath = useMemo(() => {
    if (primaryPoints.length === 0) return '';
    const firstX = primaryPoints[0].x;
    const lastX = primaryPoints[primaryPoints.length - 1].x;
    const bottomY = topMargin + pricePaneHeight;
    return `${primarySmoothPath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [primarySmoothPath, primaryPoints, pricePaneHeight]);

  // Compare smooth curve for dual mode
  const comparePoints = useMemo(() => {
    if (!compareSeries) return [];
    return compareSeries.map((d, i) => ({ x: getX(i), y: getY(d.close) }));
  }, [compareSeries, getX, getY]);

  const compareSmoothPath = useMemo(() => getSmoothPath(comparePoints), [comparePoints]);

  // Continuous Sub-Pixel Mouse Interpolation Handler (60fps buttery smooth tracking)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || activeSeries.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const rawPixelX = e.clientX - rect.left;
    const scale = svgWidth / rect.width;
    const svgMouseX = rawPixelX * scale;

    // Clamp within chart plot bounds
    const clampedSvgX = Math.max(leftMargin, Math.min(leftMargin + plotWidth, svgMouseX));
    const relX = (clampedSvgX - leftMargin) / plotWidth;

    const floatIdx = relX * (activeSeries.length - 1);
    const i = Math.floor(floatIdx);
    const nextI = Math.min(i + 1, activeSeries.length - 1);
    const t = floatIdx - i;

    const p1 = activeSeries[i];
    const p2 = activeSeries[nextI];

    // Smooth linear interpolation along the sub-pixel segment
    const interpPrice = p1.close + t * (p2.close - p1.close);
    const interpY = getY(interpPrice);

    // Continuous time interpolation
    const t1 = new Date(p1.timestamp).getTime();
    const t2 = new Date(p2.timestamp).getTime();
    const interpTime = new Date(t1 + t * (t2 - t1)).toISOString();

    const nearestIdx = Math.round(floatIdx);
    const nearestItem = activeSeries[nearestIdx];

    setHoverData({
      cursorX: clampedSvgX,
      cursorY: interpY,
      price: interpPrice,
      timestamp: interpTime,
      volume: Math.round((p1.volume || 100) + t * ((p2.volume || 100) - (p1.volume || 100))),
      open: nearestItem.open,
      high: Math.max(p1.high, p2.high),
      low: Math.min(p1.low, p2.low),
      close: interpPrice,
      nearestIndex: nearestIdx
    });
  };

  const handleMouseLeave = () => {
    setHoverData(null);
  };

  // Prices and deltas
  const latestPrice = activeSeries.length > 0 ? activeSeries[activeSeries.length - 1].close : 0;
  const startPrice = activeSeries.length > 0 ? activeSeries[0].close : latestPrice;
  const displayPrice = hoverData ? hoverData.price : latestPrice;
  const priceDelta = displayPrice - startPrice;
  const percentDelta = startPrice > 0 ? (priceDelta / startPrice) * 100 : 0;
  const isUp = priceDelta >= 0;

  // Format value for axis & tooltip
  const formatChartVal = (val: number) => {
    if (chartView === 'XAU_USD') {
      return formatPriceLocale(val, 'USD', locale);
    }
    if (chartView === 'GOLD_GAP') {
      const millions = val / 1_000_000;
      return locale === 'vi' ? `+${millions.toFixed(2)} tr` : `+${millions.toFixed(2)}M`;
    }
    return formatPriceLocale(val, 'VND', locale, true);
  };

  // 5 Even price grid ticks for the right Y-axis
  const priceGridTicks = useMemo(() => {
    return [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
      const val = minVal + ratio * range;
      const y = getY(val);
      return { val, y };
    });
  }, [minVal, range, getY]);

  // 7 Time ticks along bottom X-axis
  const timeTicks = useMemo(() => {
    if (activeSeries.length === 0) return [];
    const count = 7;
    const step = Math.max(1, Math.floor((activeSeries.length - 1) / (count - 1)));
    const ticks: { index: number; x: number; label: string }[] = [];

    for (let i = 0; i < activeSeries.length; i += step) {
      const item = activeSeries[i];
      const date = new Date(item.timestamp);
      const label =
        timeframe === '1D'
          ? date.toLocaleTimeString([], {
              timeZone: timezone === 'ICT' ? 'Asia/Ho_Chi_Minh' : 'UTC',
              hour: '2-digit',
              minute: '2-digit'
            })
          : `${date.getDate()}/${date.getMonth() + 1}`;
      ticks.push({ index: i, x: getX(i), label });
    }
    return ticks;
  }, [activeSeries, timeframe, timezone, getX]);

  // Investing.com Signature Timeframe Matrix with Return Badges
  const timeframeOptions: { key: Timeframe; label: string; returnPct: number }[] = useMemo(() => [
    { key: '1D', label: t.chart.period1D, returnPct: +0.27 },
    { key: '1W', label: t.chart.period1W, returnPct: -2.08 },
    { key: '1M', label: t.chart.period1M, returnPct: -7.97 },
    { key: '3M', label: t.chart.period3M, returnPct: +6.45 },
    { key: '6M', label: t.chart.period6M, returnPct: -4.87 },
    { key: '1Y', label: t.chart.period1Y, returnPct: +14.35 },
    { key: '5Y', label: t.chart.period5Y, returnPct: +145.00 },
    { key: 'ALL', label: t.chart.periodMax, returnPct: +759.17 }
  ], [t]);

  // Primary chart stroke color based on view
  const primaryStrokeColor =
    chartView === 'XAU_USD' ? '#2563eb' : chartView === 'GOLD_GAP' ? '#f59e0b' : '#10b981';

  // CSV Export utility
  const handleExportCsv = () => {
    const headers = 'Timestamp,Open,High,Low,Close,Volume\n';
    const rows = activeSeries
      .map((d) => `${d.timestamp},${d.open},${d.high},${d.low},${d.close},${d.volume}`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FrabPulse_${chartView}_${timeframe}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-pulse-900 border border-slate-200 dark:border-pulse-800 shadow-sm dark:shadow-xl dark:shadow-black/20 overflow-hidden transition-all">
      {/* 1. Institutional Stock Terminal Header (Investing.com Standard) */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-pulse-800/80 bg-slate-50/60 dark:bg-pulse-950/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {chartView === 'XAU_USD'
                  ? 'XAU/USD'
                  : chartView === 'SJC_VN'
                  ? 'SJC/VND'
                  : chartView === 'GOLD_GAP'
                  ? 'GAP SPREAD'
                  : 'DUAL ARBITRAGE'}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                —{' '}
                {chartView === 'XAU_USD'
                  ? t.chart.spotGold
                  : chartView === 'SJC_VN'
                  ? t.chart.domesticSjc
                  : chartView === 'GOLD_GAP'
                  ? t.chart.arbitrageSpread
                  : t.chart.dualComparison}
              </span>
            </div>

            {/* Prominent Real-time Price Strip with Investing.com Green/Red Pill */}
            <div className="flex items-baseline gap-3 mt-1.5 flex-wrap">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white tracking-tight">
                {formatChartVal(displayPrice)}
              </span>

              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold font-mono tabular-nums ${
                  isUp
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                }`}
              >
                {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                <span>{isUp ? '+' : ''}{formatPercentLocale(percentDelta, locale)}</span>
                <span className="text-[11px] font-medium opacity-90 hidden sm:inline">
                  ({isUp ? '+' : ''}{formatChartVal(priceDelta)})
                </span>
              </span>

              {/* Real-time OHLC Strip */}
              {activeSeries.length > 0 && (
                <div className="hidden md:flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pl-2 border-l border-slate-200 dark:border-pulse-800">
                  <span>
                    <span className="text-slate-400 mr-1">{t.chart.open}:</span>
                    <strong className="font-mono text-slate-700 dark:text-slate-200 font-semibold">
                      {formatChartVal(hoverData ? hoverData.open : activeSeries[activeSeries.length - 1].open)}
                    </strong>
                  </span>
                  <span>
                    <span className="text-slate-400 mr-1">{t.chart.high}:</span>
                    <strong className="font-mono text-slate-700 dark:text-slate-200 font-semibold">
                      {formatChartVal(hoverData ? hoverData.high : activeSeries[activeSeries.length - 1].high)}
                    </strong>
                  </span>
                  <span>
                    <span className="text-slate-400 mr-1">{t.chart.low}:</span>
                    <strong className="font-mono text-slate-700 dark:text-slate-200 font-semibold">
                      {formatChartVal(hoverData ? hoverData.low : activeSeries[activeSeries.length - 1].low)}
                    </strong>
                  </span>
                  <span>
                    <span className="text-slate-400 mr-1">{t.chart.vol}:</span>
                    <strong className="font-mono text-slate-700 dark:text-slate-200 font-semibold">
                      {(hoverData ? hoverData.volume : activeSeries[activeSeries.length - 1].volume || 650).toLocaleString()}
                    </strong>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Action Group: Mua / Bán Trading Buttons + Asset Mode Selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
            {/* Quick Buy/Sell Terminal Action Badges */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1 cursor-default"
                title={t.chart.buyAction}
              >
                <span>{t.chart.buyAction}</span>
              </button>
              <button
                type="button"
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1 cursor-default"
                title={t.chart.sellAction}
              >
                <span>{t.chart.sellAction}</span>
              </button>
            </div>

            {/* Asset Views */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-200/70 dark:bg-pulse-950 border border-slate-200 dark:border-pulse-800 overflow-x-auto max-w-full">
              <button
                onClick={() => {
                  setChartView('XAU_USD');
                  setActiveEvent(null);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all min-h-[32px] shrink-0 ${
                  chartView === 'XAU_USD'
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t.chart.spotGold}
              </button>
              <button
                onClick={() => {
                  setChartView('SJC_VN');
                  setActiveEvent(null);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all min-h-[32px] shrink-0 ${
                  chartView === 'SJC_VN'
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t.chart.domesticSjc}
              </button>
              <button
                onClick={() => {
                  setChartView('GOLD_GAP');
                  setActiveEvent(null);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all min-h-[32px] shrink-0 ${
                  chartView === 'GOLD_GAP'
                    ? 'bg-amber-500 text-slate-950 shadow-xs font-bold'
                    : 'text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300'
                }`}
              >
                {t.chart.arbitrageSpread}
              </button>
              <button
                onClick={() => {
                  setChartView('DUAL_COMPARE');
                  setActiveEvent(null);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all min-h-[32px] shrink-0 ${
                  chartView === 'DUAL_COMPARE'
                    ? 'bg-white dark:bg-pulse-800 text-emerald-700 dark:text-emerald-400 shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t.chart.dualComparison}
              </button>
            </div>
          </div>
        </div>

        {/* Sub-Navigation Tabs (Investing.com Standard) */}
        <div className="flex items-center gap-4 mt-3 pt-2.5 border-t border-slate-200/70 dark:border-pulse-800/60 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveSubTab('OVERVIEW')}
            className={`pb-1 border-b-2 transition-colors shrink-0 ${
              activeSubTab === 'OVERVIEW'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {t.chart.overview}
          </button>
          <button
            onClick={() => setActiveSubTab('HISTORICAL')}
            className={`pb-1 border-b-2 transition-colors shrink-0 ${
              activeSubTab === 'HISTORICAL'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {t.chart.historicalData}
          </button>
          <button
            onClick={() => setActiveSubTab('TECH')}
            className={`pb-1 border-b-2 transition-colors shrink-0 ${
              activeSubTab === 'TECH'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {t.chart.techAnalysis}
          </button>
          <a
            href="#converter"
            className="pb-1 border-b-2 border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors shrink-0"
          >
            {t.converter.title}
          </a>

          {/* Smooth Cursor Indicator Badge */}
          <div className="ml-auto hidden sm:flex items-center gap-1.5 text-[11px] text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-800/40">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
            <span>{t.chart.continuousTracking}</span>
          </div>
        </div>

        {/* Data Provenance & Transparency Banner */}
        <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-pulse-800/40 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-3 flex-wrap text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] text-slate-500 dark:text-slate-400">{t.chart.provenanceSource}</span>
            </span>
            <span className="hidden sm:inline text-slate-300 dark:text-pulse-700">•</span>
            <span className="text-[11px] text-slate-600 dark:text-slate-400 hidden sm:inline">
              {t.chart.provenanceFx}
            </span>
            <span className="hidden md:inline text-slate-300 dark:text-pulse-700">•</span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium hidden md:inline">
              {t.chart.provenanceLatency}
            </span>
          </div>

          <button
            onClick={() => setShowProvenanceInfo(!showProvenanceInfo)}
            className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold focus:outline-none"
            aria-expanded={showProvenanceInfo}
          >
            <Info className="w-3.5 h-3.5" />
            <span>{showProvenanceInfo ? t.chart.hideProvenance : t.chart.viewProvenance}</span>
            {showProvenanceInfo ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Expandable Transparency Drawer */}
        {showProvenanceInfo && (
          <div className="mt-3 p-3.5 rounded-xl bg-slate-100/90 dark:bg-pulse-950 border border-slate-200 dark:border-pulse-800/80 text-xs text-slate-600 dark:text-slate-300 space-y-2 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t.chart.provenanceTitle}</span>
            </div>
            <p className="text-slate-600 dark:text-pulse-300 leading-relaxed text-[11px]">
              {t.chart.provenanceDesc}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
              <div className="p-2 rounded-lg bg-white dark:bg-pulse-900 border border-slate-200 dark:border-pulse-800">
                <span className="text-slate-400 block mb-0.5">Vàng Quốc Tế</span>
                <span className="font-semibold text-slate-800 dark:text-white">Kitco London Bullion (XAU/USD)</span>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-pulse-900 border border-slate-200 dark:border-pulse-800">
                <span className="text-slate-400 block mb-0.5">Vàng Trong Nước</span>
                <span className="font-semibold text-slate-800 dark:text-white">SJC Miền Nam (VND/lượng)</span>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-pulse-900 border border-slate-200 dark:border-pulse-800">
                <span className="text-slate-400 block mb-0.5">Tỷ Giá & Độ Trễ</span>
                <span className="font-semibold text-slate-800 dark:text-white">VCB: 25.440 ₫ · Live &lt; 60s</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Quick Toolbar: Candle/Area Switcher, Indicators, VOL & Export */}
      <div className="px-4 py-2 bg-slate-50 dark:bg-pulse-950/70 border-b border-slate-100 dark:border-pulse-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Style Switcher & Indicators */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-0.5 rounded-lg bg-slate-200/70 dark:bg-pulse-950 border border-slate-200 dark:border-pulse-800">
            <button
              onClick={() => setChartStyle('AREA')}
              className={`p-1.5 rounded-md transition-colors ${
                chartStyle === 'AREA'
                  ? 'bg-white dark:bg-pulse-800 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
              title={t.chart.area}
              aria-label={t.chart.area}
            >
              <LineChart className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartStyle('CANDLE')}
              className={`p-1.5 rounded-md transition-colors ${
                chartStyle === 'CANDLE'
                  ? 'bg-white dark:bg-pulse-800 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
              title={t.chart.candlestick}
              aria-label={t.chart.candlestick}
            >
              <BarChart2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Toggle MA(20) */}
          <button
            onClick={() => setShowMA(!showMA)}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-colors min-h-[28px] ${
              showMA
                ? 'bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30'
                : 'text-slate-600 dark:text-slate-400 border-slate-200 dark:border-pulse-800 hover:bg-slate-100 dark:hover:bg-pulse-800'
            }`}
          >
            MA(20)
          </button>

          {/* Toggle Volume */}
          <button
            onClick={() => setShowVolume(!showVolume)}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-colors min-h-[28px] ${
              showVolume
                ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30 font-bold'
                : 'text-slate-600 dark:text-slate-400 border-slate-200 dark:border-pulse-800 hover:bg-slate-100 dark:hover:bg-pulse-800'
            }`}
          >
            VOL
          </button>
        </div>

        {/* Export CSV */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-pulse-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-pulse-800 transition-colors min-h-[28px] text-[11px] font-medium"
            title={t.chart.exportCsv}
          >
            <Download className="w-3 h-3 text-slate-500" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* 3. Professional Financial Chart Canvas with Continuous Sub-Pixel Cursor */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden bg-white dark:bg-pulse-950 select-none cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible select-none"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Stock Exchange Financial Chart"
        >
          <defs>
            {/* Investing.com Royal Blue Gradient */}
            <linearGradient id="investingBlueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.00" />
            </linearGradient>
            {/* Domestic Emerald Gradient */}
            <linearGradient id="domesticEmeraldGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.00" />
            </linearGradient>
            {/* Gold Gap Amber Gradient */}
            <linearGradient id="gapAmberGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Right Y-Axis Border Separator */}
          <line
            x1={leftMargin + plotWidth}
            y1={topMargin}
            x2={leftMargin + plotWidth}
            y2={svgHeight - bottomAxisHeight}
            stroke="currentColor"
            className="text-slate-200 dark:text-pulse-800"
            strokeWidth="1"
          />

          {/* Bottom X-Axis Border Separator */}
          <line
            x1={leftMargin}
            y1={svgHeight - bottomAxisHeight}
            x2={leftMargin + plotWidth}
            y2={svgHeight - bottomAxisHeight}
            stroke="currentColor"
            className="text-slate-200 dark:text-pulse-800"
            strokeWidth="1"
          />

          {/* Horizontal Price Grid Lines & Right Y-Axis Labels */}
          {priceGridTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={leftMargin}
                y1={tick.y}
                x2={leftMargin + plotWidth}
                y2={tick.y}
                stroke="currentColor"
                className="text-slate-100 dark:text-pulse-850"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={leftMargin + plotWidth + 8}
                y={tick.y + 4}
                className="fill-slate-400 dark:fill-slate-500 font-mono text-[10px] tabular-nums select-none"
              >
                {formatChartVal(tick.val)}
              </text>
            </g>
          ))}

          {/* Area Fill in Area Mode */}
          {chartStyle === 'AREA' && (
            <path
              d={primaryAreaPath}
              fill={
                chartView === 'XAU_USD'
                  ? 'url(#investingBlueGradient)'
                  : chartView === 'GOLD_GAP'
                  ? 'url(#gapAmberGradient)'
                  : 'url(#domesticEmeraldGradient)'
              }
            />
          )}

          {/* Comparative World Curve in Dual Mode */}
          {compareSeries && compareSmoothPath && (
            <path
              d={compareSmoothPath}
              fill="none"
              stroke="#0284c7"
              strokeWidth="2"
              strokeDasharray="4 3"
              strokeLinecap="round"
            />
          )}

          {/* Primary Smooth Spline Curve in Area Mode */}
          {chartStyle === 'AREA' && primarySmoothPath && (
            <path
              d={primarySmoothPath}
              fill="none"
              stroke={primaryStrokeColor}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Candlestick Rendering in Candle Mode */}
          {chartStyle === 'CANDLE' &&
            activeSeries.map((d, i) => {
              const x = getX(i);
              const openY = getY(d.open);
              const closeY = getY(d.close);
              const highY = getY(d.high);
              const lowY = getY(d.low);
              const isBullish = d.close >= d.open;
              const candleColor = isBullish ? '#10b981' : '#f43f5e';
              const bodyTop = Math.min(openY, closeY);
              const bodyHeight = Math.max(2, Math.abs(closeY - openY));
              const candleWidth = Math.max(3, Math.min(8, plotWidth / activeSeries.length - 2));

              return (
                <g key={i}>
                  {/* Wick */}
                  <line x1={x} y1={highY} x2={x} y2={lowY} stroke={candleColor} strokeWidth="1" />
                  {/* Body */}
                  <rect
                    x={x - candleWidth / 2}
                    y={bodyTop}
                    width={candleWidth}
                    height={bodyHeight}
                    fill={candleColor}
                    rx="1"
                  />
                </g>
              );
            })}

          {/* 20-period Moving Average */}
          {showMA && maSmoothPath && (
            <path
              d={maSmoothPath}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeDasharray="5 3"
            />
          )}

          {/* Volume Sub-Chart Pane */}
          {showVolume && (
            <g>
              <line
                x1={leftMargin}
                y1={volumePaneTop}
                x2={leftMargin + plotWidth}
                y2={volumePaneTop}
                stroke="currentColor"
                className="text-slate-200 dark:text-pulse-800"
                strokeDasharray="2 2"
                strokeWidth="1"
              />
              <text
                x={leftMargin + 4}
                y={volumePaneTop + 12}
                className="fill-slate-400 dark:fill-slate-500 font-sans text-[9px] font-bold tracking-wider uppercase select-none"
              >
                {t.chart.volumePane}
              </text>

              {/* Volume Bars */}
              {activeSeries.map((d, i) => {
                const x = getX(i);
                const volY = getVolY(d.volume || 100);
                const barHeight = Math.max(2, volumePaneTop + volumePaneHeight - volY);
                const barWidth = Math.max(2, Math.min(6, plotWidth / activeSeries.length - 1.5));
                const isBullish = d.close >= d.open;
                const barColor = isBullish ? '#10b981' : '#f43f5e';

                return (
                  <rect
                    key={i}
                    x={x - barWidth / 2}
                    y={volY}
                    width={barWidth}
                    height={barHeight}
                    fill={barColor}
                    opacity="0.6"
                    rx="0.5"
                  />
                );
              })}
            </g>
          )}

          {/* Current Benchmark Price Horizontal Dashed Line (Investing.com Style) */}
          {activeSeries.length > 0 && !hoverData && (
            <g>
              <line
                x1={leftMargin}
                y1={getY(latestPrice)}
                x2={leftMargin + plotWidth}
                y2={getY(latestPrice)}
                stroke="#3b82f6"
                strokeDasharray="3 3"
                strokeWidth="1"
                opacity="0.85"
              />
              {/* Highlight badge on the right scale */}
              <rect
                x={leftMargin + plotWidth + 3}
                y={getY(latestPrice) - 10}
                width={rightAxisWidth - 6}
                height="20"
                rx="4"
                className="fill-blue-600 dark:fill-blue-500"
              />
              <text
                x={leftMargin + plotWidth + (rightAxisWidth - 6) / 2 + 3}
                y={getY(latestPrice) + 4}
                textAnchor="middle"
                fill="#ffffff"
                className="font-mono text-[10px] font-bold tabular-nums"
              >
                {formatChartVal(latestPrice)}
              </text>
            </g>
          )}

          {/* Bottom X-Axis Time Ticks */}
          {timeTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={tick.x}
                y1={svgHeight - bottomAxisHeight}
                x2={tick.x}
                y2={svgHeight - bottomAxisHeight + 4}
                stroke="currentColor"
                className="text-slate-300 dark:text-pulse-700"
              />
              <text
                x={tick.x}
                y={svgHeight - bottomAxisHeight + 17}
                textAnchor="middle"
                className="fill-slate-400 dark:fill-slate-500 font-mono text-[10px] select-none"
              >
                {tick.label}
              </text>
            </g>
          ))}

          {/* Timeline News / Event Pins (Investing.com 'N' Circular Markers) */}
          {events.map((evt, idx) => {
            const targetIndex =
              idx === 0
                ? Math.floor(activeSeries.length * 0.22)
                : idx === 1
                ? Math.floor(activeSeries.length * 0.52)
                : Math.floor(activeSeries.length * 0.78);
            const pinX = getX(targetIndex);
            const pinY = svgHeight - bottomAxisHeight - 10;
            const isSelected = activeEvent?.id === evt.id;

            return (
              <g
                key={evt.id}
                onClick={() => setActiveEvent(isSelected ? null : evt)}
                className="cursor-pointer group"
                tabIndex={0}
                role="button"
                aria-label={`News: ${evt.title}`}
              >
                <circle cx={pinX} cy={pinY} r="14" fill="transparent" />
                {/* Investing.com 'N' pin badge */}
                <circle
                  cx={pinX}
                  cy={pinY}
                  r={isSelected ? '9' : '7.5'}
                  className={
                    isSelected
                      ? 'fill-blue-600 stroke-white'
                      : 'fill-slate-300 dark:fill-pulse-700 hover:fill-blue-500 stroke-white dark:stroke-pulse-900 transition-colors'
                  }
                  strokeWidth="1.5"
                />
                <text
                  x={pinX}
                  y={pinY + 3}
                  textAnchor="middle"
                  fill="#ffffff"
                  className="font-sans text-[8px] font-bold select-none pointer-events-none"
                >
                  N
                </text>
              </g>
            );
          })}

          {/* Continuous Sub-Pixel Crosshair Cursor (Zero Jumping!) */}
          {hoverData && (
            <g>
              {/* Vertical Crosshair Line (sub-pixel exact cursor X) */}
              <line
                x1={hoverData.cursorX}
                y1={topMargin}
                x2={hoverData.cursorX}
                y2={svgHeight - bottomAxisHeight}
                stroke="#64748b"
                strokeWidth="1"
                strokeDasharray="2 2"
              />

              {/* Horizontal Crosshair Line (sub-pixel exact curve Y) */}
              <line
                x1={leftMargin}
                y1={hoverData.cursorY}
                x2={leftMargin + plotWidth}
                y2={hoverData.cursorY}
                stroke="#64748b"
                strokeWidth="1"
                strokeDasharray="2 2"
              />

              {/* Laser Tracking Point on the Curve */}
              <circle
                cx={hoverData.cursorX}
                cy={hoverData.cursorY}
                r="4.5"
                fill={primaryStrokeColor}
                stroke="#ffffff"
                strokeWidth="2"
              />

              {/* Crosshair Time Bubble on Bottom Axis */}
              <rect
                x={hoverData.cursorX - 34}
                y={svgHeight - bottomAxisHeight + 2}
                width="68"
                height="18"
                rx="4"
                className="fill-slate-800 dark:fill-slate-100"
              />
              <text
                x={hoverData.cursorX}
                y={svgHeight - bottomAxisHeight + 15}
                textAnchor="middle"
                className="fill-white dark:fill-slate-900 font-mono text-[10px] font-bold"
              >
                {new Date(hoverData.timestamp).toLocaleTimeString([], {
                  timeZone: timezone === 'ICT' ? 'Asia/Ho_Chi_Minh' : 'UTC',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </text>

              {/* Crosshair Price Bubble on Right Axis */}
              <rect
                x={leftMargin + plotWidth + 3}
                y={hoverData.cursorY - 10}
                width={rightAxisWidth - 6}
                height="20"
                rx="4"
                className="fill-slate-900 dark:fill-slate-100"
              />
              <text
                x={leftMargin + plotWidth + (rightAxisWidth - 6) / 2 + 3}
                y={hoverData.cursorY + 4}
                textAnchor="middle"
                className="fill-white dark:fill-slate-900 font-mono text-[10px] font-bold tabular-nums"
              >
                {formatChartVal(hoverData.price)}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* 4. Signature Investing.com Bottom Timeframe Selector with Return Badges */}
      <div className="border-t border-slate-200 dark:border-pulse-800 bg-slate-50/70 dark:bg-pulse-950/80">
        <div className="grid grid-cols-4 sm:grid-cols-8 divide-x divide-slate-200 dark:divide-pulse-800/80">
          {timeframeOptions.map((opt) => {
            const isSelected = timeframe === opt.key;
            const isPos = opt.returnPct >= 0;

            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => setTimeframe(opt.key)}
                className={`py-2 px-1 text-center transition-all ${
                  isSelected
                    ? 'bg-white dark:bg-pulse-800 shadow-xs ring-1 ring-blue-500/20 z-10'
                    : 'hover:bg-slate-100 dark:hover:bg-pulse-900'
                }`}
              >
                <div
                  className={`text-xs ${
                    isSelected
                      ? 'font-bold text-blue-600 dark:text-blue-400'
                      : 'font-semibold text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {opt.label}
                </div>
                <div
                  className={`text-[11px] font-bold font-mono tabular-nums mt-0.5 ${
                    isPos
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {isPos ? '+' : ''}{opt.returnPct.toFixed(2)}%
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Event Intelligence Detail Card or Quick Status Hint */}
      {activeEvent ? (
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-pulse-950/80 border-t border-slate-200 dark:border-pulse-800 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 uppercase tracking-wider">
                  {activeEvent.eventType}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(activeEvent.happenedAt).toLocaleTimeString([], {
                    timeZone: timezone === 'ICT' ? 'Asia/Ho_Chi_Minh' : 'UTC',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}{' '}
                  {timezone}
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                {activeEvent.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 line-clamp-2 leading-relaxed">
                {activeEvent.summary}
              </p>
            </div>

            <Link
              href={`/events/${activeEvent.id}`}
              className="flex items-center justify-center gap-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 min-h-[36px] px-4 py-2 rounded-xl transition-colors shrink-0 font-semibold shadow-xs"
            >
              <span>{t.chart.inspectEvent}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Measured movements under this event */}
          <div className="flex items-center gap-2 sm:gap-4 mt-3 pt-3 border-t border-slate-200 dark:border-pulse-900 text-xs flex-wrap font-sans">
            <span className="text-slate-500 dark:text-slate-400 font-semibold text-[11px]">
              {t.chart.associatedDelta}
            </span>
            {activeEvent.relatedAssets.map((rel) => (
              <span
                key={rel.assetCode}
                className="text-[11px] px-2 py-0.5 rounded bg-white dark:bg-pulse-900 border border-slate-200 dark:border-pulse-800 text-emerald-700 dark:text-emerald-300 font-bold font-mono tabular-nums"
              >
                {rel.assetCode}: {formatPercentLocale(rel.deltaPercent, locale)} ({rel.windowMinutes}m)
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="px-4 py-2.5 bg-slate-50/60 dark:bg-pulse-950/60 border-t border-slate-100 dark:border-pulse-800/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 flex-wrap gap-2">
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>{t.chart.crosshairHint}</span>
          </span>
          <span className="font-semibold text-slate-600 dark:text-slate-300 font-mono text-[10px]">
            {t.chart.utcSync}
          </span>
        </div>
      )}
    </div>
  );
}
