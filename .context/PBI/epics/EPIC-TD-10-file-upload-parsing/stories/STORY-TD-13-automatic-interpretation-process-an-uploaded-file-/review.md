# Code Review: STORY-TD-13 — Automatic Interpretation

**Reviewer:** independent agent (fresh context) — adjudicated by orchestrator
**Date:** 2026-07-16

## Decision

✅ **APPROVED** — no AC broken. All 4 findings fixed same session (user requested immediate fix, not follow-up tickets). Tests/types/lint/build all green after fixes.

## Fixes applied

1. `dashboard-client.tsx` — RPC failure now returns a generic user-facing message (`'No se pudo guardar el archivo...'`); raw `error.message` no longer reaches the UI.
2. New migration `supabase/migrations/20260716160000_check_asiento_campos.sql` — added `check` constraints on `dia`, `debe`, `haber`, `concepto`, `rut`, `tipo` on the `asiento` table, mirroring the parser's validation rules. Applied via Supabase Management API (same workaround as the original TD-13 migrations — CLI/direct Postgres still hang in this environment). `src/types/supabase.ts` regenerated.
3. `parse-asientos.ts` — `fail()` now takes a single object param `{ line, field, message }` instead of 3 positional args (all 13 call sites updated).
4. `ImportarAsientoError` (in `importar-asiento-dialog.tsx`) is now a discriminated union — `{ kind: 'parse', line, field, message }` vs `{ kind: 'guardado', message }` — instead of overloading one shape with a `line: 0, field: 'archivo'` sentinel. `dashboard-client.tsx` and the dialog's error rendering updated accordingly.

Verified: `bun run test` (13/13), `types:check`, `lint:check` (1 auto-fixable style issue from the discriminated-union edit, fixed via `lint:fix`), `bun run build` — all green.

## AC Compliance

| AC | Status | Notes |
|---|---|---|
| AC1: Compra exenta con código de cuenta | ✅ | `parse-asientos.ts:150-158` |
| AC2: Código IVA directo | ✅ | No tax-logic branching, matches parser scope |
| AC3: Tipo alfabético no interrumpe | ✅ | `parse-asientos.ts:117-120` whitelist |
| AC4: Dato inválido aborta, ubica línea+campo | ✅ (UI path) | DB-level gap noted in finding #2 |

## Quality gates

- `bun run test`: 13/13 ✅
- `bun run types:check`: clean ✅
- `bun run lint:check`: clean ✅

## Findings (adjudicated)

| # | finding | severity | verdict | reason | action |
|---|---|---|---|---|---|
| 1 | `src/app/dashboard/dashboard-client.tsx:58` — raw `error.message` from Supabase RPC interpolated into user-facing alert | MAJOR | legitimate | Confirmed against `error-handling.md` §"Qué NO Hacer" — explicit written rule: "NO exponer detalles internos". Reviewer's original file:line verified by direct read. | fix: generic message + server-side log of real error |
| 2 | `supabase/migrations/20260716140000_crear_asiento.sql` — no `check` constraints on `dia` (1-31), `debe`/`haber` (numeric), `concepto` (non-empty), `rut` (12 digits), `tipo` (whitelist) | MAJOR | legitimate | Confirmed by reading both migrations: `insertar_asientos` is `security invoker`, casts `jsonb` fields with zero domain validation beyond what Postgres types/existing checks (`moneda`, `codigo_iva`, `libro`) enforce. Any authenticated user can call the RPC directly (bypassing the TS parser) for their own `empresa_id` and insert malformed rows that downstream TD-15+ stages will trust as "already validated". | fix: add matching `check` constraints for parity with parser rules |
| 3 | `src/modules/parser/parse-asientos.ts:58` — `fail(line, field, message)` takes 3 positional params | MINOR | legitimate | Confirmed at line 58. Violates this repo's own convention (`CLAUDE.md` §10: "Max 2 positional. 3+ → object param"). | fix: `fail({ line, field, message })` |
| 4 | `src/app/dashboard/dashboard-client.tsx:58` — reuses `ImportarAsientoError{line,field}` with sentinel `line: 0, field: 'archivo'` for a DB-persistence failure | MINOR | legitimate | Confirmed at line 58. Conflates parse-time and persist-time error semantics under one type; produces a nonsensical "Línea 0, campo archivo" message. | fix: separate error shape for non-parse failures |

## Positives

Clean `Result`-type parser API, atomic single-statement RPC insert genuinely satisfies "abort whole file" at the DB layer, RLS/`search_path=''` pattern consistent with existing `plan_cuentas` precedent.
