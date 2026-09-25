import { Injectable, Logger } from '@nestjs/common';
import { AssetCode, AssetMovementCorrelation, ASSET_DEFINITIONS } from '@frabpulse/shared';

@Injectable()
export class CorrelationEngineService {
  private readonly logger = new Logger(CorrelationEngineService.name);

  /**
   * Measures empirical price movement around an event's timestamp.
   * STRICT PRINCIPLE: Never claims causation, only reports observed mathematical change.
   */
  measureCorrelation(
    assetCode: AssetCode,
    priceBefore: number,
    priceAfter: number,
    happenedAt: Date,
    windowMinutes = 30
  ): AssetMovementCorrelation {
    const deltaAbsolute = Number((priceAfter - priceBefore).toFixed(2));
    const deltaPercent = Number(((deltaAbsolute / priceBefore) * 100).toFixed(2));
    const assetMeta = ASSET_DEFINITIONS[assetCode];

    const measuredFrom = new Date(happenedAt.getTime() - (windowMinutes / 2) * 60 * 1000).toISOString();
    const measuredTo = new Date(happenedAt.getTime() + (windowMinutes / 2) * 60 * 1000).toISOString();

    const isStatisticallySignificant = Math.abs(deltaPercent) >= 0.25;

    const correlationCaveat = `Empirical observation over a ${windowMinutes}-minute temporal window. This indicates associated movement, not unilateral single-factor causation.`;

    return {
      assetCode,
      assetName: assetMeta ? assetMeta.name : assetCode,
      priceBefore,
      priceAfter,
      deltaAbsolute,
      deltaPercent,
      windowMinutes,
      measuredFrom,
      measuredTo,
      isStatisticallySignificant,
      correlationCaveat
    };
  }
}
