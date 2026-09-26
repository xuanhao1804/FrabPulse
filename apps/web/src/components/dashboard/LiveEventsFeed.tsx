'use client';

import React from 'react';
import { MarketEvent, formatPercent } from '@frabpulse/shared';
import { Radio, ExternalLink, ShieldCheck, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface LiveEventsFeedProps {
  events: MarketEvent[];
}

export function LiveEventsFeed({ events }: LiveEventsFeedProps) {
  const getTopicSlug = (type: MarketEvent['eventType']) => {
    switch (type) {
      case 'CENTRAL_BANK':
        return 'central-bank';
      case 'VIETNAM_REGULATION':
        return 'vietnam-regulation';
      case 'GEOPOLITICS':
        return 'geopolitics';
      case 'INFLATION':
        return 'inflation';
      case 'USD_DXY':
        return 'usd-dxy';
      default:
        return 'central-bank';
    }
  };

  const getBadgeStyle = (type: MarketEvent['eventType']) => {
    switch (type) {
      case 'CENTRAL_BANK':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
      case 'VIETNAM_REGULATION':
        return 'bg-amber-500/10 text-amber-800 dark:text-amber-400 border-amber-500/20';
      case 'GEOPOLITICS':
        return 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20';
      case 'INFLATION':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20';
      default:
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
    }
  };

  return (
    <div id="events" className="rounded-2xl bg-white dark:bg-pulse-900/90 border border-slate-200 dark:border-pulse-800 p-4 sm:p-6 shadow-sm dark:shadow-xl dark:shadow-black/20 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Live Event Intelligence Feed
            </h2>
            <p className="text-xs text-slate-500 dark:text-pulse-400">
              Clustered multi-source market news grounded with citations & price delta tracking
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-slate-600 dark:text-pulse-400 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-pulse-950 border border-slate-200 dark:border-pulse-800">
          {events.length} EVENTS
        </span>
      </div>

      {/* Responsive Event Feed */}
      <div className="space-y-4">
        {events.map((event) => {
          const topicSlug = getTopicSlug(event.eventType);

          return (
            <div
              key={event.id}
              className="relative rounded-xl bg-slate-50 dark:bg-pulse-950/70 border border-slate-200/80 dark:border-pulse-800/80 hover:border-slate-300 dark:hover:border-pulse-700 p-4 sm:p-5 transition-all hover:bg-slate-100/60 dark:hover:bg-pulse-950"
            >
              <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/topics/${topicSlug}`}
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border hover:opacity-80 transition-opacity ${getBadgeStyle(
                      event.eventType
                    )}`}
                  >
                    {event.eventType}
                  </Link>

                  <span className="text-xs text-slate-500 dark:text-pulse-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-slate-400 dark:text-pulse-500" />
                    <span>{new Date(event.happenedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC</span>
                  </span>
                </div>

                {/* Convergence confidence */}
                <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{Math.round(event.confidence * 100)}% convergence</span>
                </div>
              </div>

              <Link href={`/events/${event.id}`} className="block group">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors leading-snug">
                  {event.title}
                </h3>
              </Link>

              <p className="text-xs text-slate-600 dark:text-pulse-300 mt-1.5 leading-relaxed line-clamp-2">
                {event.summary}
              </p>

              {/* Bottom Row: Correlated Assets & Verified Sources */}
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-pulse-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-slate-500 dark:text-pulse-500 text-[10px] uppercase font-mono mr-1 font-bold">Delta:</span>
                  {event.relatedAssets.map((rel) => {
                    const isUp = rel.deltaPercent >= 0;
                    return (
                      <span
                        key={rel.assetCode}
                        className={`font-mono text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded ${
                          isUp
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {rel.assetCode} {formatPercent(rel.deltaPercent)} ({rel.windowMinutes}m)
                      </span>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-1 sm:pt-0">
                  <span className="text-slate-500 dark:text-pulse-400 text-[11px] flex items-center gap-1 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400 dark:text-pulse-400" />
                    <span>{event.sources.length} sources</span>
                  </span>

                  <Link
                    href={`/events/${event.id}`}
                    className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 font-semibold text-xs min-h-[36px] py-1 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-pulse-900 dark:hover:bg-pulse-800 border border-slate-200 dark:border-pulse-800 transition-colors"
                    aria-label={`View full intelligence analysis for ${event.title}`}
                  >
                    <span>Full Analysis</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
