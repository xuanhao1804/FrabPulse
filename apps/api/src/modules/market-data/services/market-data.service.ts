import { Injectable, Logger } from '@nestjs/common';
import {
  AssetCode,
  PriceSnapshot,
  PriceCandle,
  GoldGapAnalysis,
  MarketHealthStatus,
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
  private cachedPrices: PriceSnapshot[] = [];
  private lastSyncTime: string = new Date().toISOString();

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

      const combined = [...vnPrices, ...intlPrices, ...fxPrices];
      if (combined.length > 0) {
        this.cachedPrices = combined;
        this.lastSyncTime = new Date().toISOString();
        this.persistSnapshotsAsync(combined).catch(() => {});
      }

      return combined;
    } catch (err: any) {
      this.logger.error('Failed to fetch from providers, using cached memory state', err.message);
      return this.cachedPrices;
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

  async getMarketHealth(): Promise<MarketHealthStatus> {
    const prices = this.cachedPrices.length > 0 ? this.cachedPrices : await this.getLatestPrices();
    const liveCount = prices.filter((p) => p.sourceType === 'LIVE_FEED').length;
    const totalCount = prices.length;
    const activeSources = Array.from(new Set(prices.map((p) => p.providerCode)));

    let status: 'HEALTHY' | 'DEGRADED' | 'OFFLINE' = 'HEALTHY';
    if (liveCount === 0) {
      status = prices.some((p) => p.sourceType === 'CACHED') ? 'DEGRADED' : 'OFFLINE';
    } else if (liveCount < totalCount) {
      status = 'DEGRADED';
    }

    return {
      status,
      lastSync: this.lastSyncTime,
      liveAssetCount: liveCount,
      totalAssetCount: totalCount,
      activeSources
    };
  }

  private async persistSnapshotsAsync(snapshots: PriceSnapshot[]): Promise<void> {
    try {
      // If PostgreSQL database is reachable via Prisma, record the latest ticks
      for (const snap of snapshots) {
        const asset = await this.prisma.asset.findUnique({ where: { code: snap.assetCode } });
        const provider = await this.prisma.marketProvider.findUnique({ where: { code: snap.providerCode } });
        if (asset && provider) {
          await this.prisma.priceSnapshot.create({
            data: {
              assetId: asset.id,
              providerId: provider.id,
              buyPrice: snap.buyPrice,
              sellPrice: snap.sellPrice,
              spread: snap.spread,
              currency: snap.currency,
              timestamp: new Date(snap.timestamp),
              isDemo: snap.isDemo
            }
          });
        }
      }
    } catch {
      // Prisma offline: graceful no-op, application functions entirely in-memory
    }
  }
}
