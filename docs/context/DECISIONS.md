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
- **Related Commit**: Current commit
