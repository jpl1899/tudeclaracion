# ADR-0008 — The RUT is required only on asientos the 2181 resolves

- **Status:** Accepted
- **Date:** 2026-10-05
- **Deciders:** Juan Leites (product owner)
- **Tags:** parser, data-model, 2181, 1376, cross-cutting-invariant
- **Supersedes:** —
- **Superseded by:** —

---

## Context

The monthly TXT is imported once per period, and the same stored asientos feed both declarations. The parser (`parseAsientosTxt`) required a 12-digit RUT on every line, and the `asiento` table enforced the same rule (`asiento_rut_check`, added in TD-13).

The 2181 declares the detail per RUT, so it needs the RUT. The 1376 only declares totals per line code (`código;importe`), so it never reads it. Real files carry lines that only matter for the 1376, such as an IRAE advance payment (account 13122 against cash 11111), with a non-RUT value in that column (e.g. `FAC 1234`). The whole file was rejected, which blocked the 1376 for that period.

Whether a line reaches the 2181 depends on the company's plan de cuentas (a mapped IVA code, or an IVA account in Debe/Haber), plus Tipo 504, which always reaches it. A table check cannot see the plan de cuentas.

## Decision

We will require a 12-digit RUT only on lines that the 2181 resolves.

- **Parser:** validates the RUT only when the line would reach the 2181. That means Tipo 504; no Tipo, with a mapped Código IVA > 0; or no Tipo, with Código IVA = 0 and a Debe/Haber account in the 2181 plan de cuentas. Any other line accepts any value.
- **Database:** `asiento_rut_check` is dropped. The column stays `NOT NULL`.
- **2181 engine (second barrier):** `resolveAsientoFiscal` excludes a line that resolves with an invalid RUT, with reason `rut-invalido`. It never reaches the PADI file.

Invariant: **a RUT reaches a PADI file only if it has 12 digits**, enforced at import and again at generation.

## Consequences

- **Positive:** Files with 1376-only lines import, and the 1376 takes their totals. The 2181 keeps its RUT guarantee.
- **Negative / trade-offs:** The table no longer protects the RUT format. A row written by calling `insertar_asientos` directly, or a plan de cuentas edited after import, can store a non-RUT value. The engine's `rut-invalido` exclusion covers both cases, but the user only sees it on the 2181 review screen, not at import time.
- **Neutral / follow-ups:** The parser rule mirrors the branches of `resolveAsientoFiscal`. A change to how the 2181 resolves a line must update both.

## Alternatives considered

- **Skip RUT validation only when importing from the 1376 button.** Rejected: the stored asientos are shared, so the 2181 of the same period would inherit invalid RUTs.
- **Keep the table check and store a placeholder RUT for 1376-only lines.** Rejected: it invents data and hides the original value.
- **Split the import per declaration.** Rejected: the file and the asientos are the same; it doubles storage and import work for no gain.

## References

- ADR-0006 — 1376 aggregation-by-account pipeline
- ADR-0007 — each plan_cuentas row belongs to one declaration
- `src/modules/parser/parse-asientos.ts` (`requiereRut2181`), `src/modules/normalizer/normalize-asiento.ts`
- `supabase/migrations/20260716160000_check_asiento_campos.sql`, `20261005120000_relajar_asiento_rut_check.sql`
