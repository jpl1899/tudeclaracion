# Fórmulas — Formulario 2181

> Estado: **regla de cálculo por casilla confirmada** (ver `08-tax-engine.md`, `mapping.md`). Redondeo confirmado 2026-07-17, corregido 2026-07-19.

## Confirmado

- **Redondeo**: los importes vienen con 2 decimales; se comparan esos 2 decimales completos contra 0,50 — ≤0,50 redondea para abajo, ≥0,51 para arriba (ej: 180,50 → 180; 180,51 → 181). No es redondeo siempre hacia arriba — esa respuesta original (2026-07-17) era incorrecta, corregida en vivo durante testing de TD-26. Implementado en `redondearImporte` dentro de `src/modules/exporter/generate-padi-file.ts`.
- El importe nunca lleva decimales implícitos en el archivo exportado — ver `../../SRS/10-exporter.md`.

No fabricar fórmulas — este archivo se completa a medida que el usuario las provea.
