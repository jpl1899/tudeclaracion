# Mapping — Concepto fiscal → Casilla (2181)

> Estado: **pendiente**. Esta es la regla de negocio central del tax engine (`.context/SRS/08-tax-engine.md`) — el contenido real de las reglas configurables mencionadas en `business-model.md` como el activo diferencial del producto.

## Qué falta confirmar

- Tabla completa: cada concepto fiscal (resultado del Normalizer, `.context/SRS/06-normalizer.md`) → a qué casilla del 2181 corresponde (ver `casillas.md`).
- Si el mapeo depende únicamente del concepto fiscal, o también de otros factores (tipo de tercero, régimen de IVA del tercero, monto de la operación).
- Cómo se resuelve un concepto fiscal que no tiene mapeo definido (ver `validations.md`).

No fabricar reglas de mapeo — este archivo se completa a medida que el usuario las provea. Es, junto con `formulas.md`, el contenido más crítico y aún menos definido de todo `tax-rules/`.
