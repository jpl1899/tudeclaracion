# `.context/PRD/` — Product Requirements (Phase 2 — Product)

Outputs of `/project-foundation` Phase 2 — Architecture (Product side). Turns the Constitution (`.context/business/business-model.md` + `.context/business/market-context.md`) into a buildable product spec.

> **Structure override**: this project uses a custom 8-file structure (explicit user request, 2026-07-02) instead of the skill's default 4-file template — same pattern as `.context/SRS/` and `.context/tax-rules/`. Kept below only as historical reference.

## Actual files (custom structure, user-requested)

| File | Purpose |
| ---- | ------- |
| `product-overview.md` | Problem statement, solution overview, value proposition, success metrics, target users summary |
| `user-personas.md` | Target users — demographics, goals, pain points, tech savviness |
| `business-flow.md` | End-to-end flow from the USER's perspective (distinct from `SRS/01-system-overview.md`'s technical module pipeline — keep both in sync) |
| `mvp-scope.md` | Epic/story breakdown — must-have / out-of-scope, success criteria |
| `user-journeys.md` | Happy path + edge cases per persona |
| `functional-requirements.md` | Atomic, testable `FR-XX` requirements — detail layer under `mvp-scope.md`'s epics, avoid duplicating |
| `non-functional-requirements.md` | Performance, usability, reliability, security, extensibility `NFR-XX` |
| `future-roadmap.md` | Explicitly out-of-MVP items contemplated for later (not prioritized, not a commitment) |

All files are grounded in `.context/business/business-model.md`, `ADR-0001-modular-reusable-tax-platform.md`, and decisions confirmed in conversation — unconfirmed content is explicitly marked `Propuesta a validar` / `Pendiente`, never fabricated.

## Default template (superseded, kept for reference)

| File                     | Purpose                                                          |
| ------------------------ | ---------------------------------------------------------------- |
| `executive-summary.md`   | Problem statement, solution overview, success KPIs, MVP metrics  |
| `user-personas.md`       | Target users — demographics, jobs-to-be-done, pain points        |
| `mvp-scope.md`           | Epic breakdown — must-have / should-have / could-have stories    |
| `user-journeys.md`       | Happy paths, alternate flows, edge cases per persona             |

Skill references that drive generation:
- `.claude/skills/project-foundation/references/prd-executive-summary.md`
- `.claude/skills/project-foundation/references/prd-personas.md`
- `.claude/skills/project-foundation/references/prd-mvp-scope.md`
- `.claude/skills/project-foundation/references/prd-user-journeys.md`

## Outcome

A complete product specification ready for SRS (technical contract) and `/product-management` (backlog seeding).

## When to re-run

- Major scope change
- New persona added
- MVP re-cut

Otherwise, this directory is written once and refined per phase.
