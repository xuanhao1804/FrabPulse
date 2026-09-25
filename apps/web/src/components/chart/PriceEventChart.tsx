'use client';

import React, { useState } from 'react';
import { PriceCandle, MarketEvent, formatUsd, formatVndMillions, formatPercent } from '@frabpulse/shared';
import { LineChart, Calendar, Tag, ExternalLink, Zap } from 'lucide-react';
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
  const priceRange = maxPrice - minPrice || 1;

  // Chart coordinate mapping
  const width = 800;
  const height = 260;
  const paddingX = 40;
  const paddingY = 30;

  const points = data.map((d, index) => {
    const x = paddingX + (index / (data.length - 1)) * (width - 2 * paddingX);
    const y = height - paddingY - ((d.close - minPrice) / priceRange) * (height - 2 * paddingY);
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '');
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="rounded-2xl bg-pulse-900/90 border border-pulse-800 p-6 shadow-xl shadow-black/20">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
              <LineChart className="w-5 h-5 text-emerald-400" />
              <span>Price Timeline & Associated Event Markers</span>
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-pulse-800 text-pulse-300">
              24-HOUR RADAR
            </span>
          </div>
          <p className="text-xs text-pulse-400 mt-0.5">
            Click event markers along the price curve to inspect empirical pre/post event price shifts
          </p>
        </div>

        {/* Asset Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-pulse-950 border border-pulse-800">
          <button
            onClick={() => {
              setSelectedAsset('XAU_USD');
              setActiveEvent(null);
            }}
            className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all ${
              isXau
                ? 'bg-emerald-500 text-pulse-950 font-bold shadow-md shadow-emerald-500/20'
                : 'text-pulse-400 hover:text-white'
            }`}
          >
            XAU/USD (Spot)
          </button>
          <button
            onClick={() => {
              setSelectedAsset('SJC_VN');
              setActiveEvent(null);
            }}
            className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all ${
              !isXau
                ? 'bg-emerald-500 text-pulse-950 font-bold shadow-md shadow-emerald-500/20'
                : 'text-pulse-400 hover:text-white'
            }`}
          >
            SJC 9999 (Domestic)
          </button>
        </div>
      </div>

      {/* SVG Chart Canvas */}
      <div className="relative w-full overflow-hidden rounded-xl bg-pulse-950/80 border border-pulse-800/80 p-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke="#1e293b"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={height / 2}
            x2={width - paddingX}
            y2={height / 2}
            stroke="#1e293b"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="#1e293b"
          />

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

          {/* Price bounds labels */}
          <text
            x={paddingX}
            y={paddingY - 8}
            fill="#64748b"
            fontSize="10"
            fontFamily="monospace"
          >
            HIGH: {isXau ? formatUsd(maxPrice) : formatVndMillions(maxPrice)}
          </text>
          <text
            x={paddingX}
            y={height - paddingY + 18}
            fill="#64748b"
            fontSize="10"
            fontFamily="monospace"
          >
            LOW: {isXau ? formatUsd(minPrice) : formatVndMillions(minPrice)}
          </text>

          {/* Event Pins / Markers along curve */}
          {events.map((evt, idx) => {
            // Distribute markers across key points for demonstration
            const targetIndex = idx === 0 ? 15 : idx === 1 ? 26 : 38;
            const pt = points[targetIndex] || points[0];
            const isSelected = activeEvent?.id === evt.id;

            return (
              <g
                key={evt.id}
                onClick={() => setActiveEvent(evt)}
                className="cursor-pointer group"
              >
                {/* Vertical marker stem */}
                <line
                  x1={pt.x}
                  y1={pt.y}
                  x2={pt.x}
                  y2={paddingY + 20}
                  stroke={isSelected ? '#34d399' : '#059669'}
                  strokeWidth={isSelected ? '2' : '1.2'}
                  strokeDasharray="2 2"
                />

                {/* Marker Flag Pin */}
                <circle
                  cx={pt.x}
                  cy={paddingY + 20}
                  r={isSelected ? '9' : '7'}
                  className={`${
                    isSelected
                      ? 'fill-emerald-400 stroke-pulse-950'
                      : 'fill-emerald-500 stroke-pulse-900 hover:fill-emerald-400'
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
      </div>

      {/* Active Event Spotlight Card */}
      {activeEvent ? (
        <div className="mt-4 p-4 rounded-xl bg-pulse-950 border border-emerald-500/30 animate-in fade-in duration-200">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                  {activeEvent.eventType}
                </span>
                <span className="text-xs text-pulse-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(activeEvent.happenedAt).toLocaleTimeString()} UTC
                </span>
              </div>
              <h4 className="text-sm font-semibold text-white">{activeEvent.title}</h4>
              <p className="text-xs text-pulse-300 mt-1 line-clamp-2">{activeEvent.summary}</p>
            </div>

            <Link
              href={`/events/${activeEvent.id}`}
              className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 px-3 py-1.5 rounded-lg bg-pulse-900 border border-pulse-800 transition-colors"
            >
              <span>Inspect Full Event</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Measured movements under this event */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-pulse-900 text-xs">
            <span className="text-pulse-400 font-medium">Associated Movements:</span>
            {activeEvent.relatedAssets.map((rel) => (
              <span
                key={rel.assetCode}
                className="font-mono text-xs px-2 py-0.5 rounded bg-pulse-900 border border-pulse-800 text-emerald-300"
              >
                {rel.assetCode}: {formatPercent(rel.deltaPercent)} in {rel.windowMinutes}m
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-3 flex items-center justify-between text-xs text-pulse-500 px-1">
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Click any numbered marker (1, 2, 3) above to highlight the correlated market event</span>
          </span>
          <span className="font-mono">TIMELINE: UTC-NORMALIZED</span>
        </div>
      )}
    </div>
  );
}
