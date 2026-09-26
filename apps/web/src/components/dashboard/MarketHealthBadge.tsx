'use client';

import React from 'react';
import { MarketHealthStatus, ProviderDataSource } from '@frabpulse/shared';
import { StreamStatus } from '../../lib/use-pulse-stream';
import { formatTimeAgo, formatAbsoluteDateTime } from '../../lib/utils';
import { Wifi, WifiOff, Clock, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';

interface MarketHealthBadgeProps {
  status?: MarketHealthStatus['status'];
  streamStatus?: StreamStatus;
  sourceType?: ProviderDataSource;
  lastSync?: string | null;
  circuitBreakers?: Record<string, { state: string; failureCount: number; resetTimeoutMs: number }>;
  compact?: boolean;
}

export function MarketHealthBadge({
  status = 'HEALTHY',
  streamStatus = 'ONLINE',
  sourceType,
  lastSync,
  circuitBreakers,
  compact = false
}: MarketHealthBadgeProps) {
  // Determine overall effective health
  const isReconnecting = streamStatus === 'CONNECTING';
  const isStreamOffline = streamStatus === 'OFFLINE';
  const hasTrippedBreaker = circuitBreakers
    ? Object.values(circuitBreakers).some((cb) => cb.state === 'OPEN')
    : false;

  const effectiveType: 'LIVE' | 'CACHED' | 'RECONNECTING' | 'FALLBACK' = isReconnecting
    ? 'RECONNECTING'
    : isStreamOffline || status === 'OFFLINE' || sourceType === 'FALLBACK'
    ? 'FALLBACK'
    : hasTrippedBreaker || status === 'DEGRADED' || sourceType === 'CACHED'
    ? 'CACHED'
    : 'LIVE';

  const relativeTime = lastSync ? formatTimeAgo(lastSync) : null;
  const absoluteTime = lastSync ? formatAbsoluteDateTime(lastSync) : null;
  const tooltipText = absoluteTime
    ? `Last sync: ${absoluteTime.ict} | ${absoluteTime.utc}${hasTrippedBreaker ? ' (Upstream circuit open)' : ''}`
    : 'Waiting for initial sync tick...';

  return (
    <div
      aria-live="polite"
      className="inline-flex items-center gap-1.5 max-w-full"
      title={tooltipText}
    >
      {effectiveType === 'LIVE' && (
        <span
          className={`inline-flex items-center gap-1.5 font-mono font-medium rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 truncate ${
            compact ? 'px-1.5 py-0.5 text-[9px]' : 'px-2.5 py-1 text-xs'
          }`}
        >
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="tracking-wide">LIVE FEED</span>
          {relativeTime && (
            <span className="text-emerald-400/70 border-l border-emerald-500/30 pl-1.5 hidden xs:inline truncate">
              {relativeTime}
            </span>
          )}
        </span>
      )}

      {effectiveType === 'CACHED' && (
        <span
          className={`inline-flex items-center gap-1.5 font-mono font-medium rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 truncate ${
            compact ? 'px-1.5 py-0.5 text-[9px]' : 'px-2.5 py-1 text-xs'
          }`}
        >
          <Clock className="w-3 h-3 text-amber-400 shrink-0" />
          <span className="tracking-wide">CACHED</span>
          {hasTrippedBreaker && (
            <span className="text-amber-400/80 hidden sm:inline" title="Circuit breaker active">
              (CIRCUIT OPEN)
            </span>
          )}
          {relativeTime && (
            <span className="text-amber-300/70 border-l border-amber-500/30 pl-1.5 hidden xs:inline truncate">
              {relativeTime}
            </span>
          )}
        </span>
      )}

      {effectiveType === 'RECONNECTING' && (
        <span
          className={`inline-flex items-center gap-1.5 font-mono font-medium rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/30 truncate ${
            compact ? 'px-1.5 py-0.5 text-[9px]' : 'px-2.5 py-1 text-xs'
          }`}
        >
          <RefreshCw className="w-3 h-3 text-sky-400 animate-spin shrink-0" />
          <span className="tracking-wide">RECONNECTING</span>
        </span>
      )}

      {effectiveType === 'FALLBACK' && (
        <span
          className={`inline-flex items-center gap-1.5 font-mono font-medium rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/30 truncate ${
            compact ? 'px-1.5 py-0.5 text-[9px]' : 'px-2.5 py-1 text-xs'
          }`}
        >
          <WifiOff className="w-3 h-3 text-rose-400 shrink-0" />
          <span className="tracking-wide">FALLBACK FIXTURES</span>
          {relativeTime && (
            <span className="text-rose-300/70 border-l border-rose-500/30 pl-1.5 hidden xs:inline truncate">
              {relativeTime}
            </span>
          )}
        </span>
      )}
    </div>
  );
}
