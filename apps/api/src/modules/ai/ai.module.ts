import { Module } from '@nestjs/common';
import { DeterministicLabAIProvider } from './providers/deterministic-lab-ai.provider';
import { OpenAIProvider } from './providers/openai.provider';
import { AIIntelligenceService } from './services/ai-intelligence.service';

@Module({
  providers: [
    DeterministicLabAIProvider,
    OpenAIProvider,
    AIIntelligenceService
  ],
  exports: [AIIntelligenceService]
})
export class AIModule {}
