# `.context/ADR/` — Architecture Decision Records

Append-only log of the **important, hard-to-reverse** architectural decisions made on this project. One file per decision. Decisions are never deleted — they are **superseded** by newer ADRs that link back, so the history of _why the system is the way it is_ stays intact.

The point: a future human or AI session can read these instead of re-litigating a settled decision or silently violating an invariant it didn't know existed.

---

## What an ADR is (and is not)

An ADR captures a single decision: the context that forced it, the option chosen, the alternatives rejected, and the consequences the team accepted. It is a **source-of-truth document**, not a cache — nothing regenerates it, and it is committed to git like code.

It is the right artifact when a decision passes **both** gates:

| Gate                  | Question                                                                                              |
| --------------------- | ---------------------------------------------------------------------------------------------------- |
| **1 — Architectural** | Does it shape system structure, a cross-cutting concern, or a system-wide invariant?                 |
| **2 — Hard to reverse** | Would changing it later mean touching many files, migrating data, or coordinating across the team? |

Examples that earn an ADR: auth/authorization model, data-access pattern, error/response contract, multi-tenancy model, state-management approach, API style (REST vs RPC vs GraphQL), a framework/library choice with real lock-in, deployment topology, a cross-cutting invariant every feature must uphold.

**NOT an ADR** (these have other homes):

- Bug fixes and their root causes → engram `mem_save` + the story's `bug-fix.md`.
- Local refactors, naming tweaks, formatting → just the commit.
- Single-use code or speculative abstraction → no record needed.
- **Story-local technical decisions** (which hook, which component, a one-file trade-off) → they stay in that story's `implementation-plan.md` under `## Technical Decisions`. Promote one to an ADR **only** when it passes both gates above.

---

## Status lifecycle

```
Proposed ──→ Accepted ──→ Superseded   (by ADR-NNNN, which links back)
                   └────→ Deprecated   (no longer applies; nothing replaces it)
```

- **Proposed** — drafted, under discussion, not yet binding.
- **Accepted** — binding. Downstream work must honor it.
- **Superseded** — a newer ADR replaces it. Set `Superseded by: ADR-NNNN`; the new ADR sets `Supersedes: ADR-MMMM`. **Do not edit the old decision body** — leave it as the historical record.
- **Deprecated** — the decision no longer applies and nothing replaces it (e.g. the feature was removed).

**Append-only.** Never delete an ADR file. Never rewrite a decision after it is Accepted — supersede it with a new one. The only in-place edit allowed on an Accepted ADR is flipping its `Status` line and adding the `Superseded by` / `Deprecated` pointer.

---

## How to write one

1. Copy [`ADR-NNNN-template.md`](./ADR-NNNN-template.md) to `ADR-<NNNN>-<slug>.md`.
   - `<NNNN>` = next free 4-digit number, zero-padded (`0001`, `0002`, …). Numbers are never reused.
   - `<slug>` = short kebab-case summary (`unified-api-authentication`, `event-sourced-orders`).
2. Fill every section. If a decision is still open, set `Status: Proposed` and say what's unresolved.
3. Add a row to the **Index** below.
4. If it supersedes an existing ADR, wire both directions (`Supersedes` / `Superseded by`) and flip the old one's `Status`.

Who authors: a human architect directly, **or** an AI workflow that detected an ADR-worthy decision and drafted it for human approval — `/project-foundation` (SRS architecture phase, seeds the first batch) and `/sprint-development` (Stage 1 planning, promotes a story/feature decision that passes both gates). Either way, the human approves before `Status: Accepted`. The detection + authoring procedure for AI workflows lives in `.claude/skills/agentic-dev-core/references/adr-doctrine.md`.

---

## Index

| ADR | Title | Status | Supersedes | Superseded by |
| --- | ----- | ------ | ---------- | ------------- |
| [ADR-0001](./ADR-0001-modular-reusable-tax-platform.md) | Modular architecture built for a reusable multi-form tax platform | Accepted | — | — |
| [ADR-0002](./ADR-0002-auth-email-delivery-via-resend.md) | Auth email delivery via Supabase Send Email Hook + Resend | Accepted | — | — |
| [ADR-0003](./ADR-0003-declaracion-periodo-entity.md) | Introduce a `declaracion` entity to model período and processing status | Accepted | — | — |
| [ADR-0004](./ADR-0004-google-oauth-automatic-identity-linking.md) | Login con Google vía Supabase Auth, con linking automático por email | Accepted | — | — |
| [ADR-0005](./ADR-0005-configurable-txt-field-layout-2181.md) | Configuración manual de layout de campos para variantes del TXT de asientos (2181) | Accepted | — | — |
| [ADR-0006](./ADR-0006-1376-aggregation-by-account-pipeline.md) | La DJ 1376 corre un modo de agregación por cuenta contable, distinto del pipeline por-RUT del 2181 | Accepted | — | — |
| [ADR-0007](./ADR-0007-plan-cuentas-declaration-per-account.md) | Cada fila de plan_cuentas pertenece a una sola declaración (2181 o 1376); cada motor lee solo las suyas | Accepted | — | — |
| [ADR-0008](./ADR-0008-rut-required-only-for-2181-lines.md) | El RUT se exige solo en los asientos que resuelve el 2181; el 1376 no lo usa | Accepted | — | — |
| [ADR-0009](./ADR-0009-1376-reads-columns-by-header.md) | La importación del 1376 lee las columnas por el título del encabezado; el 2181 sigue por posición | Accepted | — | — |

> Keep this table in sync whenever an ADR is added or its status changes. It is the fast index every session reads first.

---

## References

- Template: [`ADR-NNNN-template.md`](./ADR-NNNN-template.md)
- AI detection + authoring doctrine: `.claude/skills/agentic-dev-core/references/adr-doctrine.md`
- Where this folder sits in the bigger map: `.context/README.md` and root `CONTEXT.md` §6
- Decisions about _the framework itself_ (why the repo is structured this way) live in `CONTEXT.md` §6, not here. This folder is for decisions about **the product you are building** with the boilerplate.
