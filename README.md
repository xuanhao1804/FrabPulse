# FrabPulse

<div align="center">
  <h3>Real-time Event Intelligence Platform</h3>
  <p><strong>Understand what moves, when it moves.</strong></p>
  <p>
    <code>Observed Market Data</code> + 
    <code>Accredited News Dispatches</code> + 
    <code>AI Structured Extraction</code> + 
    <code>Temporal Correlation Engine</code>
  </p>
</div>

---

## 1. What is FrabPulse?

**FrabPulse** (Frab = *Frog + Lab*, Pulse = *detecting the pulse of markets, news, and real-world events*) is a real-time event intelligence platform.

Most gold-tracking websites only answer:
> *"What is the gold price right now?"*

Financial news websites publish stories hours later:
> *"Gold fell because the Fed sounded hawkish."*

FrabPulse answers the five foundational questions of market intelligence simultaneously:
1. **What just happened?** (Macro announcements, regulatory shifts, geopolitics)
2. **What data moved around the same time?** (Exact empirical price before vs. price after delta)
3. **What are trustworthy sources saying about it?** (Direct source attribution with publication timestamps)
4. **How did the event develop over time?** (Chronological narrative sequencing)
5. **What is the empirical correlation between the event and asset movement?**

---

## 2. Core Epistemic Rule: Facts vs. Sources vs. AI

FrabPulse strictly avoids unsupported causal claims. We separate:

| Layer | Responsibility | Example |
| :--- | :--- | :--- |
| **1. Observed Facts** | Pure mathematical market measurements across the temporal observation window. | *"XAU/USD dropped 0.72% ($2,668.40 → $2,649.20) in the 45-minute window following the announcement."* |
| **2. Source Interpretations** | Attributed quotes and narrative arguments from accredited financial journalists. | *"Reuters and Bloomberg reported that traders trimmed rate-cut bets following Jerome Powell's remarks."* |
| **3. AI Synthesis** | Machine extraction of entities, topics, consensus, and divergences. | Structured consensus summary without unverified causal claims. |

---

## 3. Product Verticals & Public Web Routes

```text
FrabPulse
│
├── Gold Pulse [ACTIVE MVP]
│   ├── Domestic Vietnamese Gold (SJC 9999, DOJI, PNJ)
│   ├── International Spot Gold (XAU/USD)
│   ├── Commercial Forex (USD/VND)
│   ├── Vietnam vs. World Gold Gap Analysis Engine
│   └── Interactive Price Chart with Correlated Event Markers
│
├── Market Pulse [FUTURE]
│   └── Equities (VN-Index, S&P 500), DXY, Treasury Yields, BTC
│
└── AI Pulse [FUTURE]
    └── Frontier LLM Releases, API Pricing Shifts, Benchmarks
```

### Public Indexable Routes (Server-Rendered & SEO-Ready)

| Route | Content & Epistemology | Metadata & Structured Data |
| :--- | :--- | :--- |
| `/` | Real-time Gold Pulse Radar, arbitrage gap, interactive chart, event feed | Dynamic Metadata, Dataset JSON-LD |
| `/gold` | Bullion directory & physical unit conversion guide | BreadcrumbList, WebPage JSON-LD |
| `/gold/sjc` | SJC Gold 9999 live quotes, spreads, Decree 24 context | FinancialProduct, Breadcrumbs |
| `/gold/doji` | DOJI Gold retail bullion quotes, spreads | FinancialProduct, Breadcrumbs |
| `/gold/pnj` | Phu Nhuan Jewelry 24K bullion rates | FinancialProduct, Breadcrumbs |
| `/gold/world` | International spot gold (XAU/USD) & FX rate factor | FinancialProduct, Breadcrumbs |
| `/events/[id]` | 3-layer epistemic separation breakdown (Facts, Sources, AI) | NewsArticle JSON-LD with source citations |
| `/topics/[slug]` | Thematic event intelligence (`central-bank`, `vietnam-regulation`, `geopolitics`) | CollectionPage, Breadcrumbs |
| `/methodology` | Data transparency, gold gap math, correlation vs. causation | Article, Transparency Guide |
| `/sitemap.xml` | Automated XML sitemap of all indexable public pages | Dynamic Next.js MetadataRoute |
| `/robots.txt` | Crawler policy allowing public routes and disallowing private API routes | Dynamic Next.js MetadataRoute |

### Mobile-First Responsive Experience
- **Viewport Range:** Tested and optimized from **320px (ultra-compact mobile)** up to **4K widescreen displays**.
- **Touch-First Controls:** All buttons, selectors, tabs, and event markers feature **minimum 44px touch targets**.
- **Mobile Prioritized Flow:** On phones, users see current prices, daily delta, spread, and the arbitrage gap above the fold within 3 seconds, followed by touch-friendly charts and a vertical event timeline.
- **Dual Navigation:** Accessible mobile drawer and persistent bottom thumb bar on mobile; clean horizontal header on desktop.

