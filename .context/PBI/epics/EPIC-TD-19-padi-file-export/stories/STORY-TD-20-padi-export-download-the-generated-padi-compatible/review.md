# TD-20 — Stage 3 Code Review

Independent adversarial reviewer dispatched with fresh context, scoped to all 5 TD-20 commits (migration, RPC, import dialog, exporter module, declaracion-detalle screen) plus ADR-0003. Findings adjudicated below against the real diff and the confirmed AC.

## AC coverage

All 3 confirmed Gherkin scenarios (successful download after processing, download unavailable while processing/failed, filename convention) map to real code paths, verified live via `playwright-cli` against the running dev server (see Stage 2 notes in `.session/.archive/`).

## Findings

| # | Severity | Finding | Verdict | Reasoning |
|---|---|---|---|---|
| 1 | MAJOR | `generate-padi-file.ts`: `Math.round(importe).toString().padStart(12, '0')` puts a negative sign in the middle of the digit string (`-500` → `"00000000-500"`), corrupting the fixed-width unsigned field | **Legitimate, fixed** | Real encoding bug regardless of whether negative amounts are valid domain data (TD-17 amount-range validation isn't built yet). Fixed with `Math.abs()` before padding; added a regression test. |
| 2 | MINOR | `declaracion_update_own` RLS policy has no state-machine constraint — the row's own owner could flip `estado` to any value via a direct REST call, bypassing the "derived, not manual" invariant from ADR-0003 | Legitimate, **deferred** | Not a cross-tenant security gap (ownership check holds) — the owner tampering with their own row's status is a low-risk self-inflicted edge case. A DB-level state-machine guard (trigger or check) is real hardening but out of this story's AC; worth a follow-up once a second `estado`-driven flow exists to validate the constraint shape against. |
| 3 | MINOR | `declaracion-detalle-client.tsx`: the `estado` update-to-`generada` error was silently swallowed — file downloads but status never reflects it, no user feedback | **Legitimate, fixed** | Added an `errorEstado` state and an inline message (reusing the established `alert.error` visual pattern) when the update fails. |
| 4 | MINOR | Dashboard's "Actividad reciente" table can never show `con_errores` since that state is computed live only on the detail page, never persisted | Legitimate, **deferred** | Real UX inconsistency between the two screens, but fixing it means either persisting a state we deliberately kept derived-only (avoids side-effecting GET renders) or running the full resolution pipeline for every row on every dashboard view (real perf cost). Flagged as a known limitation for a follow-up, not blocking this story's AC (which only describes "the declaration screen," i.e. the detail view). |
| 5 | NIT | Stale comment in `dashboard-client.tsx` still pointed at the pre-TD-20 `insertar_asientos` migration filename | **Legitimate, fixed** | One-line correction. |

No BLOCKER findings. Security review (RLS cross-tenant isolation) and the atomicity of `insertar_asientos`' upsert-then-insert were both explicitly checked by the reviewer and came back clean.

## Decision: ✅ APPROVED — 3 findings fixed (negative-importe encoding, silent error, stale comment), 2 deferred with documented reasoning (RLS state-machine hardening, dashboard-level error visibility).
