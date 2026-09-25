import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ASSET_DEFINITIONS, formatVndMillions, formatUsd, formatPercent } from '@frabpulse/shared';
import { fetchLatestPrices, fetchGoldGap } from '../../lib/api-client';
import { Layers, ArrowRight, Scale, ShieldCheck, ExternalLink, HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Gold Market Directory & Bullion Specifications | FrabPulse',
  description:
    'Comprehensive directory of Vietnamese domestic gold benchmarks (SJC, DOJI, PNJ) and international spot gold (XAU/USD) with conversion formulas and arbitrage metrics.',
  alternates: {
    canonical: 'https://frabpulse.com/gold'
  },
  openGraph: {
    title: 'Gold Market Directory & Bullion Specifications | FrabPulse',
    description: 'Track domestic Vietnamese gold brands and spot gold specifications.'
  }
};

export default async function GoldHubPage() {
  const [prices, gapData] = await Promise.all([
    fetchLatestPrices(),
    fetchGoldGap()
  ]);

  const breadcrumbsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://frabpulse.com'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Gold Directory',
        item: 'https://frabpulse.com/gold'
      }
    ]
  };

  const assets = Object.values(ASSET_DEFINITIONS);

  return (
    <div className="max-w-5xl mx-auto space-y-8 sm:space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />

      {/* Header */}
      <div className="space-y-3 pb-6 border-b border-pulse-800">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Layers className="w-5 h-5" />
          </span>
          <span className="text-xs font-mono font-bold tracking-wider text-emerald-400 uppercase">
            Asset Intelligence Hub
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
          Gold Market Directory & Provider Specifications
        </h1>
        <p className="text-xs sm:text-sm text-pulse-300 max-w-3xl leading-relaxed">
          Detailed overview of national gold bullion benchmarks in Vietnam and international commodity exchanges. Understand specifications, historical spreads, and regulatory backgrounds.
        </p>
      </div>

      {/* Vietnam vs World Summary Box */}
      <div className="p-5 sm:p-6 rounded-2xl bg-pulse-900/80 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
            <Scale className="w-4 h-4" />
            <span>CURRENT DOMESTIC PREMIUM METRIC</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white">
            Vietnam Gold trades at a +{formatPercent(gapData.gapPercent)} (+{formatVndMillions(gapData.gapVnd)}/lượng) premium over World Spot
          </h2>
          <p className="text-xs text-pulse-400 mt-1">
            Based on spot gold at {formatUsd(gapData.xauUsd)}/oz and commercial FX at {gapData.usdVnd.toLocaleString()} VND/USD.
          </p>
        </div>

        <Link
          href="/methodology"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-pulse-950 border border-pulse-800 text-xs font-mono text-emerald-400 hover:text-emerald-300 min-h-[44px] transition-colors shrink-0"
        >
          <span>Conversion Math</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Provider Profiles Grid */}
      <section aria-labelledby="profiles-heading" className="space-y-4">
        <h2 id="profiles-heading" className="text-lg font-bold text-white tracking-tight">
          Tracked Bullion Entities & Assets
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assets.map((asset) => {
            const price = prices.find((p) => p.assetCode === asset.code);
            const isVnd = asset.category === 'GOLD_DOMESTIC' || asset.code === 'USD_VND';

            return (
              <div
                key={asset.code}
                className="rounded-2xl bg-pulse-900/90 border border-pulse-800 hover:border-pulse-700 p-5 flex flex-col justify-between transition-all group hover:shadow-lg"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-pulse-800 text-emerald-400">
                      {asset.symbol}
                    </span>
                    <span className="text-[11px] font-mono text-pulse-400">{asset.category}</span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {asset.name}
                  </h3>

                  <p className="text-xs text-pulse-300 mt-1.5 leading-relaxed">
                    {asset.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-pulse-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-pulse-400 block font-mono">LATEST QUOTE</span>
                    <span className="text-sm font-bold font-mono text-white">
                      {price ? (isVnd ? formatVndMillions(price.sellPrice) : formatUsd(price.sellPrice)) : 'Active'}
                    </span>
                  </div>

                  <Link
                    href={`/gold/${asset.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium min-h-[44px] px-3 py-2 rounded-xl bg-pulse-950 border border-pulse-800 transition-colors"
                  >
                    <span>View Specifications</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Regulatory Context Box */}
      <section className="p-5 sm:p-6 rounded-2xl bg-pulse-900/50 border border-pulse-800 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>Vietnamese Gold Market Regulatory Architecture (Decree 24)</span>
        </h3>
        <p className="text-xs text-pulse-300 leading-relaxed">
          Under Vietnam&apos;s Decree 24/2012/ND-CP, the State Bank of Vietnam holds exclusive sovereign authority over gold bullion production and import quotas. SJC 9999 was designated the sole national bullion brand, giving rise to unique domestic spread dynamics against world spot gold.
        </p>
        <div className="pt-2">
          <Link
            href="/topics/vietnam-regulation"
            className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-mono"
          >
            <span>Read full regulatory analysis on Decree 24</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
