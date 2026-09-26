import { Injectable, Logger } from '@nestjs/common';
import { GoldGapAnalysis, PriceSnapshot, ProviderDataSource, calculateGoldGap } from '@frabpulse/shared';

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

  getLatestGapFromPrices(prices: PriceSnapshot[]): GoldGapAnalysis {
    const xauObj = prices.find((p) => p.assetCode === 'XAU_USD');
    const usdVndObj = prices.find((p) => p.assetCode === 'USD_VND');
    const sjcObj = prices.find((p) => p.assetCode === 'SJC_VN');

    const xau = xauObj?.sellPrice || 2663.40;
    const usdVnd = usdVndObj?.sellPrice || 25440;
    const sjc = sjcObj?.sellPrice || 89_500_000;

    const isAnyDemo = Boolean(xauObj?.isDemo || usdVndObj?.isDemo || sjcObj?.isDemo);
    const hasLive = xauObj?.sourceType === 'LIVE_FEED' && sjcObj?.sourceType === 'LIVE_FEED';

    const gap = this.calculateGap(xau, usdVnd, sjc, isAnyDemo);
    const sourceType: ProviderDataSource = hasLive ? 'LIVE_FEED' : (isAnyDemo ? 'FALLBACK' : 'CACHED');

    return {
      ...gap,
      sourceType
    };
  }
}
