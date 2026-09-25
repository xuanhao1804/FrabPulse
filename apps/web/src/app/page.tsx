import React from 'react';
import type { Metadata } from 'next';
import {
  fetchLatestPrices,
  fetchGoldGap,
  fetchHistoricalChart,
  fetchMarketEvents
} from '../lib/api-client';
import { DashboardClient } from '../components/dashboard/DashboardClient';
import { Compass, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Gold Pulse Radar — Real-time Event Intelligence | FrabPulse',
  description:
    'Monitor Vietnamese gold prices (SJC, DOJI, PNJ) and world spot gold (XAU/USD) correlated with macroeconomic and central bank announcements.',
  alternates: {
    canonical: 'https://frabpulse.com'
  }
};

export default async function HomePage() {
  const [prices, gapData, events, xauCandles, sjcCandles] = await Promise.all([
    fetchLatestPrices(),
    fetchGoldGap(),
    fetchMarketEvents(),
    fetchHistoricalChart('XAU_USD'),
    fetchHistoricalChart('SJC_VN')
  ]);

  // Dataset Schema.org for financial market snapshots
  const datasetJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: 'FrabPulse Gold Market & Event Correlation Dataset',
    description: 'Empirical time-series dataset measuring Vietnamese domestic gold spreads, world spot XAU/USD, and temporal event movements.',
    url: 'https://frabpulse.com',
    license: 'https://creativecommons.org/licenses/by/4.0/',
    creator: {
      '@type': 'Organization',
      name: 'FrabPulse'
    },
    temporalCoverage: '2026',
    variableMeasured: ['SJC Gold Price', 'DOJI Gold Price', 'PNJ Gold Price', 'XAU/USD Spot', 'USD/VND Rate', 'Event Correlation Delta']
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd) }}
      />

      {/* Semantic Server-Rendered Hero Header */}
      <header className="space-y-2">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
          Gold Pulse Radar
        </h1>
        <p className="text-xs sm:text-sm text-pulse-300 max-w-3xl leading-relaxed">
          Real-time domestic bullion quotations, global spot gold correlation, and multi-source event intelligence. Measuring what moves, when it moves.
        </p>
      </header>

      {/* Interactive Client Island with Initial Server Data */}
      <DashboardClient
        initialPrices={prices}
        initialGap={gapData}
        initialEvents={events}
        initialXauCandles={xauCandles}
        initialSjcCandles={sjcCandles}
      />
    </div>
  );
}
