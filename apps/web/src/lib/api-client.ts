import {
  PriceSnapshot,
  GoldGapAnalysis,
  MarketEvent,
  PriceCandle,
  calculateGoldGap
} from '@frabpulse/shared';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// Static fallback data for Next.js build time or when API is cold
const FALLBACK_PRICES: PriceSnapshot[] = [
  {
    assetCode: 'SJC_VN',
    providerCode: 'SJC',
    buyPrice: 87_500_000,
    sellPrice: 89_500_000,
    spread: 2_000_000,
    currency: 'VND',
    timestamp: new Date().toISOString(),
    change24hAbsolute: 500_000,
    change24hPercent: 0.56,
    isDemo: true
  },
  {
    assetCode: 'DOJI_VN',
    providerCode: 'DOJI',
    buyPrice: 87_400_000,
    sellPrice: 89_400_000,
    spread: 2_000_000,
    currency: 'VND',
    timestamp: new Date().toISOString(),
    change24hAbsolute: 400_000,
    change24hPercent: 0.45,
    isDemo: true
  },
  {
    assetCode: 'PNJ_VN',
    providerCode: 'PNJ',
    buyPrice: 87_200_000,
    sellPrice: 88_900_000,
    spread: 1_700_000,
    currency: 'VND',
    timestamp: new Date().toISOString(),
    change24hAbsolute: 300_000,
    change24hPercent: 0.34,
    isDemo: true
  },
  {
    assetCode: 'XAU_USD',
    providerCode: 'KITCO',
    buyPrice: 2662.80,
    sellPrice: 2663.40,
    spread: 0.60,
    currency: 'USD',
    timestamp: new Date().toISOString(),
    change24hAbsolute: 14.20,
    change24hPercent: 0.54,
    isDemo: true
  },
  {
    assetCode: 'USD_VND',
    providerCode: 'STATE_BANK',
    buyPrice: 25390,
    sellPrice: 25440,
    spread: 50,
    currency: 'VND',
    timestamp: new Date().toISOString(),
    change24hAbsolute: 20,
    change24hPercent: 0.08,
    isDemo: true
  }
];

export async function fetchLatestPrices(): Promise<PriceSnapshot[]> {
  try {
    const res = await fetch(`${API_BASE}/market/prices/latest`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return FALLBACK_PRICES;
  }
}

export async function fetchGoldGap(): Promise<GoldGapAnalysis> {
  try {
    const res = await fetch(`${API_BASE}/market/gold-gap`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return calculateGoldGap(2663.40, 25440, 89_500_000, true);
  }
}

export async function fetchHistoricalChart(asset = 'XAU_USD'): Promise<PriceCandle[]> {
  try {
    const res = await fetch(`${API_BASE}/market/chart/series?asset=${asset}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    // Generate basic curve for fallback
    const points: PriceCandle[] = [];
    let base = asset === 'XAU_USD' ? 2650 : 88_500_000;
    for (let i = 24; i >= 0; i--) {
      base += (Math.random() - 0.48) * (asset === 'XAU_USD' ? 4 : 50000);
      points.push({
        timestamp: new Date(Date.now() - i * 3600000).toISOString(),
        open: base - 2,
        high: base + 3,
        low: base - 3,
        close: base,
        volume: 500
      });
    }
    return points;
  }
}

export async function fetchMarketEvents(): Promise<MarketEvent[]> {
  try {
    const res = await fetch(`${API_BASE}/events`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return [];
  }
}

export async function fetchEventById(id: string): Promise<MarketEvent | null> {
  try {
    const res = await fetch(`${API_BASE}/events/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return null;
  }
}
