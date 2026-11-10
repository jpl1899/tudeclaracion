# Comments for TD-41

[View in Jira](https://lk-tudeclaracion.atlassian.net/browse/TD-41)

---

### Juan Leites - 9/22/2026, 7:01:02 AM

## Spec Implementation Plan (Dev)

***Unblock note***: this story's description still reads "BLOCKED - needs contadora input" and has no formal AC in Jira, but the blocking question was resolved 2026-09-01 in a session with the contadora — see `.context/Tax-rules/1376/formulas.md` and `.context/Tax-rules/1376/open-questions.md`. The resolution is already implemented in `mapeo*1376` (TD-38): each row carries `lado` (Debe/Haber) and `columna*importe` (Total/IVA), exactly the missing piece this story needed. Proceeding on that basis.

## Scope

Pure calculation module only — no new UI, no new Supabase query/RPC, no export-file formatting. Per the story's own Out of Scope, the review screen (TD-43) and download (TD-44) are separate tickets; TD-43 will own fetching `mapeo_1376` for an empresa and calling this function.

## Algorithm (confirmed in `formulas.md`)

For each `mapeo_1376` row (`codigoLinea`, `cuentaContable`, `lado`, `columnaImporte`):

1. Filter the period's parsed `AsientoLine[]` to the ones where the account on the configured `lado` (`debe` or `haber`) equals `cuentaContable`.
2. If no asiento matches, the código is omitted from the result ("con movimiento" — no empty/zero rows for untouched accounts).
3. Otherwise sum, with sign, the amount from the configured `columnaImporte` (`total` or `iva`) of each matching asiento, after the same currency conversion as the 2181 (USD → UYU via `cotizacion`, half-down rounding on the converted value).
4. No RUT breakdown, no final integer/export rounding here (that is TD-44's job, mirroring how `consolidarLineasDeclaracion` vs `generarArchivoPadi` split the 2181 pipeline).

## Files

- `src/modules/normalize-asiento.ts`: export the existing `redondearMitadAbajo` and `convertirImporte` helpers (currently private) — now consumed by both the 2181 normalizer and the new 1376 engine, no duplicated rounding/conversion logic.
- `src/modules/generacion-1376/calcular-totales-1376.ts` (new): `calcularTotalesLinea1376(asientos: AsientoLine[], mapeo: MapeoAsignacionInicial[]): { codigoLinea: string, importe: number }[]`.
- `src/modules/generacion-1376/calcular-totales-1376.test.ts` (new): cases — Debe/Total, Haber/IVA, USD conversion, nota de crédito netting (negative/zero allowed), account with no movement omitted, two independently-mapped códigos don't cross-contaminate.

## Out of scope (deferred to later tickets)

- Liquidación / saldo a pagar (líneas 322/970/971/972, boleto 2908) — deferred per the open question, not part of MVP2 Track A yet.
- Panel 1 acumulados del ejercicio — unresolved data-source question.
- Export file rounding + `codigo;importe` formatting — TD-44.
- Review screen — TD-43.

## Review Workload Forecast

Estimated: ~150 additions + ~5 deletions = ~155 total lines
400-line budget risk: Low
Chain strategy: single-pr
Decision needed before apply: No

---


_Synced from Jira by sync-jira-issues_
