# FrabPulse Project Manifest

## Project Identity
- **Name:** FrabPulse
- **Etymology:** Frab (Frog + Lab) + Pulse (Market & Event Heartbeat)
- **Tagline:** Real-time Event Intelligence — Understand what moves, when it moves.
- **Initial Vertical:** Gold Pulse (SJC, DOJI, PNJ, XAU/USD, USD/VND, Event Correlation)

## Architecture Overview
- **Workspace:** Monorepo using `pnpm` workspaces + `turbo`
- **Backend:** NestJS 11+ (`apps/api`)
- **Frontend:** Next.js 15+ App Router, React 19, Tailwind CSS (`apps/web`)
- **Shared:** Common DTOs, TypeScript interfaces, conversion formulas (`packages/shared`)
- **Database:** PostgreSQL with Prisma ORM
- **Realtime:** Server-Sent Events (SSE) `/api/v1/sse/pulse`
- **AI Processing:** `IAIIntelligenceProvider` abstraction (OpenAI + DeterministicLabAIProvider)

## Directory Structure
```text
frabpulse/
├── apps/
│   ├── api/                     # NestJS backend
│   └── web/                     # Next.js frontend
├── packages/
│   ├── shared/                  # Common domain contracts
│   └── tsconfig/                # Common TypeScript configs
├── docs/                        # Specifications & architectural guides
├── docker/                      # Local docker-compose configuration
├── .github/workflows/           # CI pipelines
├── .env.example                 # Root environment template
├── turbo.json                   # Turborepo task pipeline
└── package.json                 # Monorepo root manifest
```

## Key Commands
- `pnpm install` — Install all workspace dependencies
- `pnpm dev` — Run web and api in development mode concurrently
- `pnpm build` — Build all packages and applications
- `pnpm lint` — Run ESLint across all workspaces
- `pnpm test` — Run unit and integration tests
- `pnpm db:generate` — Generate Prisma client
- `pnpm db:seed` — Populate database with realistic fixture data
