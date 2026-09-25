import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Subject, Observable, interval, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { PulseSseMessage, PriceSnapshot, GoldGapAnalysis, MarketEvent } from '@frabpulse/shared';
import { MarketDataService } from '../../market-data/services/market-data.service';

@Injectable()
export class SseBroadcasterService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SseBroadcasterService.name);
  private readonly stream$ = new Subject<PulseSseMessage<unknown>>();
  private tickerSub?: Subscription;

  constructor(private readonly marketDataService: MarketDataService) {}

  onModuleInit() {
    this.logger.log('Initializing Real-time SSE Pulse broadcaster...');

    // Broadcast a simulated price tick and heartbeat every 15 seconds to keep connections alive
    this.tickerSub = interval(15000).subscribe(async () => {
      try {
        const prices = await this.marketDataService.getLatestPrices();
        const gap = await this.marketDataService.getGoldGap();

        // Broadcast latest price tick
        const xau = prices.find((p) => p.assetCode === 'XAU_USD');
        if (xau) {
          // Add small live market jitter (+- 0.30$) to demonstrate real-time pulse
          const jitter = Number(((Math.random() - 0.49) * 0.6).toFixed(2));
          const liveXau: PriceSnapshot = {
            ...xau,
            buyPrice: Number((xau.buyPrice + jitter).toFixed(2)),
            sellPrice: Number((xau.sellPrice + jitter).toFixed(2)),
            timestamp: new Date().toISOString()
          };
          this.broadcast('PRICE_TICK', liveXau);
        }

        // Broadcast gap update
        this.broadcast('GAP_UPDATE', gap);

        // Heartbeat
        this.broadcast('HEARTBEAT', {
          serverTime: new Date().toISOString(),
          status: 'SYNCHRONIZED'
        });
      } catch (err) {
        this.logger.error('Error emitting live SSE heartbeat/ticks', err);
      }
    });
  }

  onModuleDestroy() {
    this.tickerSub?.unsubscribe();
  }

  broadcast<T>(type: PulseSseMessage['type'], payload: T) {
    this.stream$.next({
      type,
      payload,
      timestamp: new Date().toISOString()
    });
  }

  getStream(): Observable<{ data: PulseSseMessage<unknown> }> {
    return this.stream$.asObservable().pipe(
      map((message) => ({
        data: message
      }))
    );
  }
}
