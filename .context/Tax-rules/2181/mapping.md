# Mapping — Concepto fiscal → Casilla (2181)

> Estado: **pendiente**. Esta es la regla de negocio central del tax engine (`.context/SRS/08-tax-engine.md`) — el contenido real de las reglas configurables mencionadas en `business-model.md` como el activo diferencial del producto.

## Confirmado (parcial) — 2026-07-13

- Casilla 505 = compra tasa básica. El importe es la suma del IVA (columna IVA del TXT) de todos los asientos del mismo RUT que correspondan a una compra tasa básica.
- El campo Código IVA (0–9) es específico de cada empresa (configurable) — no hay una tabla universal código→tasa. Cada empresa define, en su propia configuración, qué código representa tasa básica/mínima/exenta.

## Qué falta confirmar

- Tabla completa: cada concepto fiscal (resultado del Normalizer, `.context/SRS/06-normalizer.md`) → a qué casilla del 2181 corresponde (ver `casillas.md`).
- Si el mapeo depende únicamente del concepto fiscal, o también de otros factores (tipo de tercero, régimen de IVA del tercero, monto de la operación).
- Cómo se resuelve un concepto fiscal que no tiene mapeo definido (ver `validations.md`).

No fabricar reglas de mapeo — este archivo se completa a medida que el usuario las provea. Es, junto con `formulas.md`, el contenido más crítico y aún menos definido de todo `tax-rules/`.
