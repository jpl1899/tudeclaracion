# ADR-0010 — The 1376 engine applies both 2181 criteria: IVA code for formato rápido, account for asiento abierto

- **Status:** Accepted
- **Date:** 2026-10-15
- **Deciders:** Juan Leites (product owner), on the accountant's request
- **Tags:** tax-engine, 1376, data-model
- **Supersedes:** — (replaces the per-row "columna de importe" rule of `.context/Tax-rules/1376/formulas.md`, 2026-09-01; refines ADR-0006)
- **Superseded by:** —

---

## Context

Since TD-38 / TD-41, each 1376 mapping row has a cuenta contable, a side (Debe/Haber) and a **columna de importe** (`Total` or `IVA`). The engine took every movement where the cuenta appeared on that side and summed the chosen column.

The 2026-09-01 rule assumed a 1376 line receives a single asiento format. That is not true: one line (for example 101 "Ventas plaza 22%") receives, in the same period, Memory Conty **formato rápido** movements (IVA in its own column, identified by a Código IVA) and **asiento abierto** movements (the IVA account written on one of the lines). A single column per row cannot read both. Formato rápido movements were also matched only by account, never by their Código IVA.

The 2181 already handles both formats per movement (`normalize-asiento.ts`): Código IVA > 0 resolves by the Código IVA and takes `IVA`; Código IVA = 0 resolves by the Debe/Haber account and takes `Total`.

## Decision

The 1376 applies the same two criteria as the 2181, per movement.

- `mapeo_1376` gains `codigo_iva` (Memory Conty formato rápido code, optional, unique per empresa) and loses `columna_importe`.
- For each mapped row, the engine sums with sign:
  - **Formato rápido** (`codigoIva > 0`): movements whose Código IVA equals the row's código de IVA, taking the `IVA` column.
  - **Asiento abierto** (`codigoIva = 0`): movements where the row's cuenta appears on the row's side, taking the `Total` column.
- A movement's format decides which criterion it goes through, so it is never counted twice.
- The cuenta stays required. A row without código de IVA only collects asientos abiertos.
- The mapping screen shows **Código de IVA** as its first column and drops **Columna de importe**.
- The 2181 Libro consistency check is not applied to the 1376.

## Consequences

- **Positive:** A 1376 line adds up both formats in the same period, matching how the 2181 reads the TXT.
- **Negative / trade-offs:** Existing mappings lose their columna de importe and have no código de IVA until the accountant fills it in. Until then they only collect asientos abiertos.
- **Neutral / follow-ups:** The "cuentas sin mapear" check (`detectar-cuentas-sin-mapear.ts`) still looks only at accounts; it does not flag formato rápido codes without a row.

## Alternatives considered

- **Keep the per-row columna de importe.** Rejected by the accountant: a row cannot pick one column when it receives both formats.
- **Match formato rápido movements by account too.** Rejected: in formato rápido the Código IVA is what identifies the movement, same as in the 2181.

## References

- ADR-0006 — 1376 aggregation by account
- `.context/Tax-rules/1376/formulas.md`
- `src/modules/generacion-1376/calcular-totales-1376.ts`
- `src/modules/normalizer/normalize-asiento.ts` (2181 criteria)
