export interface NewsSource {
  id: string;
  code: string;
  name: string;
  domain: string;
  credibilityScore: number; // 0.0 to 1.0
  category: 'FINANCIAL_NEWS' | 'MACRO_AGENCY' | 'DOMESTIC_PRESS' | 'BULLION_EXCHANGE';
  reliabilityNotes: string;
}

export const VERIFIED_SOURCES: Record<string, NewsSource> = {
  REUTERS: {
    id: 'src-reuters',
    code: 'REUTERS',
    name: 'Reuters Financial Markets',
    domain: 'reuters.com',
    credibilityScore: 0.98,
    category: 'FINANCIAL_NEWS',
    reliabilityNotes: 'Multi-sourced primary market reporting with standardized correction policy'
  },
  BLOOMBERG: {
    id: 'src-bloomberg',
    code: 'BLOOMBERG',
    name: 'Bloomberg Terminal & News',
    domain: 'bloomberg.com',
    credibilityScore: 0.98,
    category: 'FINANCIAL_NEWS',
    reliabilityNotes: 'Institutional financial journalism with direct bond and commodity desk access'
  },
  VNEXPRESS: {
    id: 'src-vnexpress',
    code: 'VNEXPRESS',
    name: 'VnExpress Kinh Doanh',
    domain: 'vnexpress.net',
    credibilityScore: 0.92,
    category: 'DOMESTIC_PRESS',
    reliabilityNotes: 'Major Vietnamese national outlet with direct reporting on SJC and SBV auctions'
  },
  TUOI_TRE: {
    id: 'src-tuoitre',
    code: 'TUOI_TRE',
    name: 'Tuoi Tre Tai Chinh',
    domain: 'tuoitre.vn',
    credibilityScore: 0.91,
    category: 'DOMESTIC_PRESS',
    reliabilityNotes: 'Accredited Vietnamese domestic daily covering State Bank policies and retail gold shops'
  },
  KITCO: {
    id: 'src-kitco',
    code: 'KITCO',
    name: 'Kitco Metals Global',
    domain: 'kitco.com',
    credibilityScore: 0.94,
    category: 'BULLION_EXCHANGE',
    reliabilityNotes: 'Specialist precious metals analytics desk and spot price aggregator'
  }
};
