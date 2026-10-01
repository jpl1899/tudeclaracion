# ADR-0007 — Each plan_cuentas row belongs to one declaration (2181 or 1376)

- **Status:** Proposed
- **Date:** 2026-10-01
- **Deciders:** Juan Leites (product owner), accountant
- **Tags:** data-model, plan-cuentas, 2181, 1376, cross-cutting-invariant
- **Supersedes:** —
- **Superseded by:** —

---

## Context

The company setup screens offer one "Código PADI" dropdown that mixes the 2181 codes (502–506) and the 1376 line codes (`codigo_linea_1376`). Some codes exist in both catalogs (502), so the dropdown labels them `2181-502` / `1376-502` (TD-40, TD-49).

`plan_cuentas` stored only the plain code, so the chosen declaration was lost on save. Every consumer then guessed:

- The 2181 engine (`resolveAsientoFiscal`, Camino 1 by IVA code / Camino 2 by account) used every row, so a 1376 account was picked up by the 2181 and broken down by RUT.
- The 1376 unmapped-accounts warning (`detectarCuentasSinMapear`) and the suggested base mapping (TD-40) treated any row whose code is in `codigo_linea_1376` as a 1376 account, including 2181 rows with code 502.
- The edit screen could not restore `1376-502` and showed `2181-502`.

Business rule confirmed by the user on 2026-10-01: each account is assigned to one declaration from the start. A 2181 account follows the 2181 logic (breakdown by RUT); a 1376 account only counts toward 1376 totals (no RUT breakdown).

## Decision

We will store the declaration on every `plan_cuentas` row: `declaracion text not null default '2181' check (declaracion in ('2181', '1376'))`.

Invariant: **a consumer of `plan_cuentas` reads only the rows of its own declaration.** The 2181 pipeline filters `declaracion = '2181'`; every 1376 consumer filters `declaracion = '1376'`. The PADI code alone never decides the declaration.

Existing rows are backfilled: a row whose code exists in `codigo_linea_1376` and is not a 2181 code (502–506) becomes `1376`; every other row stays `2181`, because until TD-49 the edit screen only offered 2181 codes.

## Consequences

- **Positive:** The 2181 and 1376 engines can no longer pick up each other's accounts. A shared code such as 502 is unambiguous. The edit screen restores exactly what the user chose.
- **Negative / trade-offs:** Every new `plan_cuentas` consumer must remember to filter by declaration. The backfill assumes that a shared-code row saved before this change is 2181; a company that meant `1376-502` must re-select it once.
- **Neutral / follow-ups:** A future declaration (2183, 1050) extends the check constraint and the dropdown, not the engines' filtering pattern.

## Alternatives considered

- **Store the synthetic option id (`1376-502`) in `codigo_padi`** — rejected: every engine and exporter compares `codigo_padi` against real PADI codes, so the prefix would leak into calculations and files.
- **Keep inferring from the code** — rejected: it is ambiguous for shared codes and it is exactly the bug.
- **Separate tables per declaration** — rejected: the create/edit screens and RPCs share one list per company; splitting it doubles the persistence code with no gain today.

## References

- TD-50 (this change), TD-49 (edit screen offers 1376 codes), TD-40 (suggested base mapping)
- ADR-0006 — 1376 aggregation-by-account pipeline
- `supabase/migrations/20260715120000_rediseno_plan_cuentas.sql`, `20260805100000_editar_empresa_con_plan_cuentas.sql`
