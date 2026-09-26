import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CircuitBreaker } from '../src/common/circuit-breaker';
import { MarketDataScheduler } from '../src/modules/market-data/services/market-data.scheduler';
import { PriceSnapshot } from '@frabpulse/shared';

describe('CircuitBreaker Engine', () => {
  it('initializes in CLOSED state with 0 failures', () => {
    const breaker = new CircuitBreaker({ name: 'TestService', failureThreshold: 3, resetTimeoutMs: 1000 });
    expect(breaker.getState()).toBe('CLOSED');
    const stats = breaker.getStats();
    expect(stats.failureCount).toBe(0);
    expect(stats.state).toBe('CLOSED');
  });

  it('stays CLOSED on successful operations', async () => {
    const breaker = new CircuitBreaker({ name: 'TestService', failureThreshold: 3, resetTimeoutMs: 1000 });
    const result = await breaker.execute(async () => 'OK', () => 'FALLBACK');
    expect(result).toBe('OK');
    expect(breaker.getState()).toBe('CLOSED');
  });

  it('trips to OPEN after reaching failureThreshold (3 failures)', async () => {
    const breaker = new CircuitBreaker({ name: 'TestService', failureThreshold: 3, resetTimeoutMs: 1000 });

    const failingAction = async () => {
      throw new Error('Network Timeout');
    };

    // Failure 1
    await breaker.execute(failingAction, () => 'FALLBACK_1');
    expect(breaker.getState()).toBe('CLOSED');
    expect(breaker.getStats().failureCount).toBe(1);

    // Failure 2
    await breaker.execute(failingAction, () => 'FALLBACK_2');
    expect(breaker.getState()).toBe('CLOSED');
    expect(breaker.getStats().failureCount).toBe(2);

    // Failure 3 -> Trips to OPEN
    await breaker.execute(failingAction, () => 'FALLBACK_3');
    expect(breaker.getState()).toBe('OPEN');
    expect(breaker.getStats().failureCount).toBe(3);

    // 4th call fast-fails without executing primary action
    const mockAction = vi.fn().mockResolvedValue('SHOULD_NOT_RUN');
    const fallbackRes = await breaker.execute(mockAction, () => 'FAST_FALLBACK');
    expect(fallbackRes).toBe('FAST_FALLBACK');
    expect(mockAction).not.toHaveBeenCalled();
  });

  it('transitions to HALF_OPEN after timeout and resets to CLOSED on probe success', async () => {
    const resetTimeoutMs = 100;
    const breaker = new CircuitBreaker({ name: 'TestService', failureThreshold: 2, resetTimeoutMs });

    // Fail 2 times to trip
    for (let i = 0; i < 2; i++) {
      await breaker.execute(async () => { throw new Error('Err'); }, () => 'FALLBACK');
    }
    expect(breaker.getState()).toBe('OPEN');

    // Wait for timeout to expire
    await new Promise((res) => setTimeout(res, 120));

    // Next getState or execute should be HALF_OPEN
    expect(breaker.getState()).toBe('HALF_OPEN');

    // Probe succeeds -> transitions to CLOSED
    const result = await breaker.execute(async () => 'PROBE_SUCCESS');
    expect(result).toBe('PROBE_SUCCESS');
    expect(breaker.getState()).toBe('CLOSED');
    expect(breaker.getStats().failureCount).toBe(0);
  });
});

