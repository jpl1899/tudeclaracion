# 09 — Forms

> Único formulario del MVP 1: el 2181 (abajo). El **1376** (MVP 2 Track A) tiene su propio módulo en `13-forms-1376.md` y su catálogo de dominio en `.context/tax-rules/1376/` — no se documenta acá.

## Formulario 2181

Único formulario en el alcance del MVP 1 (ver `business-model.md`).

> Significado fiscal de cada casilla (concepto, fórmula) se documenta en `.context/tax-rules/2181/casillas.md` — este archivo solo mantiene el dato técnico del código para el Exporter.

- Identificador en el TXT de salida: `02181` (campo 2, ver `10-exporter.md`).

### Catálogo de líneas / códigos PADI

> **Confirmado 2026-07-14**: catálogo completo para el 2181 (7 códigos). El contador aclaró que a futuro se agregarán más códigos para otras declaraciones juradas (fuera del 2181) — no fabricar esos hasta que se confirmen; no bloquean el 2181.

| Código | Concepto |
|--------|----------|
| 502    | IVA ventas tasa básica |
| 503    | IVA ventas tasa mínima |
| 504    | Compras exentas |
| 505    | IVA compras tasa básica |
| 506    | IVA compras tasa mínima |
| 552    | Venta por cuenta ajena tasa básica (por cuenta y orden) |
| 553    | Venta por cuenta ajena tasa mínima |

### Pendiente

- Códigos PADI adicionales para otras declaraciones juradas (fuera de alcance MVP, no fabricar hasta que se confirmen).
