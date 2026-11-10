# TD-38 — Code Review (Stage 3)

PR: https://github.com/jpl1899/tudeclaracion/pull/33 → `staging`
Reviewed: 2026-09-01 · fresh-eyes pass over the branch diff vs AC + code standards.

## Findings

| # | Severity | Location | Finding | Verdict |
|---|---|---|---|---|
| 1 | MINOR | `mapeo-1376-client.tsx` `handleSubmit` | After a successful save that cleared a row's account, the row's `lado`/`columna` selects kept their stale values on screen until reload (data in the DB was correct). | **legitimate — fixed** in this branch: on save success the state is normalized (rows without an account also clear lado/columna). |
| 2 | NIT | `mapeo-1376.ts` `FilaGuardado` | `[key: string]: string` index signature is looser than ideal but is required to satisfy the generated `Json` RPC arg type; documented in a comment. | dismissed — accepted trade-off, matches how `p_cuentas` is passed elsewhere. |
| 3 | INFO | `supabase/migrations/*` | New tables have no explicit `grant` to `authenticated`. | dismissed — the existing `plan_cuentas` migration also has none and works; live-UI end-to-end read+write against the real DB confirmed access. |

No BLOCKER or MAJOR findings.

## Checklist

- [x] All AC covered by code paths (see compliance-matrix.md)
- [x] `lint:check` + `types:check` green; `test` 127/127
- [x] Code-standards: alias imports, ≤2 positional params, interfaces at top, public fail-fast / util silent-fail
- [x] Security: RLS on both tables scoped via `empresa.cuenta_id = auth.uid()`; RPC `security invoker` + explicit ownership guard; no secrets in diff
- [x] UI fidelity: reuses the live TD-30 editable-table pattern + `DESIGN.md` tokens; divergence D10 ratified in master-design-plan §5
- [x] Live-render pass: empty / success / validation-error / save-error states + nav all verified against the running app

## Glossary

No new domain terms introduced. "código de línea 1376", "columna de importe", "mapeo biyectivo" are consistent with `tax-rules/1376/`.
