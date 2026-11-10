# TD-38 — Spec Compliance Matrix (Stage 3)

PR https://github.com/jpl1899/tudeclaracion/pull/33 · reviewed 2026-09-01.

| AC scenario | covered_by | evidence | status |
|---|---|---|---|
| Company with no mapping yet — every line-code row renders unassigned, assignable | manual:live-ui | dev server vs remote DB, empresa "Regional SUR": 10 catalog rows rendered empty | manual |
| Assign an account to a line code and save — confirmation + persists on reopen | test:combinarCatalogoConAsignaciones + manual:live-ui | `mapeo-1376.test.ts` (precarga de asignación existente) + live save → "Mapeo guardado correctamente" → survived full reload | covered |
| An account cannot map to two line codes (bijection) — save blocked, names both codes | test:validarMapeo + manual:live-ui | `mapeo-1376.test.ts` ("rechaza la misma cuenta en dos códigos... nombra ambos") + live: 51001 on 101+102 → banner "La cuenta 51001 está asignada a los códigos 101 y 102" | covered |
| DB-level bijection guard (23505 → rollback) | manual:live-ui + review-approved:self | client-side `validarMapeo` blocks first; the `save-error` branch + `guardar_mapeo_1376` delete-then-reinsert-in-txn is the backstop. RPC-level test is DB-bound, out of unit scope | review-approved |
| Save an incomplete assignment — blocked, names the missing field/code | test:filaIncompleta + manual:live-ui | `mapeo-1376.test.ts` (falta lado / falta columna) + live: 52002 with no lado → banner "El código 102 tiene una cuenta asignada pero le falta el lado o la columna de importe" | covered |
| Leave without saving — nothing persisted | review-approved:self | "Volver sin guardar" = `router.push` with no RPC call; no local mutation path persists | review-approved |
| Distinct from the 2181 plan de cuentas | manual:live-ui | prominent callout "Esto no es el plan de cuentas del 2181..." rendered above the rows | manual |

No `uncovered` rows.
