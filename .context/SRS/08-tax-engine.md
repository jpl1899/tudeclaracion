# 08 — Tax Engine

> Estado: **pendiente**. Este es el activo diferencial del producto (ver `business-model.md`, `ADR-0001`) y todavía no tiene reglas concretas documentadas — solo el catálogo de códigos de salida (`09-forms.md`) y el formato de salida (`10-exporter.md`). Posición en el pipeline: corre **después** del Validator y **antes** del Form Builder (2181) — ver `01-system-overview.md`. El motor en sí debe ser genérico (multi-formulario); solo las reglas cargadas por formulario son específicas (viven en `.context/tax-rules/`).

> Las reglas tributarias en sí (mapeo concepto fiscal → casilla, fórmulas de cálculo, validaciones DGI) viven en `.context/tax-rules/2181/` (`mapping.md`, `formulas.md`, `validations.md`) — este archivo documenta el módulo técnico que las ejecuta, no el contenido de las reglas.

## Responsabilidad

Aplica las reglas tributarias del formulario 2181: dado un **concepto fiscal** (resultado del Normalizer, `06-normalizer.md`), determina a qué **línea/código PADI** corresponde (ver `09-forms.md`) y cómo se calcula el **importe** de esa línea (IVA vs. total de compra exenta, según el código).

## Confirmado hasta ahora

- El motor debe ser **configurable** (reglas en DB, no hardcodeadas) — decisión de Constitution.
- El importe declarado en una línea es "IVA o total de compra exenta" según el código PADI de esa línea (confirmado por el usuario al explicar `10-exporter.md`).

## Pendiente de confirmar

- Reglas concretas: qué concepto fiscal mapea a cada código PADI (502, 503, 504, 505, 506, 552, 553, y los que faltan — ver `09-forms.md`).
- Cómo se calcula el importe exacto por línea (¿suma de IVA de los asientos de ese concepto en el período? ¿fórmula?).
- Agrupación: el flujo general menciona "agrupación por RUT y línea" — confirmar si un mismo tercero+código puede generar más de una línea en la declaración o siempre se consolida en una sola.

No fabricar reglas tributarias — este archivo se completa a medida que el usuario las provea.
