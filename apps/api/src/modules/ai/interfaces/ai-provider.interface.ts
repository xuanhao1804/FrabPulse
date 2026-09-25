import { EventType, EventSourceCitation } from '@frabpulse/shared';
import { RawArticleDto } from '../../news/interfaces/news-provider.interface';

export interface ExtractedEventDto {
  title: string;
  summary: string;
  eventType: EventType;
  entities: string[];
  confidence: number;
  synthesis: {
    factualContext: string;
    sourceConsensus: string;
    divergentPoints?: string[];
  };
}

export interface IAIIntelligenceProvider {
  readonly providerName: string;
  extractStructuredEvent(articles: RawArticleDto[]): Promise<ExtractedEventDto>;
  calculateConfidence(articles: RawArticleDto[]): number;
}
