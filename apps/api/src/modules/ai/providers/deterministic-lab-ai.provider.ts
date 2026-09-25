import { Injectable, Logger } from '@nestjs/common';
import { IAIIntelligenceProvider, ExtractedEventDto } from '../interfaces/ai-provider.interface';
import { RawArticleDto } from '../../news/interfaces/news-provider.interface';
import { EventType } from '@frabpulse/shared';

@Injectable()
export class DeterministicLabAIProvider implements IAIIntelligenceProvider {
  private readonly logger = new Logger(DeterministicLabAIProvider.name);
  readonly providerName = 'DETERMINISTIC_LAB_AI_V1';

  async extractStructuredEvent(articles: RawArticleDto[]): Promise<ExtractedEventDto> {
    this.logger.debug(
      `Running deterministic entity extraction and synthesis across ${articles.length} article(s)...`
    );

    const combinedText = articles.map((a) => `${a.title} ${a.summary}`).join(' ');

    // Rule-based heuristic categorization
    let eventType: EventType = 'OTHER';
    if (/fed|fomc|interest rate|powell|central bank/i.test(combinedText)) {
      eventType = 'CENTRAL_BANK';
    } else if (/sbv|ngân hàng nhà nước|sjc|bình ổn/i.test(combinedText)) {
      eventType = 'VIETNAM_REGULATION';
    } else if (/war|conflict|shipping|red sea|geopolitical|crisis/i.test(combinedText)) {
      eventType = 'GEOPOLITICS';
    } else if (/cpi|inflation|pce|price index/i.test(combinedText)) {
      eventType = 'INFLATION';
    } else if (/dxy|dollar index|treasury/i.test(combinedText)) {
      eventType = 'USD_DXY';
    }

    // Entity extraction
    const entityCandidates = [
      'Federal Reserve',
      'Jerome Powell',
      'FOMC',
      'State Bank of Vietnam',
      'SJC',
      'US Treasury',
      'Red Sea',
      'Brent Crude',
      'Vietcombank'
    ];
    const detectedEntities = entityCandidates.filter((entity) =>
      new RegExp(entity, 'i').test(combinedText)
    );

    const firstArticle = articles[0] || {
      title: 'Market Event Observed',
      summary: 'Automated event clustering detected multi-source coverage.'
    };

    return {
      title: firstArticle.title,
      summary: firstArticle.summary,
      eventType,
      entities: detectedEntities.length > 0 ? detectedEntities : ['Market Participants'],
      confidence: this.calculateConfidence(articles),
      synthesis: {
        factualContext: `Observed event consolidated from ${articles.length} verified news report(s).`,
        sourceConsensus: `Outlets concurred on initial market impact and timeline progression without contradictory operational statements.`,
        divergentPoints: []
      }
    };
  }

  calculateConfidence(articles: RawArticleDto[]): number {
    if (articles.length >= 3) return 0.96;
    if (articles.length === 2) return 0.92;
    return 0.85;
  }
}
