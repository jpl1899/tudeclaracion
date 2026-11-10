# ADR-0009 — The 1376 import reads columns by their header title

- **Status:** Accepted
- **Date:** 2026-10-07
- **Deciders:** Juan Leites (product owner)
- **Tags:** parser, 1376, data-ingestion
- **Supersedes:** — (narrows ADR-0005 for the 1376 import only)
- **Superseded by:** —

---

## Context

The monthly TXT may or may not start with a header row of field titles. The parser always read columns by their fixed position (ADR-0005) and dropped the header. A real test file for the 1376 came with `RUC` before `CONCEPTO`, the reverse of the canonical order, so the import stored the concepto as the RUT and the RUT as the concepto, without any error.

ADR-0005 rejected requiring a header because most accounting systems do not export one. That still holds. But when a header is present, it is the most reliable description of the columns.

## Decision

When the import starts from the 1376 button and the file has a header row, each column is read by its title, not by its position.

- Titles are matched without case, accents or separators. `RUC` and `RUT` are the same field. The 9 special columns of ADR-0005 are accepted and ignored.
- An unknown title, a repeated title or a missing required column (all 11 classic fields; `TIPO` is optional) rejects the file at line 1.
- Each data line must have exactly as many fields as the header has columns. A different count rejects the file. Values are never shifted.
- Without a header, the 1376 import works as before (positional layout, with the special-columns setup when needed).
- The 2181 import does not change: it keeps reading by position and drops the header.

## Consequences

- **Positive:** A 1376 file with a header can have its columns in any order without corrupting the stored asientos.
- **Negative / trade-offs:** The same file can be read differently depending on the button used. A header file with a non-canonical order imports correctly from the 1376 but shifts its values from the 2181. Since the asientos are shared, the 2181 of that period sees whatever the last import stored.
- **Neutral / follow-ups:** If the 2181 should also read by header, extend `parseAsientosTxt1376` to it and supersede this ADR.

## Alternatives considered

- **Read by header in both imports.** Rejected for now: the product owner asked to keep the 2181 logic untouched.
- **Infer the layout from the values.** Rejected for the same reason as in ADR-0005: several fields share shape.

## References

- ADR-0005 — manual field layout for TXT variants
- ADR-0008 — RUT required only on 2181 lines
- `src/modules/parser/parse-asientos.ts` (`parseAsientosTxt1376`, `tieneEncabezado`)