---

## 4. Architecture & Tech Stack

FrabPulse is organized as a TypeScript Monorepo:

```text
frabpulse/
├── apps/
│   ├── web/                     # Next.js 15 App Router, React 19, Tailwind CSS, Lucide
│   └── api/                     # NestJS 11 modular monolith, REST, SSE pulse stream, Prisma ORM
├── packages/
│   ├── shared/                  # Common domain contracts, DTOs, arbitrage formulas
│   └── tsconfig/                # Common TypeScript configs
├── docs/                        # Specifications (VISION, ARCHITECTURE, PIPELINE, AI, ROADMAP)
├── docker/                      # Docker Compose (PostgreSQL, Redis)
└── .github/workflows/           # CI: install, lint, typecheck, test, build
```

- **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS, Lucide Icons, Responsive SVG Financial Chart.
- **Backend:** NestJS 11 (Modular Monolith: `market-data`, `news`, `events`, `ai`, `sse`, `health`).
- **Database:** PostgreSQL with Prisma ORM.
- **Real-time Delivery:** Server-Sent Events (SSE) `/api/v1/sse/pulse` for one-way live ticker and event broadcasts.
- **AI Processing:** `IAIIntelligenceProvider` abstraction with:
  - `DeterministicLabAIProvider`: Built-in zero-dependency reproducible engine for local dev and CI.
  - `OpenAIProvider`: Structured extraction via OpenAI JSON schema mode when `OPENAI_API_KEY` is present.
- **Package Manager:** `pnpm` workspaces + `turbo`.

---

## 5. Quick Start (Run Locally)

FrabPulse is designed to run immediately out-of-the-box on a fresh clone with **zero external API keys or required paid subscriptions**.

### Prerequisites
- Node.js >= 20.0.0 (tested on v24.16.0)
- pnpm >= 9.0.0 (tested on v11.3.0)

### 1. Clone & Install
```bash
git clone https://github.com/xuanhao1804/FrabPulse.git
cd FrabPulse
pnpm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```
*(The default configuration uses the built-in deterministic lab provider and in-memory fixture fallback, so no keys or database setup are mandatory to test the application immediately).*

### 3. (Optional) Start Local Database with Docker
If you wish to run a live local PostgreSQL instance:
```bash
docker compose -f docker/docker-compose.yml up -d
pnpm db:generate
pnpm db:seed
```

### 4. Run Development Server
```bash
pnpm dev
```

- **Web Dashboard:** [http://localhost:3000](http://localhost:3000)
- **API Server:** [http://localhost:3001/api/v1](http://localhost:3001/api/v1)
- **Live SSE Stream:** [http://localhost:3001/api/v1/sse/pulse](http://localhost:3001/api/v1/sse/pulse)
- **API Health Check:** [http://localhost:3001/api/v1/health](http://localhost:3001/api/v1/health)

---

## 6. Verification & Quality Commands

```bash
# Type checking across all workspaces
pnpm typecheck

# Run unit tests across packages and apps
pnpm test

# Build production artifacts
pnpm build
```

---

## 7. Vietnam vs. World Gold Gap Formula

FrabPulse calculates the domestic premium mathematically:

$$\text{World Gold in VND (per lượng)} = \text{XAU/USD} \times \text{USD/VND} \times 1.20565$$

$$\text{Gap (VND)} = \text{Domestic SJC Sell Price} - \text{World Gold in VND}$$

$$\text{Gap Percentage (\%)} = \left(\frac{\text{Gap}}{\text{World Gold in VND}}\right) \times 100\%$$

*Note: 1 lượng (cây) = 37.5 grams. 1 troy ounce = 31.1035 grams. Ratio = 1.20565.*

---

## 8. Documentation Suite

- [`docs/VISION.md`](docs/VISION.md) — Product philosophy & epistemological separation.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — Monorepo design, modular monolith boundaries, and SSE delivery.
- [`docs/DATA_PIPELINE.md`](docs/DATA_PIPELINE.md) — News & market data pipeline, deduplication, and formulas.
- [`docs/AI_DESIGN.md`](docs/AI_DESIGN.md) — AI abstraction and strict non-hallucinatory guardrails.
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — Roadmap from V0 to Future Verticals.
- [`docs/AGENT_PROTOCOL.md`](docs/AGENT_PROTOCOL.md) — Agent Operating Protocol for autonomous engineering quality.
- [`docs/SPEC_MILESTONES_AND_TASKS.md`](docs/SPEC_MILESTONES_AND_TASKS.md) — Detailed specifications, milestones & task breakdown.

---

## 9. License

MIT. Open-source research and engineering project.
