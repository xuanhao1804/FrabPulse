import { PriceSnapshot, GoldGapAnalysis } from './market';
import { MarketEvent } from './events';

export type PulseEventType =
  | 'PRICE_TICK'
  | 'NEW_EVENT'
  | 'CORRELATION_ALERT'
  | 'GAP_UPDATE'
  | 'HEARTBEAT';

export interface PulseSseMessage<T = unknown> {
  type: PulseEventType;
  payload: T;
  timestamp: string;
}

export type PriceTickMessage = PulseSseMessage<PriceSnapshot>;
export type NewEventMessage = PulseSseMessage<MarketEvent>;
export type GapUpdateMessage = PulseSseMessage<GoldGapAnalysis>;
export type HeartbeatMessage = PulseSseMessage<{ serverTime: string; activeClients: number }>;
