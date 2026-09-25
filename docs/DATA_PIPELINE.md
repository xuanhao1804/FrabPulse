# FrabPulse — Data Pipeline Specification

## 1. Pipeline Overview

```text
  [ Market Data Sources ]          [ Verified News Sources ]
    (SJC, DOJI, PNJ, XAU)          (Reuters, Bloomberg, VnExpress)
             │                                    │
             ▼                                    ▼
      Market Ingestion                      News Ingestion
             │                                    │
             ▼                                    ▼
       Normalization                        Normalization
   (USD/oz, VND/tael, UTC)               (Title, Body, PubDate)
             │                                    │
             ▼                                    ▼
       Price Snapshot                       Deduplication
      Storage & Spreads                   (URL hash, text sim)
             │                                    │
             ▼                                    ▼
    Gold Gap Calculation                   Event Clustering
  (World XAU vs SJC tael)                (Time window, entities)
             │                                    │
             │                                    ▼
             │                             AI Extraction
             │                        (Entities, Impact, Summ)
             │                                    │
             │                                    ▼
             │                            Source Attribution
             │                        (Citations, Roles, Links)
             │                                    │
             └───────────────┬────────────────────┘
                             ▼
                 Temporal Correlation Engine
             (Price Before vs Price After Window)
                             │
                             ▼
                Event & Timeline Storage
                             │
                             ▼
                 Real-time SSE Broadcaster
```

---

## 2. Market Data Domain: Vietnamese & International Gold

### 2.1 Conversion Standards
- **Troy Ounce (oz):** The international standard for spot gold (XAU/USD).
- **Lượng / Cây (Vietnam):** The Vietnamese gold standard weight.
  - $1\text{ lượng} = 1\text{ cây} = 10\text{ chỉ} = 37.5\text{ grams}$.
  - $1\text{ troy ounce} \approx 31.1034768\text{ grams} \approx 0.829426\text{ lượng}$.
  - $1\text{ lượng} \approx 1.20565\text{ troy ounces}$.

### 2.2 Vietnam vs. World Gold Gap Formula
To compare domestic gold (e.g. SJC 9999) with international spot gold (XAU/USD):

$$\text{World Gold Price in VND (per lượng)} = \text{XAU/USD} \times \text{USD/VND exchange rate} \times 1.20565$$

$$\text{Premium / Gap (VND)} = \text{Domestic SJC Sell Price} - \text{World Gold Price in VND}$$

$$\text{Gap Percentage (\%)} = \left(\frac{\text{Domestic SJC Sell Price} - \text{World Gold Price in VND}}{\text{World Gold Price in VND}}\right) \times 100\%$$

*Note: Taxes, refining margins, and import quotas account for the domestic premium. FrabPulse explicitly computes and displays this mathematical gap without speculative commentary.*

---

## 3. News & Event Pipeline Stages

### Stage 1: Ingestion
- Periodic polling or webhook ingestion of articles from accredited sources.
- Supported providers: Reuters Financials, Bloomberg Macro, VnExpress Kinh Doanh, Tuoi Tre Tai Chinh, Kitco News.

### Stage 2: Normalization
- Standardizes ISO 8601 UTC timestamps, canonical URLs, and plain-text stripping.

### Stage 3: Deduplication & Clustering
- Detects multi-outlet coverage of identical real-world occurrences within rolling 4-hour windows.
- Groups reporting into a single `MarketEvent` entity.

### Stage 4: AI Extraction & Source Grounding
- Extracts entities (e.g., `"Federal Reserve"`, `"State Bank of Vietnam"`, `"Jerome Powell"`).
- Determines `eventType` (`CENTRAL_BANK`, `INFLATION`, `GEOPOLITICS`, `USD_DXY`, `GOLD_DEMAND`, `VIETNAM_REGULATION`).
- Generates an objective, fact-focused executive summary.

### Stage 5: Temporal Correlation Engine
- Retrieves market asset snapshots at:
  - $t_{\text{before}} = t_{\text{event}} - 30\text{ minutes}$
  - $t_{\text{after}} = t_{\text{event}} + 30\text{ minutes}$
- Computes:
  - $\Delta_{\text{abs}} = P_{\text{after}} - P_{\text{before}}$
  - $\Delta_{\%} = \frac{P_{\text{after}} - P_{\text{before}}}{P_{\text{before}}} \times 100\%$
- Labels data explicitly as **temporal correlation within 60-minute window**, never as direct causality.
