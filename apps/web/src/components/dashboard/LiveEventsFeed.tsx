import React from 'react';
import { MarketEvent, formatPercent } from '@frabpulse/shared';
import { Radio, ExternalLink, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface LiveEventsFeedProps {
  events: MarketEvent[];
}

export function LiveEventsFeed({ events }: LiveEventsFeedProps) {
  const getBadgeStyle = (type: MarketEvent['eventType']) => {
    switch (type) {
      case 'CENTRAL_BANK':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'VIETNAM_REGULATION':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'GEOPOLITICS':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'INFLATION':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
  };

  return (
    <div className="rounded-2xl bg-pulse-900/90 border border-pulse-800 p-6 shadow-xl shadow-black/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">
              Live Event Intelligence Feed
            </h2>
            <p className="text-xs text-pulse-400">
              Clustered market news synthesized with verifiable source citations
            </p>
          </div>
        </div>

        <span className="text-xs font-mono text-pulse-400">
          {events.length} ACTIVE EVENTS
        </span>
      </div>

      <div className="space-y-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="group relative rounded-xl bg-pulse-950/70 border border-pulse-800/80 hover:border-pulse-700 p-4 transition-all hover:bg-pulse-950"
          >
            <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${getBadgeStyle(
                    event.eventType
                  )}`}
                >
                  {event.eventType}
                </span>

                <span className="text-[11px] text-pulse-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-pulse-500" />
                  <span>{new Date(event.happenedAt).toLocaleTimeString()} UTC</span>
                </span>
              </div>

              {/* Confidence metric */}
              <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                <span>{Math.round(event.confidence * 100)}% convergence</span>
              </div>
            </div>

            <Link href={`/events/${event.id}`} className="block">
              <h3 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors leading-snug">
                {event.title}
              </h3>
            </Link>

            <p className="text-xs text-pulse-300 mt-1.5 leading-relaxed line-clamp-2">
              {event.summary}
            </p>

            {/* Bottom Row: Correlated Assets & Verified Sources */}
            <div className="mt-3 pt-3 border-t border-pulse-900 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-pulse-500 text-[11px]">Associated Delta:</span>
                {event.relatedAssets.map((rel) => {
                  const isUp = rel.deltaPercent >= 0;
                  return (
                    <span
                      key={rel.assetCode}
                      className={`font-mono text-[11px] px-2 py-0.5 rounded ${
                        isUp
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {rel.assetCode} {formatPercent(rel.deltaPercent)} ({rel.windowMinutes}m)
                    </span>
                  );
                })}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-pulse-400 text-[11px] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-pulse-400" />
                  <span>{event.sources.length} sources</span>
                </span>

                <Link
                  href={`/events/${event.id}`}
                  className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium text-xs transition-colors"
                >
                  <span>Details</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
