# FrabPulse — Master Task History & Canonical Timeline

**File**: \`docs/context/HISTORY.md\`  
**Status**: Authoritative Historical Index  
**Last Updated**: 2026-09-26  

---

## 1. Commit Coverage & Verification Matrix

- **Total Historical Commits in Scope**: 16
- **Total Assigned Commits**: 16
- **Missing Commits**: 0
- **Duplicate Assignments**: 0
- **Coverage**: 100% of Git history mapped to GitHub Issues.

---

## 2. Canonical Task Index

| Task ID | Original Period | Logical Task Title | GitHub Issue | Commits | Outcome | Status | Evidence Source |
|---|---|---|---|---|---|---|---|
| **HT-1** | 2026-09 | Bootstrap FrabPulse Real-time Monorepo | [#2](https://github.com/xuanhao1804/FrabPulse/issues/2) | [\`6752314\`](https://github.com/xuanhao1804/FrabPulse/commit/6752314), [\`fe62833\`](https://github.com/xuanhao1804/FrabPulse/commit/fe62833) | Initial Turborepo monorepo, NestJS SSE backend, Next.js 15 client island, shared formulas, initial docs. | CLOSED | Git log & commit diffs |
| **HT-2** | 2026-09 | Implement Mobile-First Responsive Design & Public SEO Routes | [#3](https://github.com/xuanhao1804/FrabPulse/issues/3) | [\`8173324\`](https://github.com/xuanhao1804/FrabPulse/commit/8173324) | 320px–4K responsiveness, touch ergonomics, mobile bottom bar, SEO routes (\`/gold\`, \`/events\`, \`/methodology\`, \`/topics\`), Schema.org JSON-LD. | CLOSED | User request & Git diff |
| **HT-3** | 2026-09 | Codify Agent Operating Protocol & Reasoning Standards | [#4](https://github.com/xuanhao1804/FrabPulse/issues/4) | [\`9675a84\`](https://github.com/xuanhao1804/FrabPulse/commit/9675a84) | 18-point Agent Operating Protocol codified in \`docs/AGENT_PROTOCOL.md\` covering skill discovery, NTFY rules, and verification loops. | CLOSED | Protocol prompt & Git commit |
| **HT-4** | 2026-09 | Integrate Agent Skills Ecosystem | [#5](https://github.com/xuanhao1804/FrabPulse/issues/5) | [\`3d789e4\`](https://github.com/xuanhao1804/FrabPulse/commit/3d789e4) | Installed 8 specialized skills in \`.agents/skills/\` (React best practices, composition patterns, UI taste, UI/UX pro max). | CLOSED | User request & Git diff |
| **HT-5** | 2026-09 | Define Milestone 1.5 Live Ingestion Specifications & Architecture | [#6](https://github.com/xuanhao1804/FrabPulse/issues/6) | [\`7cc01b5\`](https://github.com/xuanhao1804/FrabPulse/commit/7cc01b5) | Specification for Milestone 1.5 in \`docs/SPEC_MILESTONES_AND_TASKS.md\` and \`docs/ROADMAP.md\` covering 4 discrete engineering tasks. | CLOSED | Planning prompt & Git commit |
| **HT-6** | 2026-09 | Implement Multi-Tier Live Price Ingestion & Domestic Failover (Task 1.5.1) | [#7](https://github.com/xuanhao1804/FrabPulse/issues/7) | [\`923a48d\`](https://github.com/xuanhao1804/FrabPulse/commit/923a48d) | SJC web scraper adapter, secondary domestic backup, international spot gold, commercial FX adapter, mock fallback, 6 passing tests. | CLOSED | Milestone 1.5 & Git diff |
| **HT-7** | 2026-09 | Implement Accredited RSS News Ingestion & Deduplication (Task 1.5.2) | [#8](https://github.com/xuanhao1804/FrabPulse/issues/8) | [\`6c07fef\`](https://github.com/xuanhao1804/FrabPulse/commit/6c07fef) | Multi-outlet RSS parser (VnExpress, Tuổi Trẻ, Yahoo Finance), URL normalizer, title sanitizer, Jaccard similarity deduplication, 8 tests. | CLOSED | Milestone 1.5 & Git diff |
| **HT-8** | 2026-09 | Implement Ingestion Scheduler with Trading Hours & Circuit Breaker (Task 1.5.3) | [#9](https://github.com/xuanhao1804/FrabPulse/issues/9) | [\`fc2f69e\`](https://github.com/xuanhao1804/FrabPulse/commit/fc2f69e) | Cron scheduler respecting Vietnam trading hours (ICT 08:30 - 17:00), 3-state Circuit Breaker (\`CLOSED\`, \`OPEN\`, \`HALF_OPEN\`), 7 tests. | CLOSED | Milestone 1.5 & Git diff |
| **HT-9** | 2026-09 | Implement Market Health Radar, Fallback Badges & Data Freshness UI (Task 1.5.4) | [#10](https://github.com/xuanhao1804/FrabPulse/issues/10) | [\`f55da91\`](https://github.com/xuanhao1804/FrabPulse/commit/f55da91), [\`be7e04d\`](https://github.com/xuanhao1804/FrabPulse/commit/be7e04d) | Visual source type badges (\`LIVE_FEED\`, \`SCRAPED_DOMESTIC\`, \`FALLBACK_FIXTURE\`), freshness timestamps, M1.5 completion record, 7 tests. | CLOSED | Milestone 1.5 & Git diff |
| **HT-10** | 2026-09 | Overhaul Financial UI: Dual Light/Dark Theme, Real-time Ticker & Pro Chart | [#11](https://github.com/xuanhao1804/FrabPulse/issues/11) | [`6ebc303`](https://github.com/xuanhao1804/FrabPulse/commit/6ebc303) | Dual theme system (Light/Dark mode with zero FOUC), running MarketTickerTape, 4-KPI gold gap matrix with formula inspector, pro chart (Candlestick/Area, 4 views, MA20, crosshair, CSV export), tabular view toggle. | CLOSED | User feedback & Git diff |
| **HT-11** | 2026-09 | Establish Repository Context Continuity System & Gate 0 Protocol | [#1](https://github.com/xuanhao1804/FrabPulse/issues/1) | [`f31d5ce`](https://github.com/xuanhao1804/FrabPulse/commit/f31d5ce), [`bc025a9`](https://github.com/xuanhao1804/FrabPulse/commit/bc025a9), [`fd220d1`](https://github.com/xuanhao1804/FrabPulse/commit/fd220d1) | `AGENTS.md`, `docs/context/*`, issue template, design spec, historical issues backfilled, Gate 0 PO/BA/Tech Lead protocol codified. | CLOSED | User prompt & implementation |
| **HT-12** | 2026-09 | Multi-Language (i18n) Support (Vietnamese & English) | [#12](https://github.com/xuanhao1804/FrabPulse/issues/12) | [`5531463`](https://github.com/xuanhao1804/FrabPulse/commit/5531463) | Type-safe dual-language system (`vi` default and `en`), zero-FOUC `<head>` sync, `LanguageToggle` button in desktop & mobile nav, complete localization across all dashboard cards/charts/tables, 5 unit tests. | CLOSED | User request & Git diff |
| **HT-13** | 2026-09 | Financial Localization Depth: Dual Timezone, Locale Formatters & Gold Unit Converter | [#13](https://github.com/xuanhao1804/FrabPulse/issues/13) | [`3fb9b8a`](https://github.com/xuanhao1804/FrabPulse/commit/3fb9b8a) | Locale-aware number/currency formatters (`Intl.NumberFormat`), dual timezone switching (ICT UTC+7 vs UTC), interactive Physical Gold Unit Converter (Lượng/Chỉ ↔ Troy Oz/Gram) with live valuation, 12 tests. | CLOSED | User alignment & Git diff |
| **HT-14** | 2026-09 | Financial Terminal Overhaul: TradingView-Style Chart, Stock Typography & De-cluttered Header | [#14](https://github.com/xuanhao1804/FrabPulse/issues/14) | [`e4f6408`](https://github.com/xuanhao1804/FrabPulse/commit/e4f6408), [`3a060bd`](https://github.com/xuanhao1804/FrabPulse/commit/3a060bd) | Clean fintech typography (`Inter` sans-serif, monospace tabular-nums numbers), de-cluttered institutional trading header, TradingView-style Pro chart (data provenance bar, right Y-axis, bottom X-axis, volume histogram, event pins). | CLOSED | User feedback & Gate 0 alignment |
| **HT-15** | 2026-09 | Financial Terminal Pro Chart: High-Density Continuous Cursor Tracking & Investing.com Vibe | [#15](https://github.com/xuanhao1804/FrabPulse/issues/15) | Pending push | 120-point high-density intraday ticks, sub-pixel continuous mouse cursor interpolation (zero jumping), signature Investing.com bottom timeframe return matrix (`1D` to `ALL`), royal blue palette (`#2563EB`), circular `N` news event markers, 4 math tests. | OPEN | User feedback & reference screenshot |

---

## 3. Evidence Limitations & Notes
- Early tasks (HT-1 through HT-5) were executed before the One Task, One Issue policy was introduced; their issues were reconstructed post-hoc with exact commit references.
- All historical issues (#1 through #14) are mapped and closed on GitHub with provenance comments.
- Issue #15 is verified and will be closed upon push.
- Pull Requests: None in repository history (all work merged directly to `main`).
