# FrabPulse — Agent Operating Protocol

These instructions apply to all future work and autonomous agent sessions in this repository.

> **Core Philosophy**: FrabPulse is **Real-time Event Intelligence**, connecting **events** + **trustworthy sources** + **changing data over time**. It is not a generic price ticker, news aggregator, or open-ended chatbot.

---

## 1. Always Check Available Skills First
Before starting any meaningful task, determine whether an existing specialized skill can improve the result.
Check in this order:
1. **Project/local skills** included in this repository.
2. **User/global skills** available in the agent environment.
3. **Installed plugins/tools/workflows** relevant to the task.

*Trivial operations* (renaming a variable, fixing typos, single CSS value tweaks, running existing commands) do not require skill discovery. Substantial work (UI/UX design, responsive design, architecture, database design, SEO, accessibility, testing, security, performance, data integrations, AI synthesis, specifications) must always consider skill enhancement.

---

## 2. External Skill Discovery
If no suitable local/global skill exists for a substantial task, evaluate whether an external skill/plugin/workflow could materially improve the outcome. Evaluate candidates based on:
- Relevance to the exact task
- Quality / reputation / maintenance / recency
- Documentation quality and compatibility with current stack
- Security permissions and minimal surface area

---

## 3. Ask Before Installing Any External Skill
Never install a new third-party skill/plugin/package solely for agent capability without user approval.
When a useful external skill is discovered, present:
- **Skill**: Name & source
- **Purpose**: What it does
- **Why it improves this task**: Tangible benefits
- **Quality / reputation**: Downloads, rating, maintainer
- **Permissions or risks**: System access / network footprint
- **Alternative if we do not install it**: Fallback strategy

---

## 4. NTFY When Skill Installation Needs Approval
When user approval is required to proceed with an external skill:
```bash
curl -fsS \
  -H "Title: FrabPulse — Skill cần phê duyệt" \
  -H "Tags: package,warning" \
  -H "Priority: high" \
  -d "Antigravity tìm thấy một skill hữu ích cho FrabPulse và đang chờ bạn phê duyệt cài đặt." \
  https://ntfy.sh/haolx_AG_alert
```

---

## 5. High-Reasoning Tasks (PO, BA & Tech Lead Mindset)
Substantial engineering tasks require a deeper reasoning and discovery pass before any code is written:
- **Product Owner (PO)**: Define user personas, core value proposition, success metrics, and MoSCoW scope boundaries (Must, Should, Could, Won't).
- **Business Analyst (BA)**: Elicit detailed user flows, edge cases, financial data formatting rules, and acceptance criteria (Given/When/Then).
- **Tech Lead**: Evaluate architectural trade-offs (pros/cons of competing designs), bundle impact, zero-FOUC state hydration, failure modes, and test matrices.

**MANDATORY RULE**: Never jump straight into code implementation immediately upon receiving a requirement or user prompt. Always conduct this PO/BA/Tech Lead analysis, present options/trade-offs, and align with the user first.

---

## 6. Brainstorming & Alignment Quality Standard
Quality > Quantity. 5 strong, differentiated, technically grounded ideas beat 30 generic concepts.
Follow the pipeline:
$$\text{Understand Problem} \longrightarrow \text{PO Value Check} \longrightarrow \text{BA Flow \& Edge Cases} \longrightarrow \text{Tech Lead Trade-offs} \longrightarrow \text{User Alignment Gate} \longrightarrow \text{Implementation}$$

Always present the synthesized specification and open questions to the user, and obtain alignment before triggering implementation.

---

## 7. Specification Quality Standard
Every feature specification must address:
- **Why** it exists, **who** uses it, **what** problem it solves, and **what success looks like**.
- Technical integration with existing monorepo architecture.
- Full UI states (loading, empty, populated, error).
- Responsive behavior (320px mobile to 4K desktop, min 44px touch targets).
- Accessibility (WCAG 2.1 AA, semantic markup, keyboard navigation).
- SEO & discoverability (Metadata API, JSON-LD structured data).

---

## 8. Task Breakdown Quality Standard
Avoid vague tasks. Break major work into units with:
- Objective
- Relevant files and modules
- Dependencies
- Expected result & acceptance criteria
- Verification method (automated tests, build checks, manual inspection)

---

## 9. Design Tasks Require Extra Care
FrabPulse visual direction:
- **Modern**, **data-driven**, **research-lab inspired**, **professional**, **slightly playful** (frog/lab identity with scientific rigor).
- Information-rich but calm; clean hierarchy without overwhelming the user.
- Mobile-first responsive UX with natural thumb zones and fluid tables/charts.

---

## 10. Product Consistency Check
Always verify against the product thesis:
- **Observed Facts**: Raw prices, spreads, historical time series.
- **Source Claims**: Attributed journalism and regulatory statements.
- **AI Synthesis**: Strict structured extraction and entity linkage; **never claim ungrounded causation**.

---

## 11. Read Project Context Before Major Decisions
Always consult:
- [`README.md`](../README.md)
- [`PROJECT.md`](../PROJECT.md)
- [`docs/VISION.md`](./VISION.md)
- [`docs/ARCHITECTURE.md`](./ARCHITECTURE.md)
- [`docs/ROADMAP.md`](./ROADMAP.md)

---

## 12. Research When Knowledge May Be Stale
For rapidly changing technologies, libraries, and APIs, consult official primary documentation (official framework docs, RFCs, release notes) rather than assuming past behavior.

---

## 13. Dependency Discipline
Evaluate every runtime dependency before adding:
- Is it strictly necessary?
- Can it be solved cleanly with existing monorepo packages?
- What is the bundle size and maintenance overhead?

---

## 14. Self-Review Before Implementation
Run an internal critique pass:
- Is there a simpler, more robust solution?
- Are edge cases handled?
- Does it maintain mobile responsiveness and accessibility?
- Does it avoid technical debt?

---

## 15. Implementation Loop
For substantial development work:
$$\text{Understand} \to \text{Context} \to \text{Skill Inspection} \to \text{Plan} \to \text{Review} \to \text{Implement} \to \text{Lint} \to \text{Typecheck} \to \text{Test} \to \text{Build} \to \text{Inspect} \to \text{Commit}$$

---

## 16. Proportionality & Judgment
- **Small fixes**: Implement and verify immediately.
- **Medium tasks**: Concise architectural plan and rapid execution.
- **Large/High-impact tasks**: Deep planning, skill evaluation, and rigorous review.

---

## 17. NTFY Notification Workflows
Send notifications to `https://ntfy.sh/haolx_AG_alert`:

- **Upon verified completion of major tasks**:
  ```bash
  curl -fsS \
    -H "Title: FrabPulse — Antigravity" \
    -H "Tags: white_check_mark,computer" \
    -d "FrabPulse: Antigravity đã hoàn thành task. Có thể quay lại kiểm tra." \
    https://ntfy.sh/haolx_AG_alert
  ```

- **When blocked or awaiting user input**:
  ```bash
  curl -fsS \
    -H "Title: FrabPulse — Cần bạn xử lý" \
    -H "Tags: warning,computer" \
    -H "Priority: high" \
    -d "Antigravity đang chờ input hoặc thao tác từ bạn. Hãy quay lại máy kiểm tra." \
    https://ntfy.sh/haolx_AG_alert
  ```

---

## 18. Core Agent Principle
> **Do not optimize for finishing as quickly as possible.**  
> **Optimize for producing the strongest reasonable result while keeping the solution practical, maintainable, and aligned with FrabPulse.**
