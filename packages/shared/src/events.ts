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

export interface TopicMetadata {
  slug: string;
  eventType: EventType;
  title: string;
  shortName: string;
  description: string;
}

export const TOPIC_DEFINITIONS: Record<string, TopicMetadata> = {
  'central-bank': {
    slug: 'central-bank',
    eventType: 'CENTRAL_BANK',
    title: 'Central Bank Rate Decisions & Monetary Policy',
    shortName: 'Central Banks',
    description: 'Federal Reserve, State Bank of Vietnam, and global central bank rate announcements and monetary guidance affecting precious metal valuations.'
  },
  'vietnam-regulation': {
    slug: 'vietnam-regulation',
    eventType: 'VIETNAM_REGULATION',
    title: 'Vietnam Gold Market Regulations & State Bank Interventions',
    shortName: 'Vietnam Regulation',
    description: 'State Bank of Vietnam circulars, Decree 24 amendments, commercial bank bullion auctions, and domestic price stabilization initiatives.'
  },
  'geopolitics': {
    slug: 'geopolitics',
    eventType: 'GEOPOLITICS',
    title: 'Geopolitical Conflicts & Safe-Haven Commodity Flows',
    shortName: 'Geopolitics',
    description: 'International conflicts, maritime trade disruptions, and sovereign geopolitical shifts triggering risk-off defensive bullion reallocation.'
  },
  'inflation': {
    slug: 'inflation',
    eventType: 'INFLATION',
    title: 'Inflation Releases, CPI & Real Interest Rates',
    shortName: 'Inflation',
    description: 'Consumer price index prints, producer inflation indicators, and bond market real yield shifts.'
  },
  'usd-dxy': {
    slug: 'usd-dxy',
    eventType: 'USD_DXY',
    title: 'US Dollar Index (DXY) & Currency Fluctuations',
    shortName: 'US Dollar & FX',
    description: 'Dollar index fluctuations, Treasury yield curve adjustments, and USD/VND commercial exchange volatility.'
  }
};

export function getTopicBySlug(slug: string): TopicMetadata | undefined {
  return TOPIC_DEFINITIONS[slug.toLowerCase()];
}
