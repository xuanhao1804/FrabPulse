import { describe, it, expect } from 'vitest';
import { formatTimeAgo, formatAbsoluteDateTime } from '../src/lib/utils';

describe('Data Freshness & Time Formatting Utilities', () => {
  it('formats recent timestamps in human-readable seconds or minutes', () => {
    const now = new Date().toISOString();
    expect(formatTimeAgo(now)).toBe('Just now');

    const twentySecsAgo = new Date(Date.now() - 20 * 1000).toISOString();
    expect(formatTimeAgo(twentySecsAgo)).toBe('20s ago');

    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(formatTimeAgo(fiveMinsAgo)).toBe('5m ago');

    const threeHoursAgo = new Date(Date.now() - 3 * 3600 * 1000).toISOString();
    expect(formatTimeAgo(threeHoursAgo)).toBe('3h ago');
  });

  it('generates both UTC and ICT (UTC+7) absolute strings for tooltips', () => {
    const fixedIso = '2026-09-26T06:30:00.000Z';
    const { utc, ict } = formatAbsoluteDateTime(fixedIso);

    expect(utc).toContain('2026-09-26 06:30:00 UTC');
    expect(ict).toContain('2026-09-26 13:30:00 ICT'); // 06:30 + 7 hours = 13:30
  });

  it('handles invalid dates gracefully in formatAbsoluteDateTime', () => {
    const { utc, ict } = formatAbsoluteDateTime('invalid-date-string');
    expect(utc).toBe('N/A');
    expect(ict).toBe('N/A');
  });
});

describe('Market Health & Provenance Resolution Engine', () => {
  function resolveEffectiveHealth(params: {
    streamStatus?: 'CONNECTING' | 'ONLINE' | 'OFFLINE';
    status?: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
    sourceType?: 'LIVE_FEED' | 'CACHED' | 'FALLBACK';
    circuitBreakers?: Record<string, { state: string; failureCount: number; resetTimeoutMs: number }>;
  }): 'LIVE' | 'CACHED' | 'RECONNECTING' | 'FALLBACK' {
    const isReconnecting = params.streamStatus === 'CONNECTING';
    const isStreamOffline = params.streamStatus === 'OFFLINE';
    const hasTrippedBreaker = params.circuitBreakers
      ? Object.values(params.circuitBreakers).some((cb) => cb.state === 'OPEN')
      : false;

    if (isReconnecting) return 'RECONNECTING';
    if (isStreamOffline || params.status === 'OFFLINE' || params.sourceType === 'FALLBACK') return 'FALLBACK';
    if (hasTrippedBreaker || params.status === 'DEGRADED' || params.sourceType === 'CACHED') return 'CACHED';
    return 'LIVE';
  }

  it('resolves to LIVE when SSE stream is online and data source is LIVE_FEED', () => {
    const res = resolveEffectiveHealth({
      streamStatus: 'ONLINE',
      status: 'HEALTHY',
      sourceType: 'LIVE_FEED'
    });
    expect(res).toBe('LIVE');
  });

  it('resolves to RECONNECTING when SSE connection is in CONNECTING state', () => {
    const res = resolveEffectiveHealth({
      streamStatus: 'CONNECTING',
      status: 'HEALTHY',
      sourceType: 'LIVE_FEED'
    });
    expect(res).toBe('RECONNECTING');
  });

  it('resolves to CACHED when circuit breaker is tripped to OPEN state', () => {
    const res = resolveEffectiveHealth({
      streamStatus: 'ONLINE',
      status: 'HEALTHY',
      sourceType: 'LIVE_FEED',
      circuitBreakers: {
        VangTodayDomestic: { state: 'OPEN', failureCount: 3, resetTimeoutMs: 300000 }
      }
    });
    expect(res).toBe('CACHED');
  });

  it('resolves to FALLBACK when stream is offline or source is fallback fixtures', () => {
    const res = resolveEffectiveHealth({
      streamStatus: 'OFFLINE',
      status: 'OFFLINE',
      sourceType: 'FALLBACK'
    });
    expect(res).toBe('FALLBACK');
  });
});
