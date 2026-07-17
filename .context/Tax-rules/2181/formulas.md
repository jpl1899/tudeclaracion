# Fórmulas — Formulario 2181

> Estado: **regla de cálculo por casilla confirmada** (ver `08-tax-engine.md`, `mapping.md`). Redondeo confirmado 2026-07-17.

## Confirmado

- **Redondeo**: el importe final se redondea siempre **hacia arriba** (equivalente a `Math.ceil`), nunca al más cercano ni truncado. Implementado en `src/modules/exporter/generate-padi-file.ts`.
- El importe nunca lleva decimales implícitos en el archivo exportado — ver `../../SRS/10-exporter.md`.

No fabricar fórmulas — este archivo se completa a medida que el usuario las provea.
