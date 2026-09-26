import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  getAssetBySlug,
  ASSET_DEFINITIONS,
  formatVndMillions,
  formatUsd,
  formatPercent,
  formatVnd
} from '@frabpulse/shared';
import { fetchLatestPrices, fetchMarketEvents, fetchGoldGap } from '../../../lib/api-client';
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Layers, ShieldCheck, Scale, ExternalLink, Calendar, Compass } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return Object.values(ASSET_DEFINITIONS).map((asset) => ({
    slug: asset.slug
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const asset = getAssetBySlug(slug);

  if (!asset) {
    return {
      title: 'Asset Not Found | FrabPulse'
    };
  }

  return {
    title: `${asset.name} Price, Spreads & Event Correlation | FrabPulse`,
    description: `Track ${asset.name} (${asset.symbol}) quotes, bid-ask spread analysis, and correlated macroeconomic events.`,
    alternates: {
      canonical: `https://frabpulse.com/gold/${slug}`
    },
    openGraph: {
      title: `${asset.name} Price, Spreads & Event Correlation`,
      description: `Live quotes and event impact correlation for ${asset.name}.`
    }
  };
}

export default async function AssetDetailPage({ params }: Props) {
  const { slug } = await params;
  const asset = getAssetBySlug(slug);

  if (!asset) {
    notFound();
  }

  const [prices, allEvents, gapData] = await Promise.all([
    fetchLatestPrices(),
    fetchMarketEvents(),
    fetchGoldGap()
  ]);

  const price = prices.find((p) => p.assetCode === asset.code);
  const isUp = (price?.change24hPercent ?? 0) >= 0;
  const isVnd = asset.category === 'GOLD_DOMESTIC' || asset.code === 'USD_VND';

  // Events that have movements directly on this asset
  const relatedEvents = allEvents.filter((evt) =>
    evt.relatedAssets.some((ra) => ra.assetCode === asset.code)
  );

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
        name: 'Gold Hub',
        item: 'https://frabpulse.com/gold'
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: asset.name,
        item: `https://frabpulse.com/gold/${slug}`
      }
    ]
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />

      {/* Back button */}
      <div>
        <Link
          href="/gold"
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-500 hover:text-slate-900 dark:text-pulse-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO GOLD DIRECTORY</span>
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-3 pb-6 border-b border-slate-200 dark:border-pulse-800">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 text-xs font-mono font-bold rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            {asset.symbol}
          </span>
          <span className="text-xs text-slate-500 dark:text-pulse-400 font-mono uppercase">{asset.category}</span>
          <span className="text-xs text-slate-400 dark:text-pulse-500">•</span>
          <span className="text-xs text-slate-500 dark:text-pulse-400 font-mono">Unit: {asset.unit}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug">
          {asset.name}
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-pulse-300 leading-relaxed max-w-3xl">
          {asset.description}
        </p>
      </div>

      {/* Live Quote Card */}
      {price && (
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-pulse-900/90 border border-slate-200 dark:border-pulse-800 space-y-4 shadow-sm">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <span className="text-xs font-mono text-slate-500 dark:text-pulse-400">OFFICIAL QUOTATION</span>
              <h2 className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                {isVnd ? formatVndMillions(price.sellPrice) : formatUsd(price.sellPrice)}
              </h2>
              <span className="text-[11px] text-slate-500 dark:text-pulse-500 font-mono">
                {isVnd ? formatVnd(price.sellPrice) : `${price.sellPrice} USD`}
              </span>
            </div>

            {price.change24hPercent !== undefined && (
              <div
                className={`flex items-center text-xs font-mono font-semibold px-2.5 py-1 rounded-lg ${
                  isUp
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                }`}
              >
                {isUp ? (
                  <ArrowUpRight className="w-4 h-4 mr-0.5" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 mr-0.5" />
                )}
                <span>{formatPercent(price.change24hPercent)} (24h)</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-200 dark:border-pulse-800 text-xs">
            <div>
              <span className="text-slate-500 dark:text-pulse-500 text-[10px] block">Buy (Bid)</span>
              <span className="font-mono text-sm font-semibold text-slate-700 dark:text-pulse-200">
                {isVnd ? formatVndMillions(price.buyPrice) : formatUsd(price.buyPrice)}
              </span>
            </div>

            <div>
              <span className="text-slate-500 dark:text-pulse-500 text-[10px] block">Sell (Ask)</span>
              <span className="font-mono text-sm font-semibold text-slate-900 dark:text-white">
                {isVnd ? formatVndMillions(price.sellPrice) : formatUsd(price.sellPrice)}
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <span className="text-slate-500 dark:text-pulse-500 text-[10px] block">Bid-Ask Spread</span>
              <span className="font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                {isVnd ? formatVndMillions(price.spread) : `$${price.spread.toFixed(2)}`}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Events Correlated with this Asset */}
      <section aria-labelledby="events-heading" className="space-y-4">
        <h2 id="events-heading" className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Recent Market Events Correlated with {asset.symbol}</span>
        </h2>

        {relatedEvents.length > 0 ? (
          <div className="space-y-3">
            {relatedEvents.map((evt) => {
              const rel = evt.relatedAssets.find((r) => r.assetCode === asset.code);
              return (
                <div
                  key={evt.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-pulse-950/80 border border-slate-200 dark:border-pulse-800 hover:border-slate-300 dark:hover:border-pulse-700 transition-colors shadow-sm"
                >
                  <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white dark:bg-pulse-900 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-pulse-800">
                      {evt.eventType}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-pulse-500">
                      {new Date(evt.happenedAt).toUTCString()}
                    </span>
                  </div>

                  <Link href={`/events/${evt.id}`}>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors">
                      {evt.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-slate-600 dark:text-pulse-300 mt-1 line-clamp-2">
                    {evt.summary}
                  </p>

                  {rel && (
                    <div className="mt-3 pt-2 border-t border-slate-200 dark:border-pulse-900 flex items-center justify-between text-xs font-mono">
                      <span className="text-emerald-600 dark:text-emerald-400">
                        Observed Shift: {formatPercent(rel.deltaPercent)} in {rel.windowMinutes}m
                      </span>
                      <Link
                        href={`/events/${evt.id}`}
                        className="text-slate-500 hover:text-emerald-600 dark:text-pulse-400 dark:hover:text-emerald-400 flex items-center gap-1 font-sans text-[11px]"
                      >
                        <span>View Evidence</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-slate-50 dark:bg-pulse-950/40 border border-slate-200 dark:border-pulse-800 text-center text-xs text-slate-500 dark:text-pulse-400">
            No specific event clusters recorded for {asset.symbol} in the current rolling window.
          </div>
        )}
      </section>

      {/* Internal Navigation to Other Gold Assets */}
      <section className="pt-4 border-t border-slate-200 dark:border-pulse-800">
        <span className="text-xs text-slate-500 dark:text-pulse-500 font-mono block mb-3">COMPARE OTHER GOLD ASSETS:</span>
        <div className="flex items-center gap-2 flex-wrap">
          {Object.values(ASSET_DEFINITIONS)
            .filter((a) => a.code !== asset.code)
            .map((other) => (
              <Link
                key={other.code}
                href={`/gold/${other.slug}`}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 dark:bg-pulse-900 dark:hover:bg-pulse-800 text-xs font-mono text-slate-700 dark:text-pulse-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-pulse-800 transition-colors shadow-sm"
              >
                {other.name} ({other.symbol})
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}
