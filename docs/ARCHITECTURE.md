# FrabPulse — System Architecture

## 1. Architectural Overview

FrabPulse is designed as a **TypeScript Monorepo** managed with `pnpm` workspaces and `turbo`.
The system is built as a **modular monolith** with clean bounded contexts, ensuring high development velocity without premature microservice overhead while enabling future service extraction if horizontal scale demands it.

```text
                                  ┌─────────────────────────────┐
                                  │      Next.js 15 Web App     │
                                  │  (Dashboard, Chart, Events) │
                                  └──────────────▲──────────────┘
                                                 │
                                      HTTP REST  │  SSE Streams
                                                 │
                                  ┌──────────────▼──────────────┐
                                  │       NestJS API Server     │
                                  │      (Modular Monolith)     │
                                  └──────────────┬──────────────┘
                                                 │
             ┌───────────────────┬───────────────┴───────────────┬───────────────────┐
             ▼                   ▼                               ▼                   ▼
    ┌─────────────────┐ ┌─────────────────┐             ┌─────────────────┐ ┌─────────────────┐
    │  Market Data    │ │  News & Crawler │             │ Event Engine    │ │  AI Processing  │
    │  - SJC / DOJI   │ │  - Normalization│             │ - Correlation   │ │  - Provider Abs │
    │  - XAU/USD Spot │ │  - Deduplication│             │ - Clustering    │ │  - Structured   │
    │  - Gap Engine   │ │  - Attribution  │             │ - Timeline      │ │  - Deterministic│
    └────────┬────────┘ └────────┬────────┘             └────────┬────────┘ └────────┬────────┘
             │                   │                               │                   │
             └───────────────────┴───────────────┬───────────────┴───────────────────┘
                                                 ▼
                                  ┌─────────────────────────────┐
                                  │    PostgreSQL Database      │
                                  │       (Prisma ORM)          │
                                  └─────────────────────────────┘
```

---

## 2. Monorepo Structure

```text
frabpulse/
├── apps/
│   ├── web/                     # Next.js 15 App Router, React 19, Tailwind CSS, Lucide
│   └── api/                     # NestJS backend, REST endpoints, SSE stream, Prisma
├── packages/
│   ├── shared/                  # Common TypeScript interfaces, DTOs, Enums, Math utils
│   └── tsconfig/                # Shared tsconfig bases
├── docs/                        # Architecture, vision, AI design, pipeline specs
├── docker/                      # Local PostgreSQL and optional Redis containers
├── .github/workflows/           # CI: install, lint, typecheck, test, build
└── turbo.json                   # Pipeline caching and task orchestration
```

---

## 3. Core Bounded Contexts

| Context | Responsibility | Key Interfaces / Services |
| :--- | :--- | :--- |
| **Market Data** | Manages asset definitions, collects real-time & historical snapshots, computes buy-sell spreads and Vietnam vs. World gold premium. | `IMarketDataProvider`, `MarketDataService`, `GoldGapEngine` |
| **News & Sources** | Ingests articles from verified sources, normalizes timestamps, enforces publisher attribution. | `INewsProvider`, `NewsService`, `DeduplicationService` |
| **Event Intelligence** | Clusters related articles into unified market events, runs temporal correlation engine against price series. | `EventsService`, `CorrelationEngine`, `TimelineService` |
| **AI Intelligence** | Structured information extraction, entity recognition, and source-grounded synthesis without hallucinating causality. | `IAIIntelligenceProvider`, `OpenAIProvider`, `DeterministicLabAIProvider` |
| **Realtime SSE** | Delivers live price updates, new event alerts, and correlation calculations to connected web clients via Server-Sent Events. | `SseController`, `PulseBroadcaster` |

---

## 4. Key Architectural Decisions & Rationale

### 1. Modular Monolith over Microservices
- **Decision:** All domains live in a single NestJS backend (`apps/api`), partitioned into distinct Nest modules (`market-data`, `news`, `events`, `ai`, `sse`).
- **Rationale:** Microservices introduce distributed transaction complexity, network latency, and deployment overhead that hinder early-stage iteration. A modular monolith enforces strict domain boundaries through dependency injection and interfaces, allowing any module to be extracted into a standalone service later with zero schema rewrites.

### 2. Server-Sent Events (SSE) over WebSockets
- **Decision:** Realtime market updates and live event notifications use standard SSE (`/api/v1/sse/pulse`).
- **Rationale:** FrabPulse's primary real-time requirement is **one-way server-to-client broadcasting** (ticks, events, calculations). SSE works over standard HTTP/2, requires no bidirectional connection handshake or ping/pong framing, traverses corporate firewalls seamlessly, and natively supports browser auto-reconnect (`EventSource`). If bidirectional client controls (e.g., collaborative charting) are needed in V3, WebSockets can be introduced alongside SSE.

### 3. Prisma ORM with PostgreSQL
- **Decision:** Prisma ORM on PostgreSQL with strict typing and declarative migrations.
- **Rationale:** Prisma provides end-to-end type safety from database schema to TypeScript models, automated migrations, readable schema DSL, and predictable relational queries for event-article-asset graph joins.

### 4. Deterministic AI Provider Abstraction
- **Decision:** The backend AI layer exposes an `IAIIntelligenceProvider` interface with two implementations: `OpenAIIntelligenceProvider` and `DeterministicLabAIProvider`.
- **Rationale:** The application must run completely offline and locally without requiring paid API keys or exposing developers to network failures. The deterministic provider uses rule-based heuristic extraction and structured fixtures to produce fully realistic, reproducible event syntheses during development and CI.

### 5. Financial Charting Strategy
- **Decision:** Tailored SVG/Canvas responsive financial time-series chart with interactive event markers.
- **Rationale:** Full control over event annotation pins, temporal window highlighting (-30m to +30m post-announcement), and responsive dark-mode lab aesthetic without third-party canvas bundle bloat.
