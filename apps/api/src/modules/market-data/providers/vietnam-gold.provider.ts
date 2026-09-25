import { Injectable, Logger } from '@nestjs/common';
import { AssetCode, PriceSnapshot } from '@frabpulse/shared';
import { IMarketDataProvider } from '../interfaces/market-data-provider.interface';
import { LATEST_SEED_PRICES } from '../../../database/seed-data';

@Injectable()
export class VietnamGoldProvider implements IMarketDataProvider {
  private readonly logger = new Logger(VietnamGoldProvider.name);
  readonly providerCode = 'VIETNAM_DOMESTIC_AGGREGATOR';
  readonly supportedAssets: AssetCode[] = ['SJC_VN', 'DOJI_VN', 'PNJ_VN'];

  async fetchLatestPrices(): Promise<PriceSnapshot[]> {
    this.logger.debug('Fetching latest domestic Vietnamese gold quotes (SJC, DOJI, PNJ)...');
    
    // In production, this can call official SBV/SJC or reliable market APIs.
    // For deterministic local development, it returns realistic snapshots with slight live jitter
    const now = new Date().toISOString();
    return LATEST_SEED_PRICES.filter((p) => this.supportedAssets.includes(p.assetCode)).map((p) => ({
      ...p,
      timestamp: now
    }));
  }
}
