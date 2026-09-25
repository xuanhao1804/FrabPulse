import { Injectable, Logger } from '@nestjs/common';
import { GoldGapAnalysis, calculateGoldGap } from '@frabpulse/shared';
import { LATEST_SEED_PRICES } from '../../../database/seed-data';

@Injectable()
export class GoldGapService {
  private readonly logger = new Logger(GoldGapService.name);

  calculateGap(
    xauUsd: number,
    usdVnd: number,
    domesticSellPriceVnd: number,
    isDemo = true
  ): GoldGapAnalysis {
    return calculateGoldGap(xauUsd, usdVnd, domesticSellPriceVnd, isDemo);
  }

  getLatestGapFromPrices(prices: { assetCode: string; sellPrice: number }[]): GoldGapAnalysis {
    const xau = prices.find((p) => p.assetCode === 'XAU_USD')?.sellPrice || 2663.40;
    const usdVnd = prices.find((p) => p.assetCode === 'USD_VND')?.sellPrice || 25440;
    const sjc = prices.find((p) => p.assetCode === 'SJC_VN')?.sellPrice || 89_500_000;

    return this.calculateGap(xau, usdVnd, sjc, true);
  }
}
