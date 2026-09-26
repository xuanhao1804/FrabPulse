import {
  PriceSnapshot,
  MarketEvent,
  GoldGapAnalysis,
  PriceCandle,
  calculateGoldGap
} from '@frabpulse/shared';

export const SEED_ASSETS = [
  {
    code: 'SJC_VN',
    name: 'SJC Gold 9999',
    category: 'GOLD_DOMESTIC',
    unit: 'VND/lượng',
    symbol: 'SJC',
    description: 'Saigon Jewelry Company national benchmark 999.9 gold bar'
  },
  {
    code: 'DOJI_VN',
    name: 'DOJI Gold',
    category: 'GOLD_DOMESTIC',
    unit: 'VND/lượng',
    symbol: 'DOJI',
    description: 'DOJI Gold & Gems Group retail bullion rate'
  },
  {
    code: 'PNJ_VN',
    name: 'PNJ Gold 24K',
    category: 'GOLD_DOMESTIC',
    unit: 'VND/lượng',
    symbol: 'PNJ',
    description: 'Phu Nhuan Jewelry 24K pure gold bullion'
  },
  {
    code: 'XAU_USD',
    name: 'International Spot Gold',
    category: 'GOLD_INTERNATIONAL',
    unit: 'USD/oz',
    symbol: 'XAU/USD',
    description: 'Global spot gold price in US Dollars per troy ounce'
  },
  {
    code: 'USD_VND',
    name: 'USD / VND Forex Rate',
    category: 'FOREX',
    unit: 'VND/USD',
    symbol: 'USD/VND',
    description: 'Commercial exchange rate for US Dollar to Vietnamese Dong'
  }
];

export const SEED_PROVIDERS = [
  {
    code: 'SJC',
    name: 'Saigon Jewelry Company',
    websiteUrl: 'https://sjc.com.vn',
    isLive: true
  },
  {
    code: 'DOJI',
    name: 'DOJI Gold & Gems Group',
    websiteUrl: 'https://doji.vn',
    isLive: true
  },
  {
    code: 'PNJ',
    name: 'Phu Nhuan Jewelry',
    websiteUrl: 'https://pnj.com.vn',
    isLive: true
  },
  {
    code: 'KITCO',
    name: 'Kitco Metals Global',
    websiteUrl: 'https://kitco.com',
    isLive: true
  },
  {
    code: 'STATE_BANK',
    name: 'State Bank of Vietnam',
    websiteUrl: 'https://sbv.gov.vn',
    isLive: true
  }
];

export const SEED_SOURCES = [
  {
    code: 'REUTERS',
    name: 'Reuters Financial Markets',
    domain: 'reuters.com',
    credibilityScore: 0.98,
    category: 'FINANCIAL_NEWS',
    reliabilityNotes: 'Multi-sourced primary market reporting with standardized correction policy'
  },
  {
    code: 'BLOOMBERG',
    name: 'Bloomberg Terminal & News',
    domain: 'bloomberg.com',
    credibilityScore: 0.98,
    category: 'FINANCIAL_NEWS',
    reliabilityNotes: 'Institutional financial journalism with direct bond and commodity desk access'
  },
  {
    code: 'VNEXPRESS',
    name: 'VnExpress Kinh Doanh',
    domain: 'vnexpress.net',
    credibilityScore: 0.92,
    category: 'DOMESTIC_PRESS',
    reliabilityNotes: 'Major Vietnamese national outlet with direct reporting on SJC and SBV auctions'
  },
  {
    code: 'TUOI_TRE',
    name: 'Tuoi Tre Tai Chinh',
    domain: 'tuoitre.vn',
    credibilityScore: 0.91,
    category: 'DOMESTIC_PRESS',
    reliabilityNotes: 'Accredited Vietnamese domestic daily covering State Bank policies and retail gold shops'
  },
  {
    code: 'KITCO',
    name: 'Kitco Metals Global',
    domain: 'kitco.com',
    credibilityScore: 0.94,
    category: 'BULLION_EXCHANGE',
    reliabilityNotes: 'Specialist precious metals analytics desk and spot price aggregator'
  }
];

