# FrabPulse — Agent Operating & Context Continuity Guide

This file is the **mandatory entry point** for all autonomous agents, Codex sessions, and contributors working in \`xuanhao1804/FrabPulse\`.

---

## 0. Gate 0: PO, BA & Tech Lead Brainstorming & Requirements Alignment (MANDATORY)

**NEVER jump directly into coding or implementation upon receiving a user request, idea, or feature requirement.**  
Acting solely as a code generator without thorough product thinking leads to superficial, misaligned, and fragile software. Every meaningful task MUST pass through the triple-lens discovery gate:

1. **Product Owner (PO) Lens — Value & Scope Prioritization**:
   - **Target Users & Personas**: Who benefits? (e.g., Vietnamese domestic retail gold buyers, bullion dealers, macro economists, international commodity arbitrageurs).
   - **Problem & Value Proposition**: What real user problem is being solved? Why does this feature matter?
   - **Scope Boundaries (MoSCoW)**:
     - *Must-Have*: Core capability required for MVP outcome.
     - *Should-Have*: High-impact usability enhancements.
     - *Could-Have*: Future optimizations.
     - *Won't-Have (Out of scope)*: Explicit anti-goals to prevent scope creep.
   - **Success Metrics & KPIs**: How do we measure whether the feature is complete and effective?

2. **Business Analyst (BA) Lens — Functional Specs & Edge Cases**:
   - **User Journeys & Interaction Flows**: Step-by-step user behavior across screen sizes (mobile, tablet, desktop).
   - **Functional Specifications**: Data models, terminology glossary, formula definitions, input validation rules.
   - **Localization & Formatting Nuances**: Number conventions (e.g., dot vs. comma separators), currency signs, timezone offsets (ICT UTC+7 vs. UTC vs. NY), multi-language content fallbacks.
   - **Edge Cases & Failure Scenarios**: Network timeouts, missing translation keys, partial API payloads, stale cache states, extreme market spreads.
   - **Acceptance Criteria (ACs)**: Written in structured Given-When-Then format before implementation begins.

3. **Tech Lead Lens — Architectural Integrity & Trade-offs**:
   - **Architecture & Pattern Selection**: Evaluate at least 2–3 viable approaches, comparing trade-offs, complexity, bundle size, and long-term maintainability.
   - **Performance, Hydration & Zero-FOUC**: Verify SSR/SSG compatibility, avoid hydration mismatches, optimize rendering performance.
   - **Failure Modes & Circuit Breaking**: Define fallbacks, error boundaries, and degradation paths.
   - **Test & Verification Matrix**: Specify unit, integration, and E2E test coverage required to prevent regressions.

4. **The Alignment Gate**:
   - Synthesize the findings into a clear, structured Brainstorming & Requirement Specification.
   - Highlight open questions, trade-offs, and design options.
   - **Request and await user review/approval** before writing code or creating issues.

---

## 1. Start Every Task (Pre-Flight Context Sequence)

Before making file edits or proposing major code changes:

1. **Read Stable Architecture**: Review [\`docs/context/PROJECT.md\`](./docs/context/PROJECT.md) for tech stack, entry points, data flows, and domain formulas ($1.20565$ conversion ratio).
2. **Read Active Status**: Review [\`docs/context/CURRENT.md\`](./docs/context/CURRENT.md) for active issue, branch state, recent incidents, and next recommended actions.
3. **Check Architectural Decisions**: Review [\`docs/context/DECISIONS.md\`](./docs/context/DECISIONS.md) if the task touches data layers, theme rules, circuit breakers, or domain math.
4. **Inspect Historical Provenance**: Review [\`docs/context/HISTORY.md\`](./docs/context/HISTORY.md) if the task continues previous milestone tasks or depends on prior commits.
5. **CodeGraph First**: If \`.codegraph/\` exists, query CodeGraph before using broad grep/find across the repo.
6. **Code/Config is Supreme**: If documentation conflicts with running code/tests, the code is authoritative. Flag stale documentation in \`CURRENT.md\`.
7. **Skill & Protocol Rules**: Comply with the 18-point protocol in [\`docs/AGENT_PROTOCOL.md\`](./docs/AGENT_PROTOCOL.md) (check local/global skills first, request approval before installing new external skills, alert via NTFY on high-priority gates).

---

## 2. One Task, One GitHub Issue Protocol

Every top-level engineering task with an independent objective and outcome must map to **exactly one GitHub Issue**:

- **Create Issue Early**: Use template [\`.github/ISSUE_TEMPLATE/codex-task.md\`](./.github/ISSUE_TEMPLATE/codex-task.md) once objective and scope are clear.
- **Single Thread of Work**: Clarifications, bug fixes, test adjustments, and follow-ups serving the *same outcome* must reuse the active Issue. Do not create new issues for sub-steps or commits.
- **Lifecycle**: Keep the Issue **OPEN** while work is in progress, uncommitted, or unpushed.
- **Completion Comment**: Before closing, comment with:
  - Concise outcome summary.
  - Verification commands and results.
  - Commit SHA(s) pushed.
- **Close on Push Only**: Close the Issue **only after** \`git push\` succeeds.
- **Offline / GitHub Unavailable**: If GitHub CLI is unavailable, proceed safely locally, record the missing sync in \`CURRENT.md\`, and notify the user.

---

## 3. Keep Context Current

Before completing any repository-related task:

- **\`PROJECT.md\`**: Update only when architectural invariants, commands, routes, or stacks change.
- **\`CURRENT.md\`**: Update active task, test baseline, WIP, and next recommended actions.
- **\`DECISIONS.md\`**: Append ADR-lite entry for any durable technical choices or trade-offs.
- **\`docs/context/sessions/YYYY-MM.md\`**: Append a concise session completion entry with date, issue, objective, outcome, verification, and commit SHA.
- **Cleanliness**: Never commit raw chat transcripts, internal prompts, temporary tokens, or \`.env\` contents.

---

## 4. Verification & Publish Standard

Run standard verification before every commit:

\`\`\`bash
npm run typecheck  # TypeScript compiler check
npm run test       # Vitest unit & integration test suites
npm run build      # Turborepo production build
\`\`\`

- **Commit Hygiene**: Reference the active GitHub Issue in the commit message (e.g. \`feat(news): ... (#8)\`).
- **Push Upstream**: Push automatically to current upstream branch (\`origin/main\`).
- **Failure Recovery**: If build, commit, or push fails, do not rollback work. Keep the Issue open, record the blocker and recovery steps in \`CURRENT.md\`, and inform the user.
