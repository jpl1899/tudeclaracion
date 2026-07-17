# TD-23 — Spec Compliance Matrix

| AC scenario (Gherkin) | covered_by | evidence | status |
|---|---|---|---|
| Dos asientos con mismo RUT y mismo código PADI se consolidan en una línea | test:consolidate-lines.test.ts | `consolidates two asientos with the same RUT and codigo PADI into one summed line` | covered |
| Mismo RUT con distinto código PADI genera líneas separadas | test:consolidate-lines.test.ts | `keeps separate lines for the same RUT with different codigo PADI` | covered |
| Un solo asiento para un RUT+código no requiere agregación | test:consolidate-lines.test.ts | `passes a single unmatched asiento through unchanged` | covered |
| Los asientos sin resolver no generan línea | test:consolidate-lines.test.ts | `excludes unresolved asientos from every line and sum` | covered |

No `uncovered` rows. Extra test (`returns an empty array when there is nothing to consolidate`) covers a defensive edge case not in the original AC set.
