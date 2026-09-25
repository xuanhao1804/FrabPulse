import { Injectable, Logger } from '@nestjs/common';
import {
  AssetCode,
  PriceSnapshot,
  PriceCandle,
  GoldGapAnalysis,
  ASSET_DEFINITIONS
} from '@frabpulse/shared';
import { VietnamGoldProvider } from '../providers/vietnam-gold.provider';
import { InternationalGoldProvider } from '../providers/international-gold.provider';
import { ForexProvider } from '../providers/forex.provider';
import { GoldGapService } from './gold-gap.service';
import { PrismaService } from '../../../database/prisma.service';
import { generateSeedHistoricalSeries } from '../../../database/seed-data';

@Injectable()
export class MarketDataService {
  private readonly logger = new Logger(MarketDataService.name);

  constructor(
    private readonly vnGoldProvider: VietnamGoldProvider,
    private readonly intlGoldProvider: InternationalGoldProvider,
    private readonly forexProvider: ForexProvider,
    private readonly goldGapService: GoldGapService,
    private readonly prisma: PrismaService
  ) {}

  async getLatestPrices(): Promise<PriceSnapshot[]> {
    try {
      const [vnPrices, intlPrices, fxPrices] = await Promise.all([
        this.vnGoldProvider.fetchLatestPrices(),
        this.intlGoldProvider.fetchLatestPrices(),
        this.forexProvider.fetchLatestPrices()
      ]);

      return [...vnPrices, ...intlPrices, ...fxPrices];
    } catch (err) {
      this.logger.error('Failed to fetch from providers, using fallback fixtures', err);
      return [];
    }
  }

  async getGoldGap(): Promise<GoldGapAnalysis> {
    const prices = await this.getLatestPrices();
    return this.goldGapService.getLatestGapFromPrices(prices);
  }

  async getHistoricalSeries(assetCode: AssetCode = 'XAU_USD'): Promise<PriceCandle[]> {
    if (assetCode === 'XAU_USD') {
      const candles = await this.intlGoldProvider.fetchHistoricalCandles?.('XAU_USD');
      return candles || [];
    }
    const { sjcSeries } = generateSeedHistoricalSeries();
    return sjcSeries;
  }

  getAssetsList() {
    return Object.values(ASSET_DEFINITIONS);
  }
}
