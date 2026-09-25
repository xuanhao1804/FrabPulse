import { Injectable, Logger } from '@nestjs/common';
import { AssetCode, PriceSnapshot, PriceCandle } from '@frabpulse/shared';
import { IMarketDataProvider } from '../interfaces/market-data-provider.interface';
import { LATEST_SEED_PRICES, generateSeedHistoricalSeries } from '../../../database/seed-data';

@Injectable()
export class InternationalGoldProvider implements IMarketDataProvider {
  private readonly logger = new Logger(InternationalGoldProvider.name);
  readonly providerCode = 'KITCO_GLOBAL';
  readonly supportedAssets: AssetCode[] = ['XAU_USD'];

  async fetchLatestPrices(): Promise<PriceSnapshot[]> {
    this.logger.debug('Fetching international spot gold XAU/USD...');
    const now = new Date().toISOString();
    return LATEST_SEED_PRICES.filter((p) => p.assetCode === 'XAU_USD').map((p) => ({
      ...p,
      timestamp: now
    }));
  }

  async fetchHistoricalCandles(assetCode: AssetCode): Promise<PriceCandle[]> {
    if (assetCode !== 'XAU_USD') return [];
    const { xauSeries } = generateSeedHistoricalSeries();
    return xauSeries;
  }
}
