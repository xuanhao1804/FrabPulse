# FrabPulse — Product & Engineering Roadmap

## Version Overview

```text
V0: Foundation (Monorepo, CI, Database, API Shell, UI Design System) [COMPLETED]
 │
 ├── V1: Gold Pulse MVP (SJC, DOJI, PNJ, XAU/USD, USD/VND, Gap Engine) [COMPLETED]
 │    │
 │    ├── V1.5: Live Ingestion & Data Resilience (Live Adapters, SJC/Spot, RSS) ◄ [CURRENT ACTIVE TARGET]
 │    │    └── Detailed Spec: docs/SPEC_MILESTONES_AND_TASKS.md
 │    │
 │    ├── V2: Automated Event Intelligence (Clustering, Strict 3-Layer AI Synthesis)
 │    │
 │    └── V2.5: Event ↔ Price Correlation Engine (Temporal Windows, Interactive Markers)
 │
 ├── V3: Community & User Features (Watchlists, Threshold Alerts, Webhooks)
 │
 └── Future Verticals:
      ├── Market Pulse (Equities, VN-Index, DXY, Macro Rates)
      └── AI Pulse (LLM Releases, API Pricing Shifts, Benchmarks)
```

---

## Detailed Milestones

### V0 — Foundation (Completed in Initial Bootstrap)
- [x] TypeScript monorepo with `pnpm` workspaces and `turbo`
- [x] NestJS API modular monolith (`apps/api`)
- [x] Next.js 15 App Router frontend with Tailwind CSS (`apps/web`)
- [x] Shared library (`packages/shared`) with core TypeScript interfaces
- [x] PostgreSQL relational schema via Prisma ORM
- [x] Docker Compose environment for local development
- [x] GitHub Actions CI workflow (lint, typecheck, test, build)
- [x] Comprehensive documentation suite

### V1 — Gold Pulse MVP
- [x] Domestic gold provider integrations (SJC, DOJI, PNJ)
- [x] International spot gold tracking (XAU/USD)
- [x] Currency pair conversion (USD/VND)
- [x] Vietnam vs. World gold gap calculation engine
- [x] Responsive fintech research dashboard with live ticker status
- [x] Interactive financial price chart with timeline zoom and event flags

### V1.5 — News Ingestion & Normalization
- [x] Provider adapters for accredited outlets (Reuters, Bloomberg, VnExpress, Tuoi Tre, Kitco)
- [x] Canonical URL deduplication and text normalization
- [x] Outlet credibility scoring and metadata tagging

### V2 — AI Event Intelligence
- [x] `IAIIntelligenceProvider` abstraction with deterministic local fixture fallback
- [x] OpenAI structured output integration
- [x] Multi-source event synthesis with citation tags
- [x] Event categorization (`CENTRAL_BANK`, `INFLATION`, `GEOPOLITICS`, etc.)

### V2.5 — Event ↔ Price Correlation
- [x] Temporal correlation engine ($-30\text{m}$ to $+30\text{m}$ measurement window)
- [x] Factual delta calculations ($\Delta_{\text{abs}}$, $\Delta_{\%}$)
- [x] Event detail page with transparent epistemological separation
- [x] Server-Sent Events (SSE) live updates

### V3 — Personalization & Notification (Upcoming)
- [ ] User authentication and customized watchlists
- [ ] Real-time Telegram and Discord alerts on gap divergences
- [ ] Webhook integration for quantitative researchers

### Future Vertical — Market Pulse
- [ ] VN-Index, S&P 500, US Dollar Index (DXY)
- [ ] Central Bank rate decision calendar and live impact tracking

### Future Vertical — AI Pulse
- [ ] Frontier LLM release tracker (OpenAI, Anthropic, Google, Meta)
- [ ] API pricing changes and token benchmark movements
