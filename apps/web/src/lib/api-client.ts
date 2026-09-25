import {
  PriceSnapshot,
  GoldGapAnalysis,
  MarketEvent,
  PriceCandle,
  calculateGoldGap,
  AssetCode,
  EventType
} from '@frabpulse/shared';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// Static fallback data for Next.js build time or when API is cold
export const FALLBACK_PRICES: PriceSnapshot[] = [
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

export const FALLBACK_EVENTS: MarketEvent[] = [
  {
    id: 'evt-fed-rate-decision-2026',
    title: 'Federal Reserve Holds Benchmark Rate; Signals Data-Dependent Horizon',
    summary:
      'The Federal Open Market Committee concluded its policy meeting by maintaining the federal funds target range at 5.25%-5.50%. Chair Jerome Powell noted continued disinflationary progress but reiterated that additional confirmation is required before considering policy easing.',
    eventType: 'CENTRAL_BANK',
    happenedAt: '2026-09-25T18:00:00.000Z',
    detectedAt: '2026-09-25T18:02:00.000Z',
    entities: ['Federal Reserve', 'Jerome Powell', 'FOMC', 'US Treasury'],
    confidence: 0.96,
    isDemo: true,
    methodologyNotes:
      'Correlation calculated using tick snapshots ±30 minutes around statement release (18:00 UTC). Does not imply single-factor causation.',
    synthesis: {
      factualContext:
        'The FOMC voted unanimously to maintain rates at 5.25%-5.50%. The policy statement removed language referencing additional firming, replacing it with conditional phrasing tied to dual-mandate risks.',
      sourceConsensus:
        'Reporting across Reuters, Bloomberg, and institutional desks agreed that the tone was moderately hawkish relative to dovish market expectations, leading to a temporary firming of US Treasury yields and dollar strength.',
      divergentPoints: [
        'Bloomberg emphasized the upward revision in the 2026 dot-plot median.',
        'Reuters highlighted Chair Powell’s remarks regarding labor market balance.'
      ]
    },
    sources: [
      {
        sourceId: 'src-reuters',
        sourceName: 'Reuters Financial Markets',
        sourceDomain: 'reuters.com',
        articleTitle: 'Fed holds rates steady, says inflation progress still requires confirmation',
        articleUrl: 'https://www.reuters.com/markets/us/fed-holds-rates-steady-2026',
        publishedAt: '2026-09-25T18:01:00.000Z',
        citationRole: 'PRIMARY',
        excerpt:
          'The Federal Reserve left its benchmark overnight interest rate unchanged on Wednesday as policymakers await clearer evidence of sustainable return to the 2% target.'
      },
      {
        sourceId: 'src-bloomberg',
        sourceName: 'Bloomberg Markets',
        sourceDomain: 'bloomberg.com',
        articleTitle: 'Treasuries drop as Powell cautions against premature easing bets',
        articleUrl: 'https://www.bloomberg.com/news/articles/2026-fed-rate-decision',
        publishedAt: '2026-09-25T18:03:00.000Z',
        citationRole: 'CONFIRMING',
        excerpt:
          'Short-term yields climbed following the statement, pressuring precious metals as rate futures scaled back anticipated cuts.'
      }
    ],
    relatedAssets: [
      {
        assetCode: 'XAU_USD',
        assetName: 'International Spot Gold',
        priceBefore: 2668.40,
        priceAfter: 2649.20,
        deltaAbsolute: -19.20,
        deltaPercent: -0.72,
        windowMinutes: 45,
        measuredFrom: '2026-09-25T17:45:00.000Z',
        measuredTo: '2026-09-25T18:30:00.000Z',
        isStatisticallySignificant: true,
        correlationCaveat:
          'Observed price movement coincided with a 7 bps surge in the US 10-year Treasury yield.'
      },
      {
        assetCode: 'USD_VND',
        assetName: 'USD / VND Exchange Rate',
        priceBefore: 25390,
        priceAfter: 25425,
        deltaAbsolute: 35,
        deltaPercent: 0.14,
        windowMinutes: 60,
        measuredFrom: '2026-09-25T17:45:00.000Z',
        measuredTo: '2026-09-25T18:45:00.000Z',
        isStatisticallySignificant: false,
        correlationCaveat: 'Modest interbank dollar strengthening within standard central bank trading band.'
      }
    ]
  },
  {
    id: 'evt-sbv-gold-stabilization-2026',
    title: 'State Bank of Vietnam Deploys Direct Bullion Supply via State Commercial Banks',
    summary:
      'The State Bank of Vietnam (SBV) enacted fresh intervention measures, supplying SJC gold bars directly through four state-owned commercial banks and SJC branches to narrow the domestic-to-international price disparity.',
    eventType: 'VIETNAM_REGULATION',
    happenedAt: '2026-09-25T02:30:00.000Z',
    detectedAt: '2026-09-25T02:35:00.000Z',
    entities: ['State Bank of Vietnam', 'SJC', 'Vietcombank', 'Agribank', 'BIDV', 'VietinBank'],
    confidence: 0.94,
    isDemo: true,
    methodologyNotes:
      'Domestic gold retail quotes collected from morning listing adjustments across Hanoi and Ho Chi Minh City headquarters.',
    synthesis: {
      factualContext:
        'Official dispatch announced direct sales of 999.9 SJC gold bars to individual customers with registered appointments, aimed at cooling retail speculation.',
      sourceConsensus:
        'Both VnExpress and Tuoi Tre reported that listed retail sell prices dropped over 1.8M VND/tael within three hours of branch announcements, while buy-sell bid spreads tightened to 1.9M VND.',
      divergentPoints: [
        'VnExpress noted initial branch wait times and online registration quotas.',
        'Tuoi Tre emphasized long-term regulatory plans to amend Decree 24 on gold market management.'
      ]
    },
    sources: [
      {
        sourceId: 'src-vnexpress',
        sourceName: 'VnExpress Kinh Doanh',
        sourceDomain: 'vnexpress.net',
        articleTitle: 'Ngân hàng Nhà nước tiếp tục bình ổn thị trường vàng qua hệ thống ngân hàng',
        articleUrl: 'https://vnexpress.net/ngan-hang-nha-nuoc-binh-on-vang-2026',
        publishedAt: '2026-09-25T02:40:00.000Z',
        citationRole: 'PRIMARY',
        excerpt:
          'Giá vàng miếng SJC tại các đơn vị kinh doanh lớn đồng loạt giảm mạnh sau khi các ngân hàng thương mại nhà nước công bố phương thức phân phối mới.'
      },
      {
        sourceId: 'src-tuoitre',
        sourceName: 'Tuoi Tre Tai Chinh',
        sourceDomain: 'tuoitre.vn',
        articleTitle: 'Chênh lệch giá vàng trong nước và thế giới thu hẹp về mức thấp mới',
        articleUrl: 'https://tuoitre.vn/chenh-lech-gia-vang-thu-hep-2026',
        publishedAt: '2026-09-25T02:50:00.000Z',
        citationRole: 'CONFIRMING',
        excerpt:
          'Khoảng cách giữa giá vàng miếng SJC và giá vàng quốc tế quy đổi đã thu hẹp đáng kể nhờ động thái điều tiết quyết liệt từ nhà điều hành.'
      }
    ],
    relatedAssets: [
      {
        assetCode: 'SJC_VN',
        assetName: 'SJC Gold 9999',
        priceBefore: 90_200_000,
        priceAfter: 88_400_000,
        deltaAbsolute: -1_800_000,
        deltaPercent: -2.00,
        windowMinutes: 90,
        measuredFrom: '2026-09-25T02:00:00.000Z',
        measuredTo: '2026-09-25T03:30:00.000Z',
        isStatisticallySignificant: true,
        correlationCaveat:
          'Direct response to state bank price circular adjustments at retail counters.'
      }
    ]
  },
  {
    id: 'evt-geopolitical-shipping-corridor-2026',
    title: 'Middle East Maritime Route Disruptions Drive Safe-Haven Precious Metals Demand',
    summary:
      'Reports of naval security alerts in the Red Sea and Gulf region triggered renewed defensive reallocation across energy and sovereign bullion desks during early European trading.',
    eventType: 'GEOPOLITICS',
    happenedAt: '2026-09-25T14:15:00.000Z',
    detectedAt: '2026-09-25T14:16:00.000Z',
    entities: ['Red Sea', 'Maritime Security Agency', 'Brent Crude', 'Safe Haven'],
    confidence: 0.91,
    isDemo: true,
    methodologyNotes:
      'Calculated over a 30-minute window post maritime wire alerts. Spot bullion recorded instantaneous buying volume.',
    synthesis: {
      factualContext:
        'Commercial shipping advisories raised alert levels following localized drone and naval encounters near regional chokepoints.',
      sourceConsensus:
        'Reuters and Kitco reported simultaneous upward bids in spot gold and Brent crude oil as European market participants hedged supply-chain risks.',
      divergentPoints: []
    },
    sources: [
      {
        sourceId: 'src-reuters',
        sourceName: 'Reuters Financial Markets',
        sourceDomain: 'reuters.com',
        articleTitle: 'Gold gains as Red Sea maritime alerts prompt safe-haven flows',
        articleUrl: 'https://www.reuters.com/markets/commodities/gold-safe-haven-flows-2026',
        publishedAt: '2026-09-25T14:17:00.000Z',
        citationRole: 'PRIMARY',
        excerpt:
          'Spot gold advanced over 1% as geopolitical friction in vital maritime corridors spurred hedging into hard physical assets.'
      },
      {
        sourceId: 'src-kitco',
        sourceName: 'Kitco Metals Global',
        sourceDomain: 'kitco.com',
        articleTitle: 'Bullion rallies back toward key resistance on geopolitical premium',
        articleUrl: 'https://www.kitco.com/news/article/2026-bullion-rally-geopolitics',
        publishedAt: '2026-09-25T14:20:00.000Z',
        citationRole: 'PERSPECTIVE',
        excerpt:
          'Commodity desks noted accelerated options delta hedging following breaking security headlines.'
      }
    ],
    relatedAssets: [
      {
        assetCode: 'XAU_USD',
        assetName: 'International Spot Gold',
        priceBefore: 2645.10,
        priceAfter: 2663.40,
        deltaAbsolute: 18.30,
        deltaPercent: 0.69,
        windowMinutes: 30,
        measuredFrom: '2026-09-25T14:05:00.000Z',
        measuredTo: '2026-09-25T14:35:00.000Z',
        isStatisticallySignificant: true,
        correlationCaveat:
          'Brent crude prices concurrently advanced 1.8% over the same 30-minute recording window.'
      }
    ]
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
      base += (Math.sin(i * 0.5) * (asset === 'XAU_USD' ? 3 : 40000));
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
    const data = await res.json();
    return data && data.length > 0 ? data : FALLBACK_EVENTS;
  } catch {
    return FALLBACK_EVENTS;
  }
}

export async function fetchEventById(id: string): Promise<MarketEvent | null> {
  try {
    const res = await fetch(`${API_BASE}/events/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return FALLBACK_EVENTS.find((e) => e.id === id) || null;
  }
}

export async function fetchEventsByTopic(eventType: EventType): Promise<MarketEvent[]> {
  const events = await fetchMarketEvents();
  return events.filter((e) => e.eventType === eventType);
}

export function getPriceByAsset(prices: PriceSnapshot[], code: AssetCode): PriceSnapshot | undefined {
  return prices.find((p) => p.assetCode === code);
}
