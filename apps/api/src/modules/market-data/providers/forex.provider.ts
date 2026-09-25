import { Injectable, Logger } from '@nestjs/common';
import { AssetCode, PriceSnapshot } from '@frabpulse/shared';
import { IMarketDataProvider } from '../interfaces/market-data-provider.interface';
import { LATEST_SEED_PRICES } from '../../../database/seed-data';

@Injectable()
export class ForexProvider implements IMarketDataProvider {
  private readonly logger = new Logger(ForexProvider.name);
  readonly providerCode = 'SBV_COMMERCIAL_RATE';
  readonly supportedAssets: AssetCode[] = ['USD_VND'];

  async fetchLatestPrices(): Promise<PriceSnapshot[]> {
    this.logger.debug('Fetching USD/VND exchange rate...');
    const now = new Date().toISOString();
    return LATEST_SEED_PRICES.filter((p) => p.assetCode === 'USD_VND').map((p) => ({
      ...p,
      timestamp: now
    }));
  }
}
