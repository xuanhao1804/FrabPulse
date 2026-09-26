'use client';

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { PriceCandle, MarketEvent, formatUsd, formatVndMillions, formatPercent, formatVnd } from '@frabpulse/shared';
import {
  LineChart,
  BarChart2,
  Calendar,
  ExternalLink,
  Zap,
  Download,
  Activity,
  Layers,
  TrendingUp,
  Maximize2,
  Scale,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '../../lib/i18n/LanguageContext';

interface PriceEventChartProps {
  xauCandles: PriceCandle[];
  sjcCandles: PriceCandle[];
  events: MarketEvent[];
}

type ChartView = 'XAU_USD' | 'SJC_VN' | 'GOLD_GAP' | 'DUAL_COMPARE';
type ChartStyle = 'AREA' | 'CANDLE';
type Timeframe = '1D' | '1W' | '1M' | '3M' | '1Y';

export function PriceEventChart({ xauCandles, sjcCandles, events }: PriceEventChartProps) {
  const { t, timezone } = useLanguage();
  const [chartView, setChartView] = useState<ChartView>('XAU_USD');
  const [chartStyle, setChartStyle] = useState<ChartStyle>('AREA');
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  const [showMA, setShowMA] = useState(true);
  const [activeEvent, setActiveEvent] = useState<MarketEvent | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Compute Converted World Gold series & Gap Spread series
  const FX_RATE = 25440;
  const FACTOR = 1.20565;

  const { activeSeries, compareSeries } = useMemo(() => {
    // Generate synthetic spread candles matching the length of data
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
        open: gap - 80000,
        high: gap + 120000,
        low: gap - 100000,
        close: gap,
        volume: s.volume
      });
    }

    // Timeframe slice
    const sliceCount =
      timeframe === '1D' ? 24 : timeframe === '1W' ? 40 : timeframe === '1M' ? 60 : len;

    if (chartView === 'XAU_USD') {
      return { activeSeries: xauCandles.slice(-sliceCount), compareSeries: null };
    }
    if (chartView === 'SJC_VN') {
      return { activeSeries: sjcCandles.slice(-sliceCount), compareSeries: null };
    }
    if (chartView === 'GOLD_GAP') {
      return { activeSeries: spreadSeries.slice(-sliceCount), compareSeries: null };
    }
    // DUAL_COMPARE
    return {
      activeSeries: sjcCandles.slice(-sliceCount),
      compareSeries: worldConvertedSeries.slice(-sliceCount)
    };
  }, [xauCandles, sjcCandles, chartView, timeframe]);

  // Compute 20-period Moving Average
  const ma20 = useMemo(() => {
    const period = 7;
    return activeSeries.map((d, idx, arr) => {
      if (idx < period - 1) return null;
      const slice = arr.slice(idx - period + 1, idx + 1);
      const sum = slice.reduce((acc, curr) => acc + curr.close, 0);
      return sum / period;
    });
  }, [activeSeries]);

  // Normalization for SVG rendering
  const minVal = useMemo(() => {
    let m = Math.min(...activeSeries.map((d) => (chartStyle === 'CANDLE' ? d.low : d.close)));
    if (compareSeries) {
      m = Math.min(m, ...compareSeries.map((d) => d.close));
    }
    return m * 0.998;
  }, [activeSeries, compareSeries, chartStyle]);

  const maxVal = useMemo(() => {
    let m = Math.max(...activeSeries.map((d) => (chartStyle === 'CANDLE' ? d.high : d.close)));
    if (compareSeries) {
      m = Math.max(m, ...compareSeries.map((d) => d.close));
    }
    return m * 1.002;
  }, [activeSeries, compareSeries, chartStyle]);

  const range = maxVal - minVal || 1;

  // Canvas bounds
  const svgWidth = 860;
  const svgHeight = 320;
  const paddingX = 45;
  const paddingY = 40;

  // Coordinate mapper
  const getX = useCallback((index: number) => {
    if (activeSeries.length <= 1) return paddingX;
    return paddingX + (index / (activeSeries.length - 1)) * (svgWidth - 2 * paddingX);
  }, [activeSeries.length]);

  const getY = useCallback((val: number) => {
    return svgHeight - paddingY - ((val - minVal) / range) * (svgHeight - 2 * paddingY);
  }, [minVal, range]);

  // Paths
  const primaryPath = useMemo(() => {
    return activeSeries.reduce((acc, d, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.close)}`, '');
  }, [activeSeries, getX, getY]);

  const primaryArea = useMemo(() => {
    if (activeSeries.length === 0) return '';
    const lastX = getX(activeSeries.length - 1);
    const firstX = getX(0);
    const bottomY = svgHeight - paddingY;
    return `${primaryPath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [primaryPath, activeSeries.length, getX]);

  const comparePath = useMemo(() => {
    if (!compareSeries) return '';
    return compareSeries.reduce((acc, d, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.close)}`, '');
  }, [compareSeries, getX, getY]);

  const maPath = useMemo(() => {
    if (!showMA) return '';
    let started = false;
    let path = '';
    ma20.forEach((val, i) => {
      if (val !== null) {
        if (!started) {
          path += `M ${getX(i)} ${getY(val)}`;
          started = true;
        } else {
          path += ` L ${getX(i)} ${getY(val)}`;
        }
      }
    });
    return path;
  }, [ma20, showMA, getX, getY]);

  // Current display point
  const currentHoverItem = hoverIndex !== null ? activeSeries[hoverIndex] : activeSeries[activeSeries.length - 1];
  const currentCompareItem =
    compareSeries && hoverIndex !== null
      ? compareSeries[hoverIndex]
      : compareSeries
      ? compareSeries[compareSeries.length - 1]
      : null;

  const isUp =
    currentHoverItem &&
    activeSeries.length > 1 &&
    currentHoverItem.close >= activeSeries[0].close;

  // Format helper based on active view
  const formatChartVal = (val: number) => {
    if (chartView === 'XAU_USD') return formatUsd(val);
    if (chartView === 'GOLD_GAP') return `+${formatVndMillions(val)}`;
    return formatVndMillions(val);
  };

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
    <div className="rounded-2xl bg-white dark:bg-pulse-900/90 border border-slate-200 dark:border-pulse-800 p-4 sm:p-6 shadow-sm dark:shadow-xl dark:shadow-black/20 transition-all">
      {/* Top Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-pulse-800/80">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{t.chart.title}</span>
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              PRO TERMINAL
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-pulse-400 mt-0.5">
            {t.chart.subtitle}
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-pulse-950 border border-slate-200 dark:border-pulse-800 overflow-x-auto max-w-full">
          <button
            onClick={() => {
              setChartView('XAU_USD');
              setActiveEvent(null);
            }}
            className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-lg transition-all min-h-[36px] shrink-0 ${
              chartView === 'XAU_USD'
                ? 'bg-white dark:bg-pulse-800 text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-pulse-700'
                : 'text-slate-600 dark:text-pulse-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.chart.spotGold}
          </button>
          <button
            onClick={() => {
              setChartView('SJC_VN');
              setActiveEvent(null);
            }}
            className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-lg transition-all min-h-[36px] shrink-0 ${
              chartView === 'SJC_VN'
                ? 'bg-white dark:bg-pulse-800 text-slate-900 dark:text-white shadow-xs border border-slate-200/80 dark:border-pulse-700'
                : 'text-slate-600 dark:text-pulse-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.chart.domesticSjc}
          </button>
          <button
            onClick={() => {
              setChartView('GOLD_GAP');
              setActiveEvent(null);
            }}
            className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-lg transition-all min-h-[36px] shrink-0 ${
              chartView === 'GOLD_GAP'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
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
            className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-lg transition-all min-h-[36px] shrink-0 ${
              chartView === 'DUAL_COMPARE'
                ? 'bg-white dark:bg-pulse-800 text-emerald-700 dark:text-emerald-400 shadow-xs border border-slate-200/80 dark:border-pulse-700 font-bold'
                : 'text-slate-600 dark:text-pulse-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.chart.dualComparison}
          </button>
        </div>
      </div>

      {/* Secondary Bar: Timeframe, Chart Style, Technicals & Export */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 text-xs font-mono">
        {/* Timeframes */}
        <div className="flex items-center gap-1">
          {(['1D', '1W', '1M', '3M', '1Y'] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2.5 py-1 rounded-md font-bold text-xs transition-colors min-h-[32px] ${
                timeframe === tf
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-500 dark:text-pulse-400 hover:bg-slate-100 dark:hover:bg-pulse-800'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Chart Style & Indicators Controls */}
        <div className="flex items-center gap-2">
          {/* Style Switcher (Area vs Candle) */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-pulse-950 border border-slate-200 dark:border-pulse-800">
            <button
              onClick={() => setChartStyle('AREA')}
              className={`p-1.5 rounded-md transition-colors ${
                chartStyle === 'AREA'
                  ? 'bg-white dark:bg-pulse-800 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 dark:text-pulse-400 hover:text-slate-800'
              }`}
              title={t.chart.area}
            >
              <LineChart className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setChartStyle('CANDLE')}
              className={`p-1.5 rounded-md transition-colors ${
                chartStyle === 'CANDLE'
                  ? 'bg-white dark:bg-pulse-800 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 dark:text-pulse-400 hover:text-slate-800'
              }`}
              title={t.chart.candlestick}
            >
              <BarChart2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Toggle MA(20) */}
          <button
            onClick={() => setShowMA(!showMA)}
            className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-colors min-h-[32px] ${
              showMA
                ? 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30'
                : 'text-slate-500 dark:text-pulse-400 border-slate-200 dark:border-pulse-800 hover:bg-slate-100 dark:hover:bg-pulse-800'
            }`}
          >
            MA(20)
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-pulse-800 text-slate-600 dark:text-pulse-300 hover:bg-slate-100 dark:hover:bg-pulse-800 transition-colors min-h-[32px] text-[11px]"
            title={t.chart.exportCsv}
          >
            <Download className="w-3 h-3 text-slate-500 dark:text-pulse-400" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Floating Precision Metric Strip */}
      <div className="flex items-center justify-between flex-wrap gap-2 py-2 px-3 mb-2 rounded-xl bg-slate-50 dark:bg-pulse-950/90 border border-slate-200/80 dark:border-pulse-800/80 text-xs font-mono">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <span className="text-[10px] text-slate-500 dark:text-pulse-400 uppercase block">{t.chart.selected}</span>
            <span className="text-base sm:text-lg font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
              {currentHoverItem ? formatChartVal(currentHoverItem.close) : '---'}
            </span>
          </div>

          {compareSeries && currentCompareItem && (
            <div>
              <span className="text-[10px] text-slate-500 dark:text-pulse-400 uppercase block">{t.chart.worldConverted}</span>
              <span className="text-base sm:text-lg font-bold text-sky-600 dark:text-sky-400 tabular-nums">
                {formatVndMillions(currentCompareItem.close)}
              </span>
            </div>
          )}

          {currentHoverItem && (
            <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-500 dark:text-pulse-400 pt-1">
              <span>O: {formatChartVal(currentHoverItem.open)}</span>
              <span>H: {formatChartVal(currentHoverItem.high)}</span>
              <span>L: {formatChartVal(currentHoverItem.low)}</span>
            </div>
          )}
        </div>

        <div className="text-right text-[11px] text-slate-500 dark:text-pulse-400">
          <span>
            {currentHoverItem
              ? new Date(currentHoverItem.timestamp).toLocaleTimeString([], {
                  timeZone: timezone === 'ICT' ? 'Asia/Ho_Chi_Minh' : 'UTC'
                })
              : '---'}
          </span>
          <span className="ml-1 text-[10px] text-slate-400 dark:text-pulse-500 font-bold">{timezone}</span>
        </div>
      </div>

      {/* SVG Canvas with Interactive Crosshair & Event Markers */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-xl bg-slate-50/50 dark:bg-pulse-950/80 border border-slate-200/80 dark:border-pulse-800/80 select-none cursor-crosshair"
        onMouseMove={(e) => {
          if (!containerRef.current || activeSeries.length === 0) return;
          const rect = containerRef.current.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const relX = Math.max(0, Math.min(1, (mouseX - paddingX) / (rect.width - 2 * paddingX)));
          const idx = Math.round(relX * (activeSeries.length - 1));
          setHoverIndex(idx);
        }}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible select-none"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Financial Market Chart"
        >
          <defs>
            <linearGradient id="proChartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="goldSpreadGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} stroke="currentColor" className="text-slate-200 dark:text-pulse-800" strokeDasharray="3 3" />
          <line x1={paddingX} y1={svgHeight / 2} x2={svgWidth - paddingX} y2={svgHeight / 2} stroke="currentColor" className="text-slate-200 dark:text-pulse-800" strokeDasharray="3 3" />
          <line x1={paddingX} y1={svgHeight - paddingY} x2={svgWidth - paddingX} y2={svgHeight - paddingY} stroke="currentColor" className="text-slate-300 dark:text-pulse-700" />

          {/* Area Fill for Line Mode */}
          {chartStyle === 'AREA' && (
            <path
              d={primaryArea}
              fill={chartView === 'GOLD_GAP' ? 'url(#goldSpreadGradient)' : 'url(#proChartGradient)'}
            />
          )}

          {/* Comparative World Curve in Dual Mode */}
          {compareSeries && (
            <path
              d={comparePath}
              fill="none"
              stroke="#0284c7"
              strokeWidth="2"
              strokeDasharray="4 3"
              strokeLinecap="round"
            />
          )}

          {/* Primary Trend Line in Area Mode */}
          {chartStyle === 'AREA' && (
            <path
              d={primaryPath}
              fill="none"
              stroke={chartView === 'GOLD_GAP' ? '#f59e0b' : '#10b981'}
              strokeWidth="2.5"
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
              const candleWidth = Math.max(3, (svgWidth - 2 * paddingX) / activeSeries.length - 2);

              return (
                <g key={i}>
                  {/* High/Low wick */}
                  <line x1={x} y1={highY} x2={x} y2={lowY} stroke={candleColor} strokeWidth="1.2" />
                  {/* Candle Body */}
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
          {showMA && (
            <path
              d={maPath}
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          )}

          {/* Crosshair on Hover */}
          {hoverIndex !== null && (
            <g>
              {/* Vertical line */}
              <line
                x1={getX(hoverIndex)}
                y1={paddingY}
                x2={getX(hoverIndex)}
                y2={svgHeight - paddingY}
                stroke="#64748b"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              {/* Point Indicator */}
              <circle
                cx={getX(hoverIndex)}
                cy={getY(activeSeries[hoverIndex].close)}
                r="5"
                fill={chartView === 'GOLD_GAP' ? '#f59e0b' : '#10b981'}
                stroke="#ffffff"
                strokeWidth="2"
              />
            </g>
          )}

          {/* Value Labels */}
          <text x={paddingX} y={paddingY - 12} fill="#64748b" fontSize="10" fontFamily="monospace" fontWeight="bold">
            MAX: {formatChartVal(maxVal)}
          </text>
          <text x={paddingX} y={svgHeight - paddingY + 20} fill="#64748b" fontSize="10" fontFamily="monospace" fontWeight="bold">
            MIN: {formatChartVal(minVal)}
          </text>

          {/* Event Pins with Numbered Badges */}
          {events.map((evt, idx) => {
            const targetIndex = idx === 0 ? Math.floor(activeSeries.length * 0.3) : idx === 1 ? Math.floor(activeSeries.length * 0.6) : Math.floor(activeSeries.length * 0.85);
            const ptX = getX(targetIndex);
            const ptY = getY(activeSeries[targetIndex]?.close || minVal);
            const isSelected = activeEvent?.id === evt.id;

            return (
              <g
                key={evt.id}
                onClick={() => setActiveEvent(isSelected ? null : evt)}
                className="cursor-pointer group"
                tabIndex={0}
                role="button"
                aria-label={`Event ${idx + 1}: ${evt.title}`}
              >
                <circle cx={ptX} cy={paddingY + 15} r="20" fill="transparent" />
                <line
                  x1={ptX}
                  y1={ptY}
                  x2={ptX}
                  y2={paddingY + 15}
                  stroke={isSelected ? '#3b82f6' : '#10b981'}
                  strokeWidth={isSelected ? '2' : '1.2'}
                  strokeDasharray="2 2"
                />
                <circle
                  cx={ptX}
                  cy={paddingY + 15}
                  r={isSelected ? '9' : '7.5'}
                  fill={isSelected ? '#2563eb' : '#059669'}
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="transition-all"
                />
                <text
                  x={ptX}
                  y={paddingY + 18}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="9"
                  fontWeight="bold"
                >
                  {idx + 1}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Active Event Spotlight Card */}
      {activeEvent ? (
        <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-pulse-950 border border-emerald-500/30 dark:border-emerald-500/40 animate-in fade-in duration-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                  {activeEvent.eventType}
                </span>
                <span className="text-xs text-slate-500 dark:text-pulse-400 flex items-center gap-1 font-mono">
                  <Calendar className="w-3 h-3" />
                  {new Date(activeEvent.happenedAt).toLocaleTimeString([], {
                    timeZone: timezone === 'ICT' ? 'Asia/Ho_Chi_Minh' : 'UTC',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}{' '}
                  {timezone}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{activeEvent.title}</h4>
              <p className="text-xs text-slate-600 dark:text-pulse-300 mt-1 line-clamp-2">{activeEvent.summary}</p>
            </div>

            <Link
              href={`/events/${activeEvent.id}`}
              className="flex items-center justify-center gap-1.5 text-xs text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/30 min-h-[40px] px-4 py-2 rounded-xl border border-transparent dark:border-emerald-500/30 transition-colors shrink-0 font-semibold"
            >
              <span>{t.chart.inspectEvent}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Measured movements under this event */}
          <div className="flex items-center gap-2 sm:gap-4 mt-3 pt-3 border-t border-slate-200 dark:border-pulse-900 text-xs flex-wrap font-mono">
            <span className="text-slate-500 dark:text-pulse-400 font-semibold text-[11px]">{t.chart.associatedDelta}</span>
            {activeEvent.relatedAssets.map((rel) => (
              <span
                key={rel.assetCode}
                className="text-[11px] px-2 py-1 rounded bg-white dark:bg-pulse-900 border border-slate-200 dark:border-pulse-800 text-emerald-700 dark:text-emerald-300 font-bold"
              >
                {rel.assetCode}: {formatPercent(rel.deltaPercent)} in {rel.windowMinutes}m
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-pulse-400 px-1 flex-wrap gap-2 font-mono">
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{t.chart.crosshairHint}</span>
          </span>
          <span className="font-bold">{t.chart.utcSync}</span>
        </div>
      )}
    </div>
  );
}
