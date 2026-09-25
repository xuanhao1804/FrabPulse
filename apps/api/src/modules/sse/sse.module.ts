import { Module } from '@nestjs/common';
import { SseController } from './controllers/sse.controller';
import { SseBroadcasterService } from './services/sse-broadcaster.service';
import { MarketDataModule } from '../market-data/market-data.module';

@Module({
  imports: [MarketDataModule],
  controllers: [SseController],
  providers: [SseBroadcasterService],
  exports: [SseBroadcasterService]
})
export class SseModule {}
