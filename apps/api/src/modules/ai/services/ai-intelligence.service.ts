import { Injectable, Logger } from '@nestjs/common';
import { DeterministicLabAIProvider } from '../providers/deterministic-lab-ai.provider';
import { OpenAIProvider } from '../providers/openai.provider';
import { RawArticleDto } from '../../news/interfaces/news-provider.interface';
import { ExtractedEventDto } from '../interfaces/ai-provider.interface';

@Injectable()
export class AIIntelligenceService {
  private readonly logger = new Logger(AIIntelligenceService.name);

  constructor(
    private readonly deterministicProvider: DeterministicLabAIProvider,
    private readonly openAIProvider: OpenAIProvider
  ) {}

  async processEventIntelligence(articles: RawArticleDto[]): Promise<ExtractedEventDto> {
    if (this.openAIProvider.isConfigured) {
      return this.openAIProvider.extractStructuredEvent(articles);
    }
    return this.deterministicProvider.extractStructuredEvent(articles);
  }

  getActiveProviderName(): string {
    return this.openAIProvider.isConfigured
      ? this.openAIProvider.providerName
      : this.deterministicProvider.providerName;
  }
}