describe('MarketDataScheduler & Trading Hours Detection', () => {
  let scheduler: MarketDataScheduler;
  let mockMarketDataService: any;
  let mockGoldGapService: any;

  beforeEach(() => {
    mockMarketDataService = {
      getLatestPrices: vi.fn()
    };
    mockGoldGapService = {
      getLatestGapFromPrices: vi.fn().mockReturnValue({
        worldPriceVndPerTael: 72000000,
        domesticPriceVndPerTael: 90000000,
        gapVnd: 18000000,
        gapPercent: 25.0,
        xauUsd: 2850.5,
        usdVnd: 25450,
        conversionFactor: 1.20565,
        timestamp: new Date().toISOString(),
        isDemo: false
      })
    };

    scheduler = new MarketDataScheduler(mockMarketDataService, mockGoldGapService);
  });

  it('correctly calculates Vietnam domestic trading hours (08:00 - 17:00 ICT, Mon-Sat)', () => {
    // Wednesday 10:00 AM ICT (03:00 UTC) -> Open
    const wednesday10amIct = new Date('2026-09-23T03:00:00.000Z');
    expect(scheduler.isDomesticTradingHours(wednesday10amIct)).toBe(true);

    // Wednesday 20:00 PM ICT (13:00 UTC) -> Closed
    const wednesday8pmIct = new Date('2026-09-23T13:00:00.000Z');
    expect(scheduler.isDomesticTradingHours(wednesday8pmIct)).toBe(false);

    // Sunday 10:00 AM ICT (03:00 UTC) -> Closed
    const sunday10amIct = new Date('2026-09-20T03:00:00.000Z');
    expect(scheduler.isDomesticTradingHours(sunday10amIct)).toBe(false);
  });

  it('correctly calculates International spot gold 24/5 hours (closed Friday 21:00 UTC to Sunday 22:00 UTC)', () => {
    // Wednesday 12:00 UTC -> Open
    const wednesdayUtc = new Date('2026-09-23T12:00:00.000Z');
    expect(scheduler.isSpotTradingHours(wednesdayUtc)).toBe(true);

    // Saturday 12:00 UTC -> Closed
    const saturdayUtc = new Date('2026-09-26T12:00:00.000Z');
    expect(scheduler.isSpotTradingHours(saturdayUtc)).toBe(false);

    // Friday 22:00 UTC -> Closed
    const fridayNightUtc = new Date('2026-09-25T22:00:00.000Z');
    expect(scheduler.isSpotTradingHours(fridayNightUtc)).toBe(false);
  });

  it('emits price tick only when price delta != 0, suppressing duplicates', async () => {
    const tick1: PriceSnapshot = {
      assetCode: 'SJC_VN',
      providerCode: 'SJC_OFFICIAL',
      buyPrice: 89000000,
      sellPrice: 91000000,
      spread: 2000000,
      currency: 'VND',
      timestamp: new Date().toISOString(),
      isDemo: false,
      sourceType: 'LIVE_FEED'
    };

    const emittedTicks: PriceSnapshot[] = [];
    scheduler.getPriceTicks().subscribe((t) => emittedTicks.push(t));

    // Cycle 1: First time seeing this price -> Emits tick
    mockMarketDataService.getLatestPrices.mockResolvedValueOnce([tick1]);
    const res1 = await scheduler.pollMarketCycle();
    expect(res1.ticksEmitted).toBe(1);
    expect(emittedTicks.length).toBe(1);
    expect(emittedTicks[0].buyPrice).toBe(89000000);

    // Cycle 2: Same price received -> Suppressed! Zero ticks emitted!
    mockMarketDataService.getLatestPrices.mockResolvedValueOnce([tick1]);
    const res2 = await scheduler.pollMarketCycle();
    expect(res2.ticksEmitted).toBe(0);
    expect(emittedTicks.length).toBe(1); // Still 1

    // Cycle 3: Price moves up to 89.5M -> Delta detected -> Emits new tick!
    const tick3 = { ...tick1, buyPrice: 89500000, sellPrice: 91500000 };
    mockMarketDataService.getLatestPrices.mockResolvedValueOnce([tick3]);
    const res3 = await scheduler.pollMarketCycle();
    expect(res3.ticksEmitted).toBe(1);
    expect(emittedTicks.length).toBe(2);
    expect(emittedTicks[1].buyPrice).toBe(89500000);
  });
});
