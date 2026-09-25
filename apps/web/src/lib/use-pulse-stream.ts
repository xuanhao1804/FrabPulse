'use client';

import { useEffect, useState, useCallback } from 'react';
import { PulseSseMessage, PriceSnapshot, GoldGapAnalysis, MarketEvent } from '@frabpulse/shared';

const SSE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/sse/pulse`;

export type StreamStatus = 'CONNECTING' | 'ONLINE' | 'OFFLINE';

export function usePulseStream() {
  const [status, setStatus] = useState<StreamStatus>('CONNECTING');
  const [latestPriceTick, setLatestPriceTick] = useState<PriceSnapshot | null>(null);
  const [latestGap, setLatestGap] = useState<GoldGapAnalysis | null>(null);
  const [latestEvent, setLatestEvent] = useState<MarketEvent | null>(null);
  const [lastHeartbeat, setLastHeartbeat] = useState<string | null>(null);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    function connect() {
      setStatus('CONNECTING');
      try {
        eventSource = new EventSource(SSE_URL);

        eventSource.onopen = () => {
          setStatus('ONLINE');
        };

        eventSource.onmessage = (event) => {
          try {
            const data: PulseSseMessage<unknown> = JSON.parse(event.data);
            if (data.type === 'PRICE_TICK') {
              setLatestPriceTick(data.payload as PriceSnapshot);
            } else if (data.type === 'GAP_UPDATE') {
              setLatestGap(data.payload as GoldGapAnalysis);
            } else if (data.type === 'NEW_EVENT') {
              setLatestEvent(data.payload as MarketEvent);
            } else if (data.type === 'HEARTBEAT') {
              setLastHeartbeat(data.timestamp);
            }
          } catch (err) {
            console.error('Failed to parse SSE payload', err);
          }
        };

        eventSource.onerror = () => {
          setStatus('OFFLINE');
          eventSource?.close();
          // Attempt reconnection after 5 seconds
          reconnectTimeout = setTimeout(connect, 5000);
        };
      } catch (err) {
        setStatus('OFFLINE');
        reconnectTimeout = setTimeout(connect, 5000);
      }
    }

    connect();

    return () => {
      eventSource?.close();
      clearTimeout(reconnectTimeout);
    };
  }, []);

  return {
    status,
    latestPriceTick,
    latestGap,
    latestEvent,
    lastHeartbeat
  };
}
