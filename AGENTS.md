# FrabPulse — Agent Operating & Context Continuity Guide

This file is the **mandatory entry point** for all autonomous agents, Codex sessions, and contributors working in \`xuanhao1804/FrabPulse\`.

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
