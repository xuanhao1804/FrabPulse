import { PriceSnapshot, PriceCandle, AssetCode } from '@frabpulse/shared';

export interface IMarketDataProvider {
  readonly providerCode: string;
  readonly supportedAssets: AssetCode[];
  fetchLatestPrices(): Promise<PriceSnapshot[]>;
  fetchHistoricalCandles?(assetCode: AssetCode, limit?: number): Promise<PriceCandle[]>;
}
