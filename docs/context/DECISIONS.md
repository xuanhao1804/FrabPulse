# Architectural Decision Records (ADR-Lite)

**File**: \`docs/context/DECISIONS.md\`  
**Status**: Authoritative Architectural History  
**Last Updated**: 2026-09-26  

---

## ADR-001: Epistemological Separation of Market Facts, Source Narratives & AI Synthesis
- **Date**: 2026-09-26
- **Context**: Financial portals often conflate price changes with subjective journalist speculations (e.g. asserting that gold fell 'because of' a speech when other factors were in play).
- **Decision**: Architecturally isolate all data into 3 distinct operational layers:
  1. *Layer 1 (Observed Facts)*: Raw price ticks, mathematical deltas, timestamps. Zero opinions.
  2. *Layer 2 (Source Interpretations)*: Verbatim quotes and attributed viewpoints from accredited publishers with source links.
  3. *Layer 3 (AI Synthesis)*: Algorithmic extraction of consensus without platform-generated causal claims.
- **Rationale**: Eliminates hallucinated causality, maintains institutional credibility, and provides defensible transparency.
- **Consequences**: API payloads and UI components must structure events according to these three layers.
- **Related Issue**: [#2](https://github.com/xuanhao1804/FrabPulse/issues/2)
- **Related Commit**: [\`6752314\`](https://github.com/xuanhao1804/FrabPulse/commit/6752314)

---

## ADR-002: Fixed Mathematical Conversion Constant for Vietnamese Gold Arbitrage
- **Date**: 2026-09-26
- **Context**: Domestic gold in Vietnam is quoted in *lượng* ($37.5\text{ g}$), whereas global gold is quoted in *troy ounces* ($31.1034768\text{ g}$).
- **Decision**: Define the conversion constant as exactly $1.20565$ in \`@frabpulse/shared/src/formulas.ts\`.
- **Rationale**: Prevents discrepancies across backend and frontend calculations; based on precise physical mass.
- **Consequences**: Arbitrage formula is deterministic: $\text{World VND} = \text{XAU/USD} \times \text{USD/VND} \times 1.20565$.
- **Related Issue**: [#2](https://github.com/xuanhao1804/FrabPulse/issues/2)
- **Related Commit**: [\`6752314\`](https://github.com/xuanhao1804/FrabPulse/commit/6752314)

---

## ADR-003: Mobile-First Responsive Ergonomics & Static SEO Routes
- **Date**: 2026-09-26
- **Context**: Initial dashboard was desktop-centric, making handheld navigation cumbersome.
- **Decision**: Standardize on mobile-first Tailwind design from 320px width upward, enforce 44px minimum touch targets, provide mobile bottom navigation, and generate static SEO routes (\`/gold\`, \`/events\`, \`/methodology\`, \`/topics\`).
- **Rationale**: Financial monitoring is predominantly conducted on handheld devices during market hours.
- **Consequences**: All future dashboard components must be verified against mobile viewport constraints.
- **Related Issue**: [#3](https://github.com/xuanhao1804/FrabPulse/issues/3)
- **Related Commit**: [\`8173324\`](https://github.com/xuanhao1804/FrabPulse/commit/8173324)

---

## ADR-004: Multi-Tier Resilient Price Ingestion & Offline Safety Net
- **Date**: 2026-09-26
- **Context**: Domestic gold providers (SJC, DOJI) lack open, reliable REST APIs and frequently suffer from network downtime or structural HTML changes.
- **Decision**: Implement multi-tier priority failover: primary web scraper (\`VangTodayDomesticProvider\`) $\to$ secondary fallback (\`SjcvnDomesticProvider\`) $\to$ deterministic \`MockFallbackProvider\`.
- **Rationale**: The application must never crash or display blank screens when third-party endpoints go down.
- **Consequences**: Every price snapshot contains a \`sourceType\` flag informing the client whether data is live, cached, or fallback.
- **Related Issue**: [#7](https://github.com/xuanhao1804/FrabPulse/issues/7)
- **Related Commit**: [\`923a48d\`](https://github.com/xuanhao1804/FrabPulse/commit/923a48d)

---

## ADR-005: 3-State Circuit Breaker & Vietnam Trading Hours Scheduler
- **Date**: 2026-09-26
- **Context**: Continuously hammering upstream scraping targets during weekends and nights leads to rate-limiting and wasted server compute.
- **Decision**: Implement a 3-state Circuit Breaker (\`CLOSED\`, \`OPEN\`, \`HALF_OPEN\`) and an adaptive scheduler that slows polling during off-hours while ramping up during Vietnam trading sessions (ICT 08:30 - 17:00 weekdays).
- **Rationale**: Protects IP reputation and resources while ensuring fast updates during peak market volatility.
- **Consequences**: Ingestion automatically fast-fails during outages and transitions to probe mode after a cooldown.
- **Related Issue**: [#9](https://github.com/xuanhao1804/FrabPulse/issues/9)
- **Related Commit**: [\`fc2f69e\`](https://github.com/xuanhao1804/FrabPulse/commit/fc2f69e)

---

## ADR-006: Dual Light & Dark Theme System with Zero-FOUC Architecture
- **Date**: 2026-09-26
- **Context**: Users requested both an institutional terminal dark mode and a bright, vibrant stock exchange light mode.
- **Decision**: Implement a custom React \`ThemeProvider\` syncing with \`localStorage\` and \`prefers-color-scheme\`, accompanied by an inline synchronous script in \`<head>\` of \`layout.tsx\`.
- **Rationale**: Eliminates the Flash of Unstyled Content (FOUC) while giving users complete control over aesthetic preference.
- **Consequences**: All UI components must use dual Tailwind classes (e.g. \`bg-white dark:bg-pulse-900\`).
- **Related Issue**: [#11](https://github.com/xuanhao1804/FrabPulse/issues/11)
- **Related Commit**: [\`6ebc303\`](https://github.com/xuanhao1804/FrabPulse/commit/6ebc303)

---

## ADR-007: One Task, One GitHub Issue Context Continuity Architecture
- **Date**: 2026-09-26
- **Context**: Ephemeral agent chat sessions lack persistent memory across context window resets or developer sessions.
- **Decision**: Bind every top-level engineering task to a single GitHub Issue. Backfill all 10 historical tasks into closed GitHub Issues and maintain \`AGENTS.md\` and \`docs/context/*\` as authoritative memory.
- **Rationale**: Git history and GitHub Issues are durable, searchable, cryptographically anchored, and accessible to any agent or engineer.
- **Consequences**: All future agent work must check context files first, create/link a GitHub Issue, and update context files before closing.
- **Related Issue**: [#1](https://github.com/xuanhao1804/FrabPulse/issues/1)
- **Related Commit**: [`f31d5ce`](https://github.com/xuanhao1804/FrabPulse/commit/f31d5ce)

---

## ADR-008: Type-Safe Dual-Language (VI/EN) i18n Architecture with Zero-FOUC Synchronization
- **Date**: 2026-09-26
- **Context**: Vietnamese domestic gold markets require native terminology (lượng, chỉ, giá mua vào/bán ra, chênh lệch), while global users require standard international finance terms (troy oz, bid, ask, spread, arbitrage).
- **Decision**: Implement a lightweight, type-safe React Context (`LanguageProvider` + `useLanguage`) with typed dictionary parity (`vi` default and `en`), persistent `localStorage` storage (`frabpulse-locale`), synchronous `<head>` script to prevent language flashing, accessible 44px `<LanguageToggle />` button, and dynamic `document.documentElement.lang` syncing.
- **Rationale**: Zero external runtime bundle bloat (no bloated third-party frameworks), compile-time key verification via `DeepString<typeof translations['vi']>`, zero hydration mismatch, and instant toggle without full page reloads.
- **Consequences**: All new user-facing UI copy must be added with exact key symmetry to both `vi` and `en` in `translations.ts`. Verified by automated parity tests in `apps/web/test/i18n.test.ts`.
- **Related Issue**: [#12](https://github.com/xuanhao1804/FrabPulse/issues/12)
- **Related Commit**: [`5531463`](https://github.com/xuanhao1804/FrabPulse/commit/5531463)

---

## ADR-009: Financial Market Localization Depth: Dual Timezone (ICT/UTC), Locale-Aware Formatters & Gold Unit Converter
- **Date**: 2026-09-26
- **Context**: Standard string translation alone is insufficient for professional gold arbitrage traders and Vietnamese domestic buyers. Users require exact domestic thousand/decimal separators (`.` vs `,`), dual timezone awareness (ICT UTC+7 for domestic banking/trading vs UTC for global commodity markets), and an interactive physical mass converter reconciling Vietnamese retail gold units (lượng/cây, chỉ) with international commodity standards (troy ounce, gram, kg).
- **Decision**:
  1. Implement native `Intl.NumberFormat`-backed formatters (`formatPriceLocale`, `formatSpreadLocale`, `formatPercentLocale`, `formatNumberLocale`) ensuring `vi-VN` formatting uses dot separators (`89.500.000 ₫`) and `en-US` uses comma separators (`$2,650.50`).
  2. Author authoritative physical mass constants in `@frabpulse/shared` (`GRAMS_PER_TAEL = 37.5`, `GRAMS_PER_CHI = 3.75`, `GRAMS_PER_TROY_OZ = 31.1034768`) and functions `convertGoldWeight` and `estimateGoldValue`.
  3. Expand `LanguageContext` with `timezone: 'ICT' | 'UTC'`, `toggleTimezone`, and `localStorage` persistence (`frabpulse-timezone`).
  4. Build `<TimezoneToggle />` component with accessible 44px min-touch target and wire active timezone into `<PriceEventChart />` crosshairs/event markers and `<LiveEventsFeed />` timestamps.
  5. Build interactive `<GoldUnitConverter />` with quick-select presets (`1 Chỉ`, `5 Chỉ`, `1 Lượng`, `10 Lượng`, `1 Troy Oz`, `100g`, `1kg`), live valuation in VND/USD from active SJC & spot prices, and physical formula notes.
- **Rationale**: Keeps domain calculations centralized and mathematically authoritative in `@frabpulse/shared`, avoids heavy external date/math libraries, prevents hydration mismatches, and delivers high-utility financial tooling directly into the trader dashboard.
- **Consequences**: All future price, spread, and date displays must pass active `language` and `timezone` context through locale formatters.
- **Related Issue**: [#13](https://github.com/xuanhao1804/FrabPulse/issues/13)
- **Related Commit**: [`3fb9b8a`](https://github.com/xuanhao1804/FrabPulse/commit/3fb9b8a)

---

## ADR-010: Financial Terminal Interface Overhaul: Stock Exchange Typography, De-cluttered Header & Pro Chart with Data Provenance
- **Date**: 2026-09-26
- **Context**: User evaluation identified critical UX deficiencies: pervasive monospace font distorted Vietnamese diacritics and created a robotic aesthetic; the chart was overly simplistic without volume, axes, or data source transparency; and the header was cluttered with 9 competing boxed button pills.
- **Decision**:
  1. Transition global UI typography to clean, modern sans-serif (`next/font/google` `Inter` with system fallbacks) for all labels, headings, navigation, and descriptions. Restrict `font-mono` exclusively to numeric digits, prices, volumes, and percentages using `tabular-nums`.
  2. De-clutter navigation header: eliminate bulky boxed pill borders around menu links, replacing them with flat financial text navigation and unifying right-side utility controls into a quiet, cohesive control cluster.
  3. Overhaul financial chart to professional stock exchange standards (TradingView/SSI/TCBS style):
     - Integrated volume histogram sub-chart with color-coded buy/sell pressure bars.
     - Dedicated right Y-axis price scale with 5 horizontal gridlines and a real-time current price tag.
     - Dedicated bottom X-axis time scale with timezone-aware timeline ticks.
     - Smooth cubic Bézier spline interpolation in Area mode.
     - Prominent **Data Provenance & Source Attribution Bar** documenting Kitco spot gold, SJC Miền Nam, Vietcombank FX, and live SSE stream refresh frequency.
- **Rationale**: Elevates FrabPulse from a prototype to an institutional-grade financial intelligence terminal, delivering transparent source attribution, high usability, and professional aesthetic rigor.
- **Consequences**: Future chart indicators and UI panels must adhere to the sans-serif UI + tabular-nums data convention and preserve the right-axis coordinate geometry.
- **Related Issue**: [#14](https://github.com/xuanhao1804/FrabPulse/issues/14)
- **Related Commit**: [`e4f6408`](https://github.com/xuanhao1804/FrabPulse/commit/e4f6408)

---

## ADR-011: Financial Terminal Pro Chart: High-Density Continuous Cursor Tracking & Investing.com Style Vibe
- **Date**: 2026-09-26
- **Context**: User feedback identified that hovering over the financial chart resulted in discrete jumping between widely spaced points rather than the continuous, fluid tracking expected in professional trading platforms like Investing.com and TradingView. Furthermore, user requested close adherence to the Investing.com visual hierarchy and return metrics bar.
- **Decision**:
  1. Increase historical data resolution to 120 high-density points (12-minute intervals across 24h) in both seed generation and client fallbacks.
  2. Implement a continuous sub-pixel mouse interpolation engine: on cursor movement, calculate fractional indices and linearly interpolate price $Y(X)$ and timestamp $T(X)$ at sub-pixel granularity. The vertical crosshair, horizontal line, active price circle, and tooltips glide at 60fps without any discrete stepping.
  3. Adopt the signature Investing.com layout:
     - Bottom timeframe return matrix (`1D`, `1W`, `1M`, `3M`, `6M`, `1Y`, `5Y`, `ALL`) with color-coded % returns.
     - Royal Blue palette (`#2563EB`) with subtle area gradient for international spot gold, Emerald (`#10B981`) for domestic SJC, and Amber (`#F59E0B`) for gold gap.
     - Benchmark current price dashed horizontal line across the canvas with active price tag pill on the right scale.
     - Circular `N` news event markers positioned along the bottom timeline.
     - Clean sub-navigation tabs (`Tổng quan`, `Dữ liệu Lịch sử`, `Phân tích Kỹ thuật`, `Công cụ Quy đổi`) and quick `Mua` / `Bán` terminal action badges.
- **Rationale**: Eliminates discrete stepping without adding heavy third-party Canvas charting dependencies, preserving zero-FOUC, SSR compatibility, light bundle footprint, and full theme reactivity.
- **Consequences**: Future chart modes must calculate continuous hover coordinates via the sub-pixel interpolation engine rather than index rounding.
- **Related Issue**: [#15](https://github.com/xuanhao1804/FrabPulse/issues/15)
- **Related Commit**: Pending commit




