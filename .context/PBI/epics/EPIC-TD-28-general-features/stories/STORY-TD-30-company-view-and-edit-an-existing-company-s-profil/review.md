# TD-30 — Code Review (PR1, #25)

> Dev-authored, non-Jira. Not synced from Jira.

## Reviewer

Independent adversarial subagent (fresh context, no implementation stake). Orchestrator adjudicated each finding against the actual diff/schema before acting.

## Scope

`feat/TD-30-company-edit-screen` vs `staging` — commits `e9a1777`..`9baf1c2` (PR1 as originally opened).

## Findings and adjudication

| # | Severity | Location | Finding | Verdict | Action |
|---|---|---|---|---|---|
| 1 | MAJOR | `empresa-detalle-client.tsx:184` | `error?.code === '23505'` misclassifies any `plan_cuentas` unique-constraint hit (`UNIQUE(empresa_id, codigo_iva)`, `UNIQUE(empresa_id, cuenta_contable)`) as "duplicate RUT" | **legitimate** — confirmed both constraints exist via `pg_constraint` and both raise 23505; live-reproduced the false message by duplicating a `codigo_iva` within one submission | **fixed** — commit `d71f9df`: added `RUT_UNIQUE_CONSTRAINT` name check alongside the error code |
| 2 | MINOR | `page.tsx:24-32` | Malformed (non-UUID) `id` route param throws a raw 500 instead of 404 | **legitimate** — `empresa.id` is `uuid`-typed; live-reproduced via `/empresas/not-a-uuid` before the fix | **fixed** — commit `3006206`: UUID-format guard before the query, routes to `notFound()` |
| 3 | MINOR | `20260805100000_editar_empresa_con_plan_cuentas.sql` (comment) | No migration file in the repo creates `public.empresa` or its RLS policies — the new RPC's stated security boundary (`empresa_update_own`) isn't reproducible from a clean `supabase db reset` | **legitimate but out of scope** — confirmed via repo-wide search (zero `create table public.empresa` matches); pre-existing infra debt that predates TD-30, not something this story's AC touches | **not fixed** — flagged as a follow-up tech-debt item, not blocking this PR (Anti-pattern S8: don't touch files outside the story's stated scope) |
| 4 | NIT | `empresa-detalle-client.tsx:62-73` | `IvaRow.id` / `ExentaRow.id` carried in state but never read (only `key` is used for row identity) | **legitimate, trivial** | **skipped** — cosmetic dead-field cleanup, not worth the extra surface area on an already-reviewed diff; safe to fold into a future touch of this file |

## False positives

None — all 4 findings were substantiated against the schema/code before acting.

## Live-UI re-verification after fixes

Re-ran both fixed scenarios via Playwright CLI against the local dev server + staging DB:
- `/empresas/not-a-uuid` → clean Next.js 404 page (was a thrown-error crash before the fix).
- Duplicating `codigo_iva` across two IVA rows in one submission → generic thrown error naming the real constraint (`plan_cuentas_empresa_id_codigo_iva_key`), no more false "duplicate RUT" banner.
- Test data restored to original values after each check (confirmed via SQL).

## Glossary check

No new or ambiguous domain terms introduced by this PR.

## Verification after fixes

`bunx tsc --noEmit` clean · `bun run lint:check` clean · `bun run test` 94/94 pass, 8/8 files.
