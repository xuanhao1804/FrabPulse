import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IAIIntelligenceProvider, ExtractedEventDto } from '../interfaces/ai-provider.interface';
import { RawArticleDto } from '../../news/interfaces/news-provider.interface';
import { DeterministicLabAIProvider } from './deterministic-lab-ai.provider';

@Injectable()
export class OpenAIProvider implements IAIIntelligenceProvider {
  private readonly logger = new Logger(OpenAIProvider.name);
  readonly providerName = 'OPENAI_STRUCTURED_API';
  private readonly apiKey?: string;
  private readonly modelName: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly fallbackProvider: DeterministicLabAIProvider
  ) {
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.modelName = this.configService.get<string>('OPENAI_MODEL') || 'gpt-4o-mini';
  }

  get isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async extractStructuredEvent(articles: RawArticleDto[]): Promise<ExtractedEventDto> {
    if (!this.isConfigured) {
      this.logger.debug('OPENAI_API_KEY not configured. Falling back to DeterministicLabAIProvider.');
      return this.fallbackProvider.extractStructuredEvent(articles);
    }

    try {
      this.logger.log(`Invoking OpenAI (${this.modelName}) structured extraction...`);
      // When apiKey is present, fetch structured output via standard OpenAI REST API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.modelName,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: `You are FrabPulse's AI Event Extraction Engine.
Extract factual event metadata from the provided news dispatches.
DO NOT assert unsupported causal links. Separate observed facts from source interpretations.
Respond with JSON matching schema:
{
  "title": string,
  "summary": string,
  "eventType": "CENTRAL_BANK" | "INFLATION" | "GEOPOLITICS" | "USD_DXY" | "GOLD_DEMAND" | "VIETNAM_REGULATION" | "OTHER",
  "entities": string[],
  "confidence": number,
  "synthesis": {
    "factualContext": string,
    "sourceConsensus": string,
    "divergentPoints": string[]
  }
}`
            },
            {
              role: 'user',
              content: JSON.stringify(articles)
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI HTTP ${response.status}: ${await response.text()}`);
      }

      const json = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const content = json.choices?.[0]?.message?.content;
      if (!content) throw new Error('Empty response from OpenAI');
      return JSON.parse(content) as ExtractedEventDto;
    } catch (error) {
      this.logger.error('OpenAI invocation failed, using deterministic fallback', error);
      return this.fallbackProvider.extractStructuredEvent(articles);
    }
  }

  calculateConfidence(articles: RawArticleDto[]): number {
    return this.fallbackProvider.calculateConfidence(articles);
  }
}
