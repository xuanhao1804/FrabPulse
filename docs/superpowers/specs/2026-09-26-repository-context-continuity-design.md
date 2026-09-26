# Design Spec: Repository Context Continuity Architecture

**Document ID**: `SPEC-CONTEXT-CONTINUITY-001`  
**Date**: 2026-09-26  
**Status**: Approved & Implemented  
**Scope**: FrabPulse Monorepo (\`xuanhao1804/FrabPulse\`)  

---

## 1. Executive Summary & Objective

In fast-moving agentic engineering environments, relying on ephemeral chat histories causes context drift, hallucinated requirements, duplicate work, and architectural erosion whenever an agent's memory window truncates or a fresh chat session starts.

The **Repository Context Continuity System** converts Git history, GitHub Issues, and standardized markdown context files into a durable, self-contained long-term memory for FrabPulse. 

After implementation, any fresh agent or developer session can start with a completely empty chat window and immediately understand:
1. The exact product mission and domain invariants.
2. The current codebase architecture and operational entry points.
3. Historical decisions, rejected alternatives, and approved rationale.
4. Active work in progress, blockers, and next steps.
5. The strict 'One Task, One GitHub Issue' workflow.

---

## 2. Hierarchy of Truth

When sources disagree, agents and engineers must resolve conflicts according to this strict hierarchy:

1. **Current Code & Configuration (Supreme Truth)**: What actually compiles, runs, passes tests, and controls runtime behavior.
2. **Git Commit History**: Cryptographically verifiable proof of what was changed, by whom, and when.
3. **GitHub Issues & PRs**: Durable records of intent, acceptance criteria, review discussions, and outcomes.
4. **Context Files (\`docs/context/*\`)**: Curated, verified operational summaries synced with code.
5. **Architectural & Design Documentation**: Conceptual blueprints and design specifications.
6. **Chat Transcripts & Scratch Logs (Ephemeral)**: Supportive evidence only; never authoritative if contradicted by code.

---

## 3. Bootstrap Behavior

When a fresh agent session boots in this repository:
1. It looks for \`AGENTS.md\` at the Git root.
2. If \`AGENTS.md\` does not exist, the repository enters bootstrap mode: the agent surveys Git history, active code, and remotes, creates \`AGENTS.md\` and \`docs/context/*\`, and commits them.
3. If \`AGENTS.md\` exists, the agent must read the specified context files in sequential order before modifying files or answering complex architectural inquiries.

---

## 4. Context Architecture

The context layer is organized into lightweight, specialized markdown files to maintain high signal-to-noise ratio:

```
FRABPULSE/
├── AGENTS.md                                # Mandatory entry point for all agents
├── .github/
│   └── ISSUE_TEMPLATE/
│       └── codex-task.md                   # Standardized GitHub Issue template
└── docs/
    ├── AGENT_PROTOCOL.md                    # 18-point behavioral and reasoning rules
    ├── context/
    │   ├── PROJECT.md                       # Stable project facts & architecture
    │   ├── CURRENT.md                       # Dynamic status, active issue & next steps
    │   ├── DECISIONS.md                     # ADR-lite architectural decision ledger
    │   ├── HISTORY.md                       # Canonical historical task index
    │   └── sessions/
    │       └── 2026-09.md                   # Chronological task completion entries
    └── superpowers/
        └── specs/
            └── 2026-09-26-repository-context-continuity-design.md
```

### Context Files Breakdown:
- **\`AGENTS.md\`**: Compact (< 150 lines) entry point instructing the agent on pre-task reading, issue coordination, and verification steps.
- **\`docs/context/PROJECT.md\`**: Immutable or slow-changing facts: project vision, stack, commands, structure, data flow, invariants.
- **\`docs/context/CURRENT.md\`**: High-velocity status: active issue, current branch, test baseline, WIP, blockers, next action.
- **\`docs/context/DECISIONS.md\`**: Architectural Decision Records (ADR-lite) recording Context, Decision, Rationale, and Consequences.
- **\`docs/context/HISTORY.md\`**: Master timeline linking logical tasks to real GitHub Issue numbers, commit hashes, and outcomes.
- **\`docs/context/sessions/YYYY-MM.md\`**: Append-only log of completed tasks with objective, outcome, verification, and commit hash.

---

## 5. One Task, One GitHub Issue Protocol

To eliminate fragmented tracking and prevent ghost tasks:
1. **Single Top-Level Issue**: Every distinct engineering task with an independent objective and outcome must map to exactly one GitHub Issue.
2. **Issue Lifecycle**:
   - Create Issue upon clarifying objective and scope.
   - Clarifications, bug fixes, refactoring, and follow-ups serving the *same outcome* remain on the existing Issue.
   - Commit messages reference the Issue (e.g. \`feat(web): ... (#1)\`).
   - The Issue remains **OPEN** while work is in progress, uncommitted, or unpushed.
   - Post an outcome comment before closing: Outcome, Verification, Pushed Commit SHA.
   - Close the Issue **only after** a successful \`git push\`.

---

## 6. Historical Reconstruction Strategy

For repositories bootstrapped before the issue protocol was introduced:
1. Examine all commits in scope from initial commit to cutoff.
2. Group commits by logical task and outcome (not 1:1 commit-to-issue).
3. Assign each commit in scope to exactly one logical task ($M_{\text{missing}} = 0, D_{\text{duplicate}} = 0$).
4. Create historical issues with label \`historical-task\`, title \`[Historical] <Task Title>\`, detailed reconstruction notice, and commit links.
5. Post a confirmation comment and immediately close completed historical issues.
6. Populate \`docs/context/HISTORY.md\` with actual GitHub Issue numbers.

---

## 7. Context Synchronization Lifecycle

Before declaring any repository task finished:
1. Run verification commands (\`npm run typecheck\`, \`npm run test\`, \`npm run build\`).
2. Update \`docs/context/CURRENT.md\` with latest status.
3. Append any durable technical choices to \`docs/context/DECISIONS.md\`.
4. Append completed task entry to \`docs/context/sessions/YYYY-MM.md\`.
5. Stage only task-related files.
6. Commit with issue reference in message.
7. Push upstream to \`origin/main\`.
8. Post outcome summary comment on the active GitHub Issue and close it.

---

## 8. Security, Secrets & Privacy Guardrails

- Never commit raw chat transcripts, internal prompt directives, or assistant system prompts.
- Never commit credentials, tokens, cookies, or unmasked \`.env\` values.
- Maintain documentation integrity: do not wipe existing valid guidelines.
- Relative paths are preferred for all repository documentation links.
