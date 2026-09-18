# Comments for TD-40

[View in Jira](https://lk-tudeclaracion.atlassian.net/browse/TD-40)

---

### Juan Leites - 9/17/2026, 7:22:26 AM

## Desbloqueo parcial — el catálogo ya no es un impedimento

El estado "BLOCKED" de esta historia (30/8) quedó desactualizado: el sub-problema que la bloqueaba (catálogo real de códigos de línea del 1376) se resolvió el 2026-09-07 y se implementó el 2026-09-16 (PR #34, mergeada a `staging`) — los 10 códigos provisorios de TD-38 (101/102/103/201/301/302/501/502/510/601) son los reales a usar, confirmados por el usuario, y ya están disponibles en el dropdown de alta de empresa.

Lo que sigue genuinamente abierto para poder escribir AC y planificar esta historia: ***¿la sugerencia de mapeo base es una plantilla fija (mismo conjunto de asignaciones sugeridas para toda empresa nueva) o se deriva del plan de cuentas de la empresa (cruzando qué cuentas ya tienen un código PADI 1376 asignado ahí)?*** Eso sigue sin definirse — se retoma en la próxima sesión de planificación.

---

### Juan Leites - 9/18/2026, 7:43:37 AM

## Acceptance Criteria

> Design confirmed 2026-09-17/18: the suggested base mapping derives from the empresa's own `plan*cuentas` rows (not a fixed template) — matched via `plan*cuentas.codigo*padi = codigo*linea*1376.codigo`. A saved `mapeo*1376` row always wins over the derived suggestion.

### Scenario: Suggested account pre-fills a código with no saved mapping

Given the empresa has a `plan*cuentas` row with `codigo*padi = '101'` and `cuenta_contable = '41001'`
And the empresa has no saved `mapeo_1376` row for código `101`
When the contador opens the mapeo-1376 screen for that empresa
Then the row for código `101` shows `41001` pre-filled as cuenta contable
And lado and columna de importe are empty, waiting for the contador to complete them

### Scenario: A saved mapping always wins over the suggestion

Given the empresa has a `plan*cuentas` row with `codigo*padi = '101'`, `cuenta_contable = '41001'`
And the empresa also has a saved `mapeo_1376` row for código `101` with cuenta `41005`, lado `debe`, columna `total`
When the contador opens the screen
Then the row for código `101` shows the saved mapping (`41005` / `debe` / `total`), not the plan_cuentas suggestion

### Scenario: No plan_cuentas match — row stays empty (current behavior unchanged)

Given the empresa's `plan*cuentas` has no row whose `codigo*padi` matches código `301`
When the contador opens the screen
Then the row for código `301` is empty, exactly as today

### Scenario: Contador discards the suggestion

Given a row is pre-filled from the suggestion (cuenta filled, lado/columna empty)
When the contador clears the cuenta contable field and saves
Then that código is not persisted in `mapeo_1376` — same as any empty row today

### Scenario: Contador accepts and completes the suggestion

Given a row is pre-filled from the suggestion (cuenta filled, lado/columna empty)
When the contador selects lado and columna de importe and saves
Then the mapping is persisted via `guardar*mapeo*1376`, same as a manually entered row

---

### Juan Leites - 9/18/2026, 7:43:41 AM

## Spec Implementation Plan (Dev)

### Goal

Pre-fill the mapeo-1376 screen's cuenta contable for any código de línea 1376 that the empresa's plan de cuentas already resolves, so the contador starts from a suggestion instead of an empty matrix.

### Prerequisite (resolved)

`plan*cuentas.codigo*padi` no longer has a CHECK restricting it to 2181 codes (`supabase/migrations/20260918090000*drop*plan*cuentas*codigo*padi*check.sql`, applied 2026-09-18) — 1376 line codes can now live in that column, which this design depends on.

### Design

- `plan*cuentas` (per TD-7/TD-24) stores `cuenta*contable` + `codigo*padi` pairs from company creation. Since PR #34, `codigo*padi` can hold either a 2181 code (`502`/`503`/`504`/`505`/`506`) or a 1376 line code (from `codigo*linea*1376`).
- For any `plan*cuentas` row whose `codigo*padi` matches a `codigo*linea*1376.codigo`, pre-fill that código's `cuentaContable` in the mapeo-1376 matrix. `lado` and `columnaImporte` are not captured in `plan_cuentas`, so they stay empty for the contador to complete.
- Priority when building each row: explicit saved `mapeo*1376` row > derived suggestion from `plan*cuentas` > empty. `plan*cuentas`'s own `UNIQUE(empresa*id, codigo_padi)` makes the suggestion automatically bijection-safe — no new conflict-resolution logic needed.
- No UI changes: the existing "incompleta" validation already flags a filled cuenta with empty lado/columna, and clearing the cuenta field already discards a row on save. The suggestion is visually indistinguishable from a manually-typed value — out of scope per the story's provisional scope (accept/edit/discard only).

### Files touched

1. `src/modules/mapeo-1376/mapeo-1376.ts`
2. `src/modules/mapeo-1376/mapeo-1376.test.ts`
3. `src/app/empresas/[id]/mapeo-1376/page.tsx`

### AC → implementation mapping

| AC scenario | Covered by |
| --- | --- |
| Suggestion pre-fills an unmapped código | `combinarCatalogoConAsignaciones` fallback branch + `page.tsx` plan_cuentas fetch |
| Saved mapping wins over suggestion | `combinarCatalogoConAsignaciones` priority order (asignación checked before sugerencia) |
| No match → empty row | Existing default branch, unchanged |
| Discard suggestion | Existing `construirFilasParaGuardar` (filters by `filaTieneCuenta`) — no code change |
| Accept + complete suggestion | Existing `guardar*mapeo*1376` RPC path — no code change |

### Out of scope

- Visually marking a row as "suggested" vs "saved" — not requested by the story's provisional scope.
- Any change to `guardar*mapeo*1376` or the `mapeo_1376` table.

## Review Workload Forecast

Estimated: ~70 additions + ~10 deletions = ~80 total lines
400-line budget risk: Low
Chain strategy: stacked-to-main (single PR)
Decision needed before apply: No

---


_Synced from Jira by sync-jira-issues_
