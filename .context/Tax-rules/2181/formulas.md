# Fórmulas — Formulario 2181

> Estado: **regla de cálculo por casilla confirmada** (ver `08-tax-engine.md`, `mapping.md`). Redondeo confirmado 2026-07-17, corregido 2026-07-19.

## Confirmado

- **Redondeo**: se mira únicamente el primer decimal del importe, el resto se descarta — 1 a 5 redondea para abajo, 6 a 9 para arriba (ej: 180,549 → 180). No es redondeo al más cercano ni siempre hacia arriba — esa respuesta original (2026-07-17) era incorrecta, corregida en vivo durante testing de TD-26. Implementado en `redondearImporte` dentro de `src/modules/exporter/generate-padi-file.ts`.
- El importe nunca lleva decimales implícitos en el archivo exportado — ver `../../SRS/10-exporter.md`.

No fabricar fórmulas — este archivo se completa a medida que el usuario las provea.
