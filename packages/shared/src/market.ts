export type AssetCode =
  | 'SJC_VN'
  | 'DOJI_VN'
  | 'PNJ_VN'
  | 'XAU_USD'
  | 'USD_VND';

export type AssetCategory =
  | 'GOLD_DOMESTIC'
  | 'GOLD_INTERNATIONAL'
  | 'FOREX';

export interface AssetMetadata {
  code: AssetCode;
  name: string;
  category: AssetCategory;
  unit: string;
  symbol: string;
  description: string;
}

export const ASSET_DEFINITIONS: Record<AssetCode, AssetMetadata> = {
  SJC_VN: {
    code: 'SJC_VN',
    name: 'SJC Gold 9999',
    category: 'GOLD_DOMESTIC',
    unit: 'VND/lượng',
    symbol: 'SJC',
    description: 'Saigon Jewelry Company national benchmark 999.9 gold bar'
  },
  DOJI_VN: {
    code: 'DOJI_VN',
    name: 'DOJI Gold',
    category: 'GOLD_DOMESTIC',
    unit: 'VND/lượng',
    symbol: 'DOJI',
    description: 'DOJI Gold & Gems Group retail bullion rate'
  },
  PNJ_VN: {
    code: 'PNJ_VN',
    name: 'PNJ Gold 24K',
    category: 'GOLD_DOMESTIC',
    unit: 'VND/lượng',
    symbol: 'PNJ',
    description: 'Phu Nhuan Jewelry 24K pure gold bullion'
  },
  XAU_USD: {
    code: 'XAU_USD',
    name: 'International Spot Gold',
    category: 'GOLD_INTERNATIONAL',
    unit: 'USD/oz',
    symbol: 'XAU/USD',
    description: 'Global spot gold price in US Dollars per troy ounce'
  },
  USD_VND: {
    code: 'USD_VND',
    name: 'USD / VND Forex Rate',
    category: 'FOREX',
    unit: 'VND/USD',
    symbol: 'USD/VND',
    description: 'Commercial exchange rate for US Dollar to Vietnamese Dong'
  }
};

export interface PriceSnapshot {
  assetCode: AssetCode;
  providerCode: string;
  buyPrice: number;
  sellPrice: number;
  spread: number;
  currency: string;
  timestamp: string; // ISO 8601
  change24hAbsolute?: number;
  change24hPercent?: number;
  isDemo: boolean;
}

export interface PriceCandle {
  timestamp: string; // ISO 8601
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface GoldGapAnalysis {
  worldPriceVndPerTael: number;
  domesticPriceVndPerTael: number;
  gapVnd: number;
  gapPercent: number;
  xauUsd: number;
  usdVnd: number;
  conversionFactor: number; // 1.20565
  timestamp: string;
  isDemo: boolean;
}
