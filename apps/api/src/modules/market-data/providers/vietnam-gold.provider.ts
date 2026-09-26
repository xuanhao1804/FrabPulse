import { Injectable, Logger } from '@nestjs/common';
import { AssetCode, PriceSnapshot, ProviderDataSource } from '@frabpulse/shared';
import { IMarketDataProvider } from '../interfaces/market-data-provider.interface';
import { LATEST_SEED_PRICES } from '../../../database/seed-data';

import { CircuitBreaker } from '../../../common/circuit-breaker';

interface VangTodayItem {
  name: string;
  buy: number;
  sell: number;
  change_buy?: number;
  change_sell?: number;
  currency: string;
}

interface VangTodayResponse {
  success: boolean;
  timestamp: number;
  date: string;
  time: string;
  prices?: Record<string, VangTodayItem>;
}

@Injectable()
export class VietnamGoldProvider implements IMarketDataProvider {
  private readonly logger = new Logger(VietnamGoldProvider.name);
  readonly providerCode = 'VIETNAM_DOMESTIC_LIVE';
  readonly supportedAssets: AssetCode[] = ['SJC_VN', 'DOJI_VN', 'PNJ_VN'];

  private readonly breaker = new CircuitBreaker({
    name: 'VangTodayDomestic',
    failureThreshold: 3,
    resetTimeoutMs: 300_000
  });

  private cachedPrices: Map<AssetCode, PriceSnapshot> = new Map();
  private lastFetchedAt: string | null = null;

  getCircuitBreaker(): CircuitBreaker {
    return this.breaker;
  }

  async fetchLatestPrices(): Promise<PriceSnapshot[]> {
    try {
      const livePrices = await this.breaker.execute(
        () => this.fetchFromLiveApi(),
        () => []
      );
      if (livePrices.length > 0) {
        livePrices.forEach((p) => this.cachedPrices.set(p.assetCode, p));
        this.lastFetchedAt = new Date().toISOString();
        return livePrices;
      }
    } catch (err: any) {
      this.logger.warn(`Failed to fetch live Vietnam gold quotes: ${err.message}. Engaging fallback.`);
    }

    // Return cached if available
    if (this.cachedPrices.size > 0) {
      return Array.from(this.cachedPrices.values()).map((p) => ({
        ...p,
        sourceType: 'CACHED' as ProviderDataSource
      }));
    }

    // Otherwise return deterministic seed fixtures marked as fallback
    const now = new Date().toISOString();
    return LATEST_SEED_PRICES.filter((p) => this.supportedAssets.includes(p.assetCode)).map((p) => ({
      ...p,
      timestamp: now,
      sourceType: 'FALLBACK' as ProviderDataSource,
      isDemo: true
    }));
  }

  private async fetchFromLiveApi(): Promise<PriceSnapshot[]> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    try {
      const response = await fetch('https://www.vang.today/api/prices', {
        headers: {
          'User-Agent': 'FrabPulse-Intelligence/1.0 (Research; Event-Market Correlation)',
          'Accept': 'application/json'
        },
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = (await response.json()) as VangTodayResponse;
      if (!data.success || !data.prices) {
        throw new Error('Malformed response from gold provider');
      }

      const now = new Date().toISOString();
      const snapshots: PriceSnapshot[] = [];

      // SJC 9999 (SJL1L10 or SJ9999)
      const sjc = data.prices['SJL1L10'] || data.prices['SJ9999'];
      if (sjc && sjc.sell > 0) {
        snapshots.push({
          assetCode: 'SJC_VN',
          providerCode: 'SJC_OFFICIAL',
          buyPrice: sjc.buy,
          sellPrice: sjc.sell,
          spread: sjc.sell - sjc.buy,
          currency: 'VND',
          timestamp: now,
          change24hAbsolute: sjc.change_sell || 0,
          change24hPercent: sjc.sell > 0 && sjc.change_sell ? (sjc.change_sell / sjc.sell) * 100 : 0,
          isDemo: false,
          sourceType: 'LIVE_FEED',
          lastFetchedAt: now
        });
      }

      // DOJI (DOHCML or DOHNL or DOJINHTV)
      const doji = data.prices['DOHCML'] || data.prices['DOHNL'] || data.prices['DOJINHTV'];
      if (doji && doji.sell > 0) {
        snapshots.push({
          assetCode: 'DOJI_VN',
          providerCode: 'DOJI_RETAIL',
          buyPrice: doji.buy,
          sellPrice: doji.sell,
          spread: doji.sell - doji.buy,
          currency: 'VND',
          timestamp: now,
          change24hAbsolute: doji.change_sell || 0,
          change24hPercent: doji.sell > 0 && doji.change_sell ? (doji.change_sell / doji.sell) * 100 : 0,
          isDemo: false,
          sourceType: 'LIVE_FEED',
          lastFetchedAt: now
        });
      }

      // PNJ (PQHN24NTT or PQHNVM)
      const pnj = data.prices['PQHN24NTT'] || data.prices['PQHNVM'];
      if (pnj && pnj.sell > 0) {
        snapshots.push({
          assetCode: 'PNJ_VN',
          providerCode: 'PNJ_JEWELRY',
          buyPrice: pnj.buy,
          sellPrice: pnj.sell,
          spread: pnj.sell - pnj.buy,
          currency: 'VND',
          timestamp: now,
          change24hAbsolute: pnj.change_sell || 0,
          change24hPercent: pnj.sell > 0 && pnj.change_sell ? (pnj.change_sell / pnj.sell) * 100 : 0,
          isDemo: false,
          sourceType: 'LIVE_FEED',
          lastFetchedAt: now
        });
      }

      return snapshots;
    } finally {
      clearTimeout(timeout);
    }
  }
}
