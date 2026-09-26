import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Subject, Observable, interval, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { PulseSseMessage, PriceSnapshot, GoldGapAnalysis, MarketEvent } from '@frabpulse/shared';
import { MarketDataScheduler } from '../../market-data/services/market-data.scheduler';

@Injectable()
export class SseBroadcasterService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SseBroadcasterService.name);
  private readonly stream$ = new Subject<PulseSseMessage<unknown>>();
  private heartbeatSub?: Subscription;
  private tickSub?: Subscription;
  private gapSub?: Subscription;

  constructor(private readonly marketDataScheduler: MarketDataScheduler) {}

  onModuleInit() {
    this.logger.log('Initializing Real-time SSE Pulse broadcaster connected to MarketDataScheduler...');

    // Broadcast genuine price ticks only when delta != 0
    this.tickSub = this.marketDataScheduler.getPriceTicks().subscribe((tick) => {
      this.broadcast('PRICE_TICK', tick);
    });

    // Broadcast gap updates when spread changes
    this.gapSub = this.marketDataScheduler.getGapUpdates().subscribe((gap) => {
      this.broadcast('GAP_UPDATE', gap);
    });

    // Keep SSE connections alive with periodic heartbeat
    this.heartbeatSub = interval(15000).subscribe(() => {
      this.broadcast('HEARTBEAT', {
        serverTime: new Date().toISOString(),
        status: 'SYNCHRONIZED'
      });
    });
  }

  onModuleDestroy() {
    this.tickSub?.unsubscribe();
    this.gapSub?.unsubscribe();
    this.heartbeatSub?.unsubscribe();
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
