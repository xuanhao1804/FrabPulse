import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VietnamGoldProvider } from '../src/modules/market-data/providers/vietnam-gold.provider';
import { InternationalGoldProvider } from '../src/modules/market-data/providers/international-gold.provider';
import { ForexProvider } from '../src/modules/market-data/providers/forex.provider';
import { GoldGapService } from '../src/modules/market-data/services/gold-gap.service';
import { MarketDataService } from '../src/modules/market-data/services/market-data.service';

describe('Market Data Providers & Resilience (Milestone V1.5)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('VietnamGoldProvider', () => {
    it('should map live API response accurately to SJC, DOJI, and PNJ snapshots', async () => {
      const mockVangToday = {
        success: true,
        timestamp: 1790371800,
        date: '2026-09-26',
        time: '13:00',
        prices: {
          SJL1L10: { name: 'SJC 9999', buy: 141400000, sell: 144400000, change_sell: 500000, currency: 'VND' },
          DOHCML: { name: 'DOJI HCM', buy: 141300000, sell: 144300000, change_sell: 400000, currency: 'VND' },
          PQHN24NTT: { name: 'PNJ 24K', buy: 141200000, sell: 144200000, change_sell: 300000, currency: 'VND' }
        }
      };

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => mockVangToday
      } as Response);

      const provider = new VietnamGoldProvider();
      const snapshots = await provider.fetchLatestPrices();

      expect(snapshots).toHaveLength(3);
      const sjc = snapshots.find((s) => s.assetCode === 'SJC_VN')!;
      expect(sjc.buyPrice).toBe(141400000);
      expect(sjc.sellPrice).toBe(144400000);
      expect(sjc.spread).toBe(3000000);
      expect(sjc.sourceType).toBe('LIVE_FEED');
      expect(sjc.isDemo).toBe(false);

      const doji = snapshots.find((s) => s.assetCode === 'DOJI_VN')!;
      expect(doji.sellPrice).toBe(144300000);
      expect(doji.sourceType).toBe('LIVE_FEED');
    });

    it('should gracefully fall back to cached data or seed fixtures on network error', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network offline or DNS error'));

      const provider = new VietnamGoldProvider();
      const snapshots = await provider.fetchLatestPrices();

      expect(snapshots.length).toBeGreaterThanOrEqual(1);
      const sjc = snapshots.find((s) => s.assetCode === 'SJC_VN')!;
      expect(sjc.sourceType).toBe('FALLBACK');
      expect(sjc.isDemo).toBe(true);
      expect(sjc.sellPrice).toBeGreaterThan(0);
    });
  });

  describe('InternationalGoldProvider', () => {
    it('should parse spot gold accurately from remote feeds', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          prices: {
            XAUUSD: { name: 'World Gold', buy: 4286.20, currency: 'USD', change_buy: 12.5 }
          }
        })
      } as Response);

      const provider = new InternationalGoldProvider();
      const snapshots = await provider.fetchLatestPrices();

      expect(snapshots).toHaveLength(1);
      const xau = snapshots[0];
      expect(xau.assetCode).toBe('XAU_USD');
      expect(xau.buyPrice).toBe(4286.20);
      expect(xau.sellPrice).toBe(4286.70);
      expect(xau.sourceType).toBe('LIVE_FEED');
      expect(xau.currency).toBe('USD');
    });
  });

  describe('ForexProvider', () => {
    it('should parse live USD/VND rate from open exchange API', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          result: 'success',
          rates: { VND: 25965.70 }
        })
      } as Response);

      const provider = new ForexProvider();
      const snapshots = await provider.fetchLatestPrices();

      expect(snapshots).toHaveLength(1);
      const usdvnd = snapshots[0];
      expect(usdvnd.assetCode).toBe('USD_VND');
      expect(usdvnd.buyPrice).toBe(25916);
      expect(usdvnd.sellPrice).toBe(26016);
      expect(usdvnd.sourceType).toBe('LIVE_FEED');
    });
  });

  describe('GoldGapService', () => {
    it('should compute Vietnam vs. World gold gap dynamically with provenance', () => {
      const service = new GoldGapService();
      const gap = service.calculateGap(4286.20, 25965.70, 144400000, false);

      // Formula: 4286.20 * 25965.70 * 1.20565
      const expectedWorld = 4286.20 * 25965.70 * 1.20565;
      expect(gap.worldPriceVndPerTael).toBeCloseTo(expectedWorld, 0);
      expect(gap.domesticPriceVndPerTael).toBe(144400000);
      expect(gap.gapVnd).toBeCloseTo(144400000 - expectedWorld, 0);
      expect(gap.conversionFactor).toBe(1.20565);
      expect(gap.isDemo).toBe(false);
    });
  });

  describe('MarketDataService Health Status', () => {
    it('should report HEALTHY when all providers are live', async () => {
      const mockVnProvider = {
        fetchLatestPrices: vi.fn().mockResolvedValue([
          { assetCode: 'SJC_VN', sellPrice: 144400000, sourceType: 'LIVE_FEED', providerCode: 'SJC_LIVE' }
        ])
      } as unknown as VietnamGoldProvider;

      const mockIntlProvider = {
        fetchLatestPrices: vi.fn().mockResolvedValue([
          { assetCode: 'XAU_USD', sellPrice: 4286.70, sourceType: 'LIVE_FEED', providerCode: 'WORLD_SPOT_XAU' }
        ])
      } as unknown as InternationalGoldProvider;

      const mockFxProvider = {
        fetchLatestPrices: vi.fn().mockResolvedValue([
          { assetCode: 'USD_VND', sellPrice: 26016, sourceType: 'LIVE_FEED', providerCode: 'OPEN_EXCHANGE_FX' }
        ])
      } as unknown as ForexProvider;

      const mockPrisma = {
        priceSnapshot: { create: vi.fn() }
      } as any;

      const service = new MarketDataService(
        mockVnProvider,
        mockIntlProvider,
        mockFxProvider,
        new GoldGapService(),
        mockPrisma
      );

      const health = await service.getMarketHealth();
      expect(health.status).toBe('HEALTHY');
      expect(health.liveAssetCount).toBe(3);
      expect(health.totalAssetCount).toBe(3);
      expect(health.activeSources).toContain('SJC_LIVE');
      expect(health.activeSources).toContain('WORLD_SPOT_XAU');
      expect(health.activeSources).toContain('OPEN_EXCHANGE_FX');
    });
  });
});
