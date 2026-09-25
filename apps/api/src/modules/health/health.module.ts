import { Module } from '@nestjs/common';
import { HealthController } from './controllers/health.controller';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [AIModule],
  controllers: [HealthController]
})
export class HealthModule {}
