import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Subject, Observable, Subscription } from 'rxjs';
import { Interval } from '@nestjs/schedule';
import { AssetCode, PriceSnapshot, GoldGapAnalysis } from '@frabpulse/shared';
import { MarketDataService } from './market-data.service';
import { GoldGapService } from './gold-gap.service';

@Injectable()
export class MarketDataScheduler implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MarketDataScheduler.name);

  private readonly priceTickSubject = new Subject<PriceSnapshot>();
  private readonly gapUpdateSubject = new Subject<GoldGapAnalysis>();

  private lastPrices = new Map<AssetCode, { buy: number; sell: number }>();
  private lastGapValue: number | null = null;
  private lastPollTimestamp = 0;
  private isPolling = false;

  constructor(
    private readonly marketDataService: MarketDataService,
    private readonly goldGapService: GoldGapService
  ) {}

  onModuleInit() {
    this.logger.log('MarketDataScheduler initialized. Background ingestion active.');
    // Trigger initial poll asynchronously on startup
    this.pollMarketCycle().catch((err) => {
      this.logger.warn(`Initial market ingestion cycle failed: ${err.message}`);
    });
  }

  onModuleDestroy() {
    this.priceTickSubject.complete();
    this.gapUpdateSubject.complete();
  }

  getPriceTicks(): Observable<PriceSnapshot> {
    return this.priceTickSubject.asObservable();
  }

  getGapUpdates(): Observable<GoldGapAnalysis> {
    return this.gapUpdateSubject.asObservable();
  }

  /**
   * Domestic gold trading hours in Vietnam (ICT = UTC+7):
   * Monday - Saturday: 08:00 - 17:00 ICT.
   */
  isDomesticTradingHours(date = new Date()): boolean {
    const ictDate = new Date(date.getTime() + 7 * 60 * 60 * 1000);
    const day = ictDate.getUTCDay(); // 0: Sun, 1: Mon, ..., 6: Sat
    const hours = ictDate.getUTCHours();
    const minutes = ictDate.getUTCMinutes();
    const totalMinutes = hours * 60 + minutes;

    const isWorkingDay = day >= 1 && day <= 6;
    const isWithinHours = totalMinutes >= 8 * 60 && totalMinutes < 17 * 60;

    return isWorkingDay && isWithinHours;
  }

  /**
   * International spot gold (XAU/USD) 24/5 market hours:
   * Open: Sunday 22:00 UTC -> Friday 21:00 UTC.
   * Closed: Friday 21:00 UTC -> Sunday 22:00 UTC.
   */
  isSpotTradingHours(date = new Date()): boolean {
    const day = date.getUTCDay(); // 0: Sun, 5: Fri, 6: Sat
    const hours = date.getUTCHours();

    if (day === 5 && hours >= 21) return false; // Closed Friday evening UTC
    if (day === 6) return false;                // Closed all Saturday UTC
    if (day === 0 && hours < 22) return false;  // Closed Sunday before 22:00 UTC

    return true;
  }

  /**
   * Evaluates if any asset market is currently active.
   */
  isTradingHours(date = new Date()): boolean {
    return this.isDomesticTradingHours(date) || this.isSpotTradingHours(date);
  }

  /**
   * Main background ingestion runner.
   * Runs every 60 seconds.
   * If in trading hours: polls every cycle (60s).
   * If in off-hours: polls every 15 minutes (900,000ms).
   */
  @Interval(60_000)
  async handleScheduledPoll(): Promise<void> {
    const now = Date.now();
    const activeHours = this.isTradingHours();

    if (!activeHours) {
      const elapsedSinceLastPoll = now - this.lastPollTimestamp;
      const offHoursIntervalMs = 15 * 60 * 1000;
      if (this.lastPollTimestamp > 0 && elapsedSinceLastPoll < offHoursIntervalMs) {
        this.logger.debug(
          `Market is closed (off-hours). Next poll in ${Math.round((offHoursIntervalMs - elapsedSinceLastPoll) / 1000)}s.`
        );
        return;
      }
    }

    await this.pollMarketCycle();
  }

  /**
   * Ingestion cycle: fetches live quotes, calculates delta, emits SSE events if delta != 0.
   */
  async pollMarketCycle(): Promise<{ ticksEmitted: number; gapEmitted: boolean }> {
    if (this.isPolling) {
      this.logger.debug('Ingestion cycle already in progress, skipping concurrent run.');
      return { ticksEmitted: 0, gapEmitted: false };
    }

    this.isPolling = true;
    this.lastPollTimestamp = Date.now();
    let ticksEmitted = 0;
    let gapEmitted = false;

    try {
      const snapshots = await this.marketDataService.getLatestPrices();

      for (const snap of snapshots) {
        const last = this.lastPrices.get(snap.assetCode);
        const hasDelta = !last || last.buy !== snap.buyPrice || last.sell !== snap.sellPrice;

        if (hasDelta) {
          this.lastPrices.set(snap.assetCode, { buy: snap.buyPrice, sell: snap.sellPrice });
          this.priceTickSubject.next(snap);
          ticksEmitted++;
          this.logger.log(
            `[PriceDelta] ${snap.assetCode}: Buy ${snap.buyPrice} / Sell ${snap.sellPrice} (${snap.sourceType})`
          );
        }
      }

      if (ticksEmitted > 0) {
        // Re-evaluate gold gap and emit if gap has changed
        const gap = this.goldGapService.getLatestGapFromPrices(snapshots);
        if (this.lastGapValue === null || Math.abs(gap.gapVnd - this.lastGapValue) > 1000) {
          this.lastGapValue = gap.gapVnd;
          this.gapUpdateSubject.next(gap);
          gapEmitted = true;
          this.logger.log(
            `[GapDelta] SJC vs World Spread: ${(gap.gapVnd / 1_000_000).toFixed(2)}M VND/tael (${gap.gapPercent.toFixed(2)}%)`
          );
        }
      }
    } catch (err: any) {
      this.logger.error(`Error in scheduled market ingestion cycle: ${err.message}`);
    } finally {
      this.isPolling = false;
    }

    return { ticksEmitted, gapEmitted };
  }

  // Diagnostic helpers for testing
  getLastPollTimestamp(): number {
    return this.lastPollTimestamp;
  }

  clearPriceCache(): void {
    this.lastPrices.clear();
    this.lastGapValue = null;
  }
}
