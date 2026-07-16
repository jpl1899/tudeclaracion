# Code Review: STORY-TD-15 — Account Mapping

**Reviewer:** independent agent (fresh context) — adjudicated by orchestrator
**Date:** 2026-07-16

## Decision

✅ **APPROVED** — no AC broken, tests/types/lint/build all green. 1 MINOR + 1 NIT legitimate finding, both fixed same session; 1 NIT dismissed as false-positive.

## AC Compliance (resolution priority)

| # | Scenario | Verdict |
|---|---|---|
| 1 | Tipo = "504" → PADI 504, importe = Total, sin consultar plan de cuentas | ✅ |
| 2 | Tipo alfabético (CIE/RES/DIF/APE) → fuera de alcance | ✅ |
| 3 | Camino 1 con mapeo → resuelve, importe = IVA | ✅ |
| 4 | Camino 1 sin mapeo → sin-mapeo | ✅ |
| 5 | Camino 2 compra (Libro C/E) → lee Debe | ✅ |
| 6 | Camino 2 venta (Libro V/I) → lee Haber | ✅ |
| 7 | Camino 2, Libro='P' → fuera de alcance | ✅ |
| 8 | Camino 2 sin mapeo → sin-mapeo | ✅ |

Uso de campos de `AsientoLine` verificado contra `parse-asientos.ts` — todos coinciden. Precondición de RUT de 12 dígitos ya garantizada por el parser, correctamente no re-implementada.

## Quality gates

- `bun run test`: 21/21 ✅ · `types:check`: clean ✅ · `lint:check`: clean ✅ · `bun run build`: clean ✅

## Findings (adjudicated)

| # | finding | severity | verdict | reason | action |
|---|---|---|---|---|---|
| 1 | `parse-asientos.ts` (TD-13) — `AsientoLine.tipo` tipado `string \| null` en vez de la unión literal que el parser ya garantiza en runtime (`libro` sí usa `Libro` derivado de `LIBRO_VALUES`; `tipo` no seguía el mismo patrón con `TIPO_VALUES`) | MINOR | legitimate | Confirmado: `libro: Libro` vs `tipo: string \| null` — inconsistencia real entre dos campos con la misma validación runtime. Sin explotar hoy (único productor, siempre válido) pero es un gap de type-safety real entre módulos | fix: nuevo tipo `Tipo = (typeof TIPO_VALUES)[number]`, campo `tipo: Tipo \| null` |
| 2 | `normalize-asiento.ts` — literal `'504'` repetido en vez de constante, inconsistente con `TIPO_FUERA_DE_ALCANCE`/`LIBRO_COMPRA`/`LIBRO_VENTA` ya extraídas | NIT | legitimate | Solo estilo, sin impacto funcional | fix: constante `TIPO_504` |
| 3 | `normalize-asiento.ts:42` vs `08-tax-engine.md` — Libro='P' devuelve un `reason` interno distinto (`libro-fuera-de-alcance`) del de "sin mapeo", mientras la spec dice "mismo tratamiento" | NIT | false-positive | La spec describe equivalencia de efecto observable (no resuelve, no bloquea el archivo), no exige el mismo valor interno de `reason` — ambos son indistinguibles para cualquier consumidor futuro que solo chequee `resolved: false` | dismissed (no change) |

## Fixes applied

1. `parse-asientos.ts`: `type Tipo = (typeof TIPO_VALUES)[number]`, campo `tipo: Tipo | null`, cast explícito en el único punto de construcción (ya validado por el `if` previo).
2. `normalize-asiento.ts`: constante `TIPO_504 = '504'`, usada en ambos lugares donde antes había el literal repetido.

Re-verificado: `bun run test` (21/21), `types:check`, `lint:check`, `bun run build` — todos verdes.

## Positives

Función pura sin dependencias de Supabase (testeable sin mocks), orden de resolución fiel a la spec en cada rama, reutiliza el patrón de tipos literales ya establecido en `parse-asientos.ts` una vez corregido el finding #1.
