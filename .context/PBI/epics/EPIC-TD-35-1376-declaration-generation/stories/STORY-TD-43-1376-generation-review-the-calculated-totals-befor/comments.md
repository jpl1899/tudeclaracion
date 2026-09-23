# Comments for TD-43

[View in Jira](https://lk-tudeclaracion.atlassian.net/browse/TD-43)

---

### Juan Leites - 9/22/2026, 7:26:54 AM

## Spec Implementation Plan (Dev)

## Design fidelity

No row in `.context/design/master-design-plan.md` §8 for this story. Ratifying a ***spec-only build*** (same pattern as D10/TD-38 in this epic): reuse the 2181's declaration-detail screen (`src/app/dashboard/declaraciones/[periodo]/declaracion-detalle-client.tsx`) as the visual/structural template — same shell, `Card`/`Badge`/`Button` tokens, states layout — adapted for the 1376's own data shape (no RUT, línea codes instead of PADI lines, unmapped-accounts warning instead of sin-resolver list).

## Data model decision (user-confirmed)

New table `declaracion*1376`, mirroring `declaracion` (empresa*id, periodo, estado, RLS) but as its own entity — not reusing the 2181's `declaracion` row for 1376 state. The 2181's `declaracion` row for the same empresa+período stays the source of "was the monthly TXT processed" (its `asiento` rows are the shared input, per TD-41's confirmed "same TXT as the 2181"). `declaracion_1376` tracks the 1376's own state independently — this story only reads/creates it (`abierta`), `estado -> 'generada'` is TD-44's job.

## Cross-epic pull-forward: unmapped-accounts detection (needed for this story's own AC)

TD-43's "Result with unmapped accounts" AC scenario needs detection logic that formally belongs to TD-47 (epic TD-37, not started). Implementing a minimal, focused version now — `detectarCuentasSinMapear` — grounded in the already-confirmed TD-40 mechanism (`plan*cuentas.codigo*padi` flags which accounts are 1376-relevant; `mapeo_1376` records unconfirmed vs confirmed). TD-47 later formalizes/extends this; may turn out largely satisfied already (same pattern as TD-39 being satisfied by TD-38-D3).

Algorithm: 1376-relevant accounts = `plan*cuentas` rows whose `codigo*padi` matches a `codigo*linea*1376` catalog code. Unmapped = relevant ∩ (has movement in the period's asientos, debe or haber) − (already in `mapeo*1376.cuenta*contable`).

## Files

- `supabase/migrations/<ts>*crear*declaracion_1376.sql` (new): mirrors `declaracion`'s schema + RLS pattern.
- `src/modules/validaciones-1376/detectar-cuentas-sin-mapear.ts` (new) + test: pure function per the algorithm above.
- `src/app/dashboard/declaraciones-1376/[periodo]/page.tsx` (new): resolves empresa activa (cookie, same as `/dashboard/declaraciones/[periodo]`), looks up the 2181 `declaracion` for this empresa+período (source of "TXT processed" + asientos) — none found -> "no data yet" empty state, no `declaracion*1376` row created. Found -> fetch asientos + `mapeo*1376` + `plan*cuentas` + `codigo*linea*1376`, run `calcularTotalesLinea1376` (TD-41) + `detectarCuentasSinMapear`, get-or-create the `declaracion*1376` row (`abierta`). Wraps Supabase fetch errors into a graceful `error` prop instead of throwing (this story's own AC requires it, improves on the 2181 pattern rather than copying its gap).
- `src/app/dashboard/declaraciones-1376/[periodo]/revision-1376-client.tsx` (new): states — no data yet / processing (n/a, synchronous like 2181) / clean result / result with unmapped-accounts warning (blocks the download button until acknowledged via a checkbox) / calculation error. States "totals are by account, no RUT" note per AC. Download button interpretation: since the actual file generation (TD-44) is out of scope, the button reflects the AC's enabled/blocked semantics (enabled on clean/acknowledged, disabled+reason when blocked by the warning) but its click handler is a placeholder note ("disponible en una próxima entrega") rather than a real file — will be wired for real in TD-44.
- `src/app/dashboard/dashboard-client.tsx` (small edit): add a "Ver 1376" link per período row next to the existing 2181 link — minimal entry point so the screen is reachable; no other changes to this file.

## Out of scope (unchanged from story)

- Real PADI file generation/download (TD-44).
- The aggregation rule itself (TD-41/TD-42, already built/in progress).

## Review Workload Forecast

Estimated: ~350 additions + ~10 deletions = ~360 total lines
400-line budget risk: Medium
Chain strategy: single-pr
Decision needed before apply: No

---


_Synced from Jira by sync-jira-issues_
