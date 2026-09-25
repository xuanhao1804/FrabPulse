import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { MarketDataModule } from './modules/market-data/market-data.module';
import { NewsModule } from './modules/news/news.module';
import { EventsModule } from './modules/events/events.module';
import { AIModule } from './modules/ai/ai.module';
import { SseModule } from './modules/sse/sse.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env']
    }),
    DatabaseModule,
    MarketDataModule,
    NewsModule,
    EventsModule,
    AIModule,
    SseModule,
    HealthModule
  ]
})
export class AppModule {}
