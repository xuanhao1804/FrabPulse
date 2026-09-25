import { AssetCode } from './market';

export type EventType =
  | 'CENTRAL_BANK'
  | 'INFLATION'
  | 'GEOPOLITICS'
  | 'USD_DXY'
  | 'GOLD_DEMAND'
  | 'VIETNAM_REGULATION'
  | 'OTHER';

export type CitationRole = 'PRIMARY' | 'CONFIRMING' | 'PERSPECTIVE';

export interface EventSourceCitation {
  sourceId: string;
  sourceName: string;
  sourceDomain: string;
  articleTitle: string;
  articleUrl: string;
  publishedAt: string; // ISO 8601
  citationRole: CitationRole;
  excerpt?: string;
}

export interface AssetMovementCorrelation {
  assetCode: AssetCode;
  assetName: string;
  priceBefore: number;
  priceAfter: number;
  deltaAbsolute: number;
  deltaPercent: number;
  windowMinutes: number;
  measuredFrom: string; // ISO 8601
  measuredTo: string; // ISO 8601
  isStatisticallySignificant: boolean;
  correlationCaveat: string;
}

export interface MarketEvent {
  id: string;
  title: string;
  summary: string;
  eventType: EventType;
  happenedAt: string; // ISO 8601
  detectedAt: string; // ISO 8601
  entities: string[];
  sources: EventSourceCitation[];
  relatedAssets: AssetMovementCorrelation[];
  confidence: number; // 0.00 to 1.00
  synthesis: {
    factualContext: string;
    sourceConsensus: string;
    divergentPoints?: string[];
  };
  methodologyNotes: string;
  isDemo: boolean;
}