export const LATEST_SEED_PRICES: PriceSnapshot[] = [
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

export function getLatestSeedGoldGap(): GoldGapAnalysis {
  const xau = LATEST_SEED_PRICES.find((p) => p.assetCode === 'XAU_USD')?.sellPrice || 2663.40;
  const usdVnd = LATEST_SEED_PRICES.find((p) => p.assetCode === 'USD_VND')?.sellPrice || 25440;
  const sjc = LATEST_SEED_PRICES.find((p) => p.assetCode === 'SJC_VN')?.sellPrice || 89_500_000;
  return calculateGoldGap(xau, usdVnd, sjc, true);
}

// 120-point 24-hour high-density candlestick series for XAU/USD and SJC (12-minute resolution)
export function generateSeedHistoricalSeries(): { xauSeries: PriceCandle[]; sjcSeries: PriceCandle[] } {
  const xauSeries: PriceCandle[] = [];
  const sjcSeries: PriceCandle[] = [];
  const now = Date.now();
  const totalPoints = 120;
  const stepMs = 12 * 60 * 1000; // 12-minute intervals = 120 points in 24 hours

  // Base starting prices 24 hours ago
  let currXau = 2648.50;
  let currSjc = 88_900_000;

  for (let i = totalPoints - 1; i >= 0; i--) {
    const time = new Date(now - i * stepMs).toISOString();

    // Event impact at step 50 (Fed announcement simulation: dip) and step 25 (Geopolitical spike)
    let xauDelta = (Math.sin(i * 0.18) * 1.5) + ((Math.random() - 0.49) * 2.2);
    if (i >= 48 && i <= 52) xauDelta -= 3.5; // Event drop
    if (i >= 23 && i <= 27) xauDelta += 4.2; // Geopolitical spike

    currXau = Math.round((currXau + xauDelta) * 100) / 100;
    const xauHigh = currXau + Math.random() * 1.8;
    const xauLow = currXau - Math.random() * 1.8;

    xauSeries.push({
      timestamp: time,
      open: Math.round((currXau - xauDelta) * 100) / 100,
      high: Math.max(currXau, xauHigh),
      low: Math.min(currXau, xauLow),
      close: currXau,
      volume: Math.floor(800 + Math.random() * 600)
    });

    // SJC domestic movement (smoother, domestic premium dynamics)
    let sjcDelta = Math.round(xauDelta * 28000 + (Math.random() - 0.5) * 45000);
    currSjc += sjcDelta;
    sjcSeries.push({
      timestamp: time,
      open: currSjc - sjcDelta,
      high: currSjc + 35000,
      low: currSjc - 35000,
      close: currSjc,
      volume: Math.floor(350 + Math.random() * 180)
    });
  }

  return { xauSeries, sjcSeries };
}

export const SEED_MARKET_EVENTS: MarketEvent[] = [
  {
    id: 'evt-fed-rate-decision-2026',
    title: 'Federal Reserve Holds Benchmark Rate; Signals Data-Dependent Horizon',
    summary:
      'The Federal Open Market Committee concluded its policy meeting by maintaining the federal funds target range at 5.25%-5.50%. Chair Jerome Powell noted continued disinflationary progress but reiterated that additional confirmation is required before considering policy easing.',
    eventType: 'CENTRAL_BANK',
    happenedAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(), // 10h ago
    detectedAt: new Date(Date.now() - 10 * 3600 * 1000 + 120_000).toISOString(),
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
        publishedAt: new Date(Date.now() - 10 * 3600 * 1000 + 60_000).toISOString(),
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
        publishedAt: new Date(Date.now() - 10 * 3600 * 1000 + 180_000).toISOString(),
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
        measuredFrom: new Date(Date.now() - 10 * 3600 * 1000 - 15 * 60 * 1000).toISOString(),
        measuredTo: new Date(Date.now() - 10 * 3600 * 1000 + 30 * 60 * 1000).toISOString(),
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
        measuredFrom: new Date(Date.now() - 10 * 3600 * 1000 - 15 * 60 * 1000).toISOString(),
        measuredTo: new Date(Date.now() - 10 * 3600 * 1000 + 45 * 60 * 1000).toISOString(),
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
    happenedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(), // 5h ago
    detectedAt: new Date(Date.now() - 5 * 3600 * 1000 + 300_000).toISOString(),
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
        publishedAt: new Date(Date.now() - 5 * 3600 * 1000 + 600_000).toISOString(),
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
        publishedAt: new Date(Date.now() - 5 * 3600 * 1000 + 1200_000).toISOString(),
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
        measuredFrom: new Date(Date.now() - 5 * 3600 * 1000 - 30 * 60 * 1000).toISOString(),
        measuredTo: new Date(Date.now() - 5 * 3600 * 1000 + 60 * 60 * 1000).toISOString(),
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
    happenedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2h ago
    detectedAt: new Date(Date.now() - 2 * 3600 * 1000 + 60_000).toISOString(),
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
        publishedAt: new Date(Date.now() - 2 * 3600 * 1000 + 120_000).toISOString(),
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
        publishedAt: new Date(Date.now() - 2 * 3600 * 1000 + 300_000).toISOString(),
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
        measuredFrom: new Date(Date.now() - 2 * 3600 * 1000 - 10 * 60 * 1000).toISOString(),
        measuredTo: new Date(Date.now() - 2 * 3600 * 1000 + 20 * 60 * 1000).toISOString(),
        isStatisticallySignificant: true,
        correlationCaveat:
          'Brent crude prices concurrently advanced 1.8% over the same 30-minute recording window.'
      }
    ]
  }
];
