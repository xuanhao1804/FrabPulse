import { Injectable, Logger } from '@nestjs/common';
import { AssetCode, PriceSnapshot, PriceCandle, ProviderDataSource } from '@frabpulse/shared';
import { IMarketDataProvider } from '../interfaces/market-data-provider.interface';
import { LATEST_SEED_PRICES, generateSeedHistoricalSeries } from '../../../database/seed-data';

import { CircuitBreaker } from '../../../common/circuit-breaker';

@Injectable()
export class InternationalGoldProvider implements IMarketDataProvider {
  private readonly logger = new Logger(InternationalGoldProvider.name);
  readonly providerCode = 'XAU_GLOBAL_FEED';
  readonly supportedAssets: AssetCode[] = ['XAU_USD'];

  private readonly breaker = new CircuitBreaker({
    name: 'InternationalSpotGold',
    failureThreshold: 3,
    resetTimeoutMs: 300_000
  });

  private cachedSnapshot: PriceSnapshot | null = null;

  getCircuitBreaker(): CircuitBreaker {
    return this.breaker;
  }

  async fetchLatestPrices(): Promise<PriceSnapshot[]> {
    try {
      const price = await this.breaker.execute(
        () => this.fetchLivePrice(),
        () => null
      );
      if (price) {
        this.cachedSnapshot = price;
        return [price];
      }
    } catch (err: any) {
      this.logger.warn(`Failed to fetch live international gold spot: ${err.message}. Engaging fallback.`);
    }

    if (this.cachedSnapshot) {
      return [{
        ...this.cachedSnapshot,
        sourceType: 'CACHED' as ProviderDataSource
      }];
    }

    const now = new Date().toISOString();
    return LATEST_SEED_PRICES.filter((p) => p.assetCode === 'XAU_USD').map((p) => ({
      ...p,
      timestamp: now,
      sourceType: 'FALLBACK' as ProviderDataSource,
      isDemo: true
    }));
  }

  async fetchHistoricalCandles(assetCode: AssetCode): Promise<PriceCandle[]> {
    if (assetCode !== 'XAU_USD') return [];
    const { xauSeries } = generateSeedHistoricalSeries();
    return xauSeries;
  }

  private async fetchLivePrice(): Promise<PriceSnapshot | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    try {
      // First attempt: VangToday XAUUSD
      const resp = await fetch('https://www.vang.today/api/prices', {
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });

      if (resp.ok) {
        const data = (await resp.json()) as any;
        const xau = data.prices?.['XAUUSD'];
        if (xau && xau.buy > 0) {
          const now = new Date().toISOString();
          const spot = xau.buy;
          const spread = 0.50; // typical institutional spot spread ~50 cents
          return {
            assetCode: 'XAU_USD',
            providerCode: 'WORLD_SPOT_XAU',
            buyPrice: spot,
            sellPrice: spot + spread,
            spread,
            currency: 'USD',
            timestamp: now,
            change24hAbsolute: xau.change_buy || 0,
            change24hPercent: spot > 0 && xau.change_buy ? (xau.change_buy / spot) * 100 : 0,
            isDemo: false,
            sourceType: 'LIVE_FEED',
            lastFetchedAt: now
          };
        }
      }
    } catch {
      // Fall through to Yahoo Finance fallback
    } finally {
      clearTimeout(timeout);
    }

    // Second attempt: Yahoo Finance GC=F
    const yController = new AbortController();
    const yTimeout = setTimeout(() => yController.abort(), 4000);
    try {
      const yResp = await fetch(
        'https://query1.finance.yahoo.com/v8/finance/chart/GC=F?interval=1d&range=1d',
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          signal: yController.signal
        }
      );

      if (yResp.ok) {
        const yData = (await yResp.json()) as any;
        const meta = yData.chart?.result?.[0]?.meta;
        if (meta && meta.regularMarketPrice > 0) {
          const now = new Date().toISOString();
          const price = meta.regularMarketPrice;
          return {
            assetCode: 'XAU_USD',
            providerCode: 'COMEX_GOLD_FUTURES',
            buyPrice: price,
            sellPrice: price + 0.5,
            spread: 0.5,
            currency: 'USD',
            timestamp: now,
            change24hAbsolute: meta.fulldayChange || 0,
            change24hPercent: meta.regularMarketChangePercent || 0,
            isDemo: false,
            sourceType: 'LIVE_FEED',
            lastFetchedAt: now
          };
        }
      }
    } catch (err: any) {
      this.logger.debug(`Yahoo Finance gold attempt failed: ${err.message}`);
    } finally {
      clearTimeout(yTimeout);
    }

    throw new Error('All international gold feeds failed to return valid price data');
  }
}
