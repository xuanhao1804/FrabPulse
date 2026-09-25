import { Module } from '@nestjs/common';
import { EventsController } from './controllers/events.controller';
import { EventsService } from './services/events.service';
import { CorrelationEngineService } from './services/correlation-engine.service';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [AIModule],
  controllers: [EventsController],
  providers: [EventsService, CorrelationEngineService],
  exports: [EventsService, CorrelationEngineService]
})
export class EventsModule {}
