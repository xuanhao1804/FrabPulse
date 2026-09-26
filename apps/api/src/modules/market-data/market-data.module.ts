import { Module } from '@nestjs/common';
import { MarketDataController } from './controllers/market-data.controller';
import { MarketDataService } from './services/market-data.service';
import { GoldGapService } from './services/gold-gap.service';
import { VietnamGoldProvider } from './providers/vietnam-gold.provider';
import { InternationalGoldProvider } from './providers/international-gold.provider';
import { ForexProvider } from './providers/forex.provider';
import { MarketDataScheduler } from './services/market-data.scheduler';

@Module({
  controllers: [MarketDataController],
  providers: [
    MarketDataService,
    GoldGapService,
    MarketDataScheduler,
    VietnamGoldProvider,
    InternationalGoldProvider,
    ForexProvider
  ],
  exports: [MarketDataService, GoldGapService, MarketDataScheduler]
})
export class MarketDataModule {}
