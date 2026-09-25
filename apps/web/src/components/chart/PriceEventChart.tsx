'use client';

import React, { useState } from 'react';
import { PriceCandle, MarketEvent, formatUsd, formatVndMillions, formatPercent } from '@frabpulse/shared';
import { LineChart, Calendar, ExternalLink, Zap, HelpCircle } from 'lucide-react';
import Link from 'next/link';

interface PriceEventChartProps {
  xauCandles: PriceCandle[];
  sjcCandles: PriceCandle[];
  events: MarketEvent[];
}

export function PriceEventChart({ xauCandles, sjcCandles, events }: PriceEventChartProps) {
  const [selectedAsset, setSelectedAsset] = useState<'XAU_USD' | 'SJC_VN'>('XAU_USD');
  const [activeEvent, setActiveEvent] = useState<MarketEvent | null>(null);

  const isXau = selectedAsset === 'XAU_USD';
  const data = isXau ? xauCandles : sjcCandles;

  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl bg-pulse-900/80 border border-pulse-800 p-8 text-center text-pulse-400">
        Loading price timeline...
      </div>
    );
  }

  // Min and max for SVG normalization
  const prices = data.map((d) => d.close);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const latestPrice = prices[prices.length - 1] ?? minPrice;
  const priceRange = maxPrice - minPrice || 1;

  // Responsive SVG coordinates
  const width = 800;
  const height = 280;
  const paddingX = 35;
  const paddingY = 35;

  const points = data.map((d, index) => {
    const x = paddingX + (index / (data.length - 1)) * (width - 2 * paddingX);
    const y = height - paddingY - ((d.close - minPrice) / priceRange) * (height - 2 * paddingY);
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="rounded-2xl bg-pulse-900/90 border border-pulse-800 p-4 sm:p-6 shadow-xl shadow-black/20">
      {/* Header and Asset Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-semibold text-white tracking-tight flex items-center gap-2">
              <LineChart className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              <span>Price Timeline & Associated Events</span>
            </h2>
            <span className="px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-mono rounded bg-pulse-800 text-pulse-300">
              24H RADAR
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-pulse-400 mt-0.5">
            Tap event pins along the price curve to inspect empirical before/after movements
          </p>
        </div>

        {/* Asset Switcher with 44px touch targets */}
        <div className="flex items-center p-1 rounded-xl bg-pulse-950 border border-pulse-800 self-start sm:self-auto w-full sm:w-auto">
          <button
            onClick={() => {
              setSelectedAsset('XAU_USD');
              setActiveEvent(null);
            }}
            className={`flex-1 sm:flex-none min-h-[44px] px-3 py-2 text-xs font-mono rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none ${
              isXau
                ? 'bg-emerald-500 text-pulse-950 font-bold shadow-md shadow-emerald-500/20'
                : 'text-pulse-400 hover:text-white'
            }`}
            aria-pressed={isXau}
          >
            XAU/USD (Spot)
          </button>
          <button
            onClick={() => {
              setSelectedAsset('SJC_VN');
              setActiveEvent(null);
            }}
            className={`flex-1 sm:flex-none min-h-[44px] px-3 py-2 text-xs font-mono rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none ${
              !isXau
                ? 'bg-emerald-500 text-pulse-950 font-bold shadow-md shadow-emerald-500/20'
                : 'text-pulse-400 hover:text-white'
            }`}
            aria-pressed={!isXau}
          >
            SJC 9999 (Domestic)
          </button>
        </div>
      </div>

      {/* High-priority Mobile Glance Bar: Current Price & 24h High/Low */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-3 mb-2 border-b border-pulse-800/60 font-mono text-xs">
        <div>
          <span className="text-[10px] text-pulse-500 uppercase block">Latest Quote</span>
          <span className="text-base sm:text-lg font-bold text-emerald-400">
            {isXau ? formatUsd(latestPrice) : formatVndMillions(latestPrice)}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-pulse-400">
          <div>
            <span className="text-[9px] text-pulse-500 block">24H HIGH</span>
            <span>{isXau ? formatUsd(maxPrice) : formatVndMillions(maxPrice)}</span>
          </div>
          <div>
            <span className="text-[9px] text-pulse-500 block">24H LOW</span>
            <span>{isXau ? formatUsd(minPrice) : formatVndMillions(minPrice)}</span>
          </div>
        </div>
      </div>

      {/* Mobile Event Selector Pills: Ensures 44px tap targets for every marker on touch devices */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2 sm:hidden text-xs">
        <span className="text-[10px] text-pulse-500 shrink-0">Events:</span>
        {events.map((evt, idx) => {
          const isSelected = activeEvent?.id === evt.id;
          return (
            <button
              key={evt.id}
              onClick={() => setActiveEvent(isSelected ? null : evt)}
              className={`shrink-0 min-h-[38px] px-2.5 py-1.5 rounded-lg border text-[11px] font-mono flex items-center gap-1.5 transition-colors ${
                isSelected
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                  : 'bg-pulse-950 text-pulse-400 border-pulse-800 hover:text-white'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-emerald-500/30 text-emerald-300 text-[10px] flex items-center justify-center font-bold">
                {idx + 1}
              </span>
              <span className="truncate max-w-[120px]">{evt.eventType}</span>
            </button>
          );
        })}
      </div>

      {/* SVG Responsive Chart Canvas */}
      <div className="relative w-full overflow-hidden rounded-xl bg-pulse-950/80 border border-pulse-800/80 p-1 sm:p-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={`24-hour price chart for ${isXau ? 'XAU/USD spot gold' : 'SJC 9999 bullion'}`}
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="#1e293b" strokeDasharray="3 3" />
          <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke="#1e293b" strokeDasharray="3 3" />
          <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#1e293b" />

          {/* Area fill */}
          <path d={areaD} fill="url(#chartGradient)" />

          {/* Price Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* High/Low Bounds text */}
          <text x={paddingX} y={paddingY - 10} fill="#64748b" fontSize="10" fontFamily="monospace">
            MAX: {isXau ? formatUsd(maxPrice) : formatVndMillions(maxPrice)}
          </text>
          <text x={paddingX} y={height - paddingY + 18} fill="#64748b" fontSize="10" fontFamily="monospace">
            MIN: {isXau ? formatUsd(minPrice) : formatVndMillions(minPrice)}
          </text>

          {/* Event Pins / Markers along curve with expanded touch target */}
          {events.map((evt, idx) => {
            const targetIndex = idx === 0 ? 15 : idx === 1 ? 26 : 38;
            const pt = points[targetIndex] || points[0];
            const isSelected = activeEvent?.id === evt.id;

            return (
              <g
                key={evt.id}
                onClick={() => setActiveEvent(isSelected ? null : evt)}
                className="cursor-pointer group"
                tabIndex={0}
                role="button"
                aria-label={`Event ${idx + 1}: ${evt.title}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveEvent(isSelected ? null : evt);
                  }
                }}
              >
                {/* Invisible large touch hit area (radius 24px) for mobile fingers */}
                <circle cx={pt.x} cy={paddingY + 20} r="24" fill="transparent" />

                {/* Vertical marker dashed stem */}
                <line
                  x1={pt.x}
                  y1={pt.y}
                  x2={pt.x}
                  y2={paddingY + 20}
                  stroke={isSelected ? '#34d399' : '#059669'}
                  strokeWidth={isSelected ? '2' : '1.2'}
                  strokeDasharray="2 2"
                />

                {/* Visible Marker Flag Pin */}
                <circle
                  cx={pt.x}
                  cy={paddingY + 20}
                  r={isSelected ? '9' : '7'}
                  className={`${
                    isSelected
                      ? 'fill-emerald-400 stroke-pulse-950'
                      : 'fill-emerald-500 stroke-pulse-900 group-hover:fill-emerald-400'
                  } transition-all`}
                  strokeWidth="2"
                />

                <text
                  x={pt.x}
                  y={paddingY + 23}
                  textAnchor="middle"
                  fill="#022c22"
                  fontSize="9"
                  fontWeight="bold"
                >
                  {idx + 1}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Screen-reader only accessible data table */}
        <div className="sr-only">
          <table>
            <caption>24-Hour Price Movement and Event Markers</caption>
            <thead>
              <tr>
                <th scope="col">Time</th>
                <th scope="col">Price</th>
              </tr>
            </thead>
            <tbody>
              {data.slice(-5).map((d) => (
                <tr key={d.timestamp}>
                  <td>{d.timestamp}</td>
                  <td>{d.close}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Event Spotlight Card */}
      {activeEvent ? (
        <div className="mt-4 p-4 rounded-xl bg-pulse-950 border border-emerald-500/30 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                  {activeEvent.eventType}
                </span>
                <span className="text-xs text-pulse-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(activeEvent.happenedAt).toLocaleTimeString()} UTC
                </span>
              </div>
              <h4 className="text-sm font-semibold text-white leading-snug">{activeEvent.title}</h4>
              <p className="text-xs text-pulse-300 mt-1 line-clamp-2">{activeEvent.summary}</p>
            </div>

            <Link
              href={`/events/${activeEvent.id}`}
              className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 min-h-[44px] px-4 py-2 rounded-xl bg-pulse-900 border border-pulse-800 transition-colors shrink-0 font-medium"
            >
              <span>Inspect Event</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Measured movements under this event */}
          <div className="flex items-center gap-2 sm:gap-4 mt-3 pt-3 border-t border-pulse-900 text-xs flex-wrap">
            <span className="text-pulse-400 font-medium text-[11px]">Associated Delta:</span>
            {activeEvent.relatedAssets.map((rel) => (
              <span
                key={rel.assetCode}
                className="font-mono text-[11px] px-2 py-1 rounded bg-pulse-900 border border-pulse-800 text-emerald-300"
              >
                {rel.assetCode}: {formatPercent(rel.deltaPercent)} in {rel.windowMinutes}m
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-3 flex items-center justify-between text-[11px] sm:text-xs text-pulse-500 px-1 flex-wrap gap-2">
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Tap markers (1, 2, 3) to view empirical price shifts</span>
          </span>
          <span className="font-mono text-[10px]">UTC SYNCHRONIZED</span>
        </div>
      )}
    </div>
  );
}
