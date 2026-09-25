import { Module } from '@nestjs/common';
import { MarketDataController } from './controllers/market-data.controller';
import { MarketDataService } from './services/market-data.service';
import { GoldGapService } from './services/gold-gap.service';
import { VietnamGoldProvider } from './providers/vietnam-gold.provider';
import { InternationalGoldProvider } from './providers/international-gold.provider';
import { ForexProvider } from './providers/forex.provider';

@Module({
  controllers: [MarketDataController],
  providers: [
    MarketDataService,
    GoldGapService,
    VietnamGoldProvider,
    InternationalGoldProvider,
    ForexProvider
  ],
  exports: [MarketDataService, GoldGapService]
})
export class MarketDataModule {}
