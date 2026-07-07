# 05 — Parser

> Estado: **pendiente**. No hay todavía un ejemplo confirmado del TXT de entrada (exportación mensual de asientos desde Memory). Lo que existe hasta ahora (`c:\Users\DISCO\Downloads\2181.txt`) es el **TXT de salida** (compatible con PADI), documentado en `10-exporter.md` — no confundir ambos formatos.

## Responsabilidad

Interpreta el TXT mensual exportado por Memory → objetos estructurados. Puramente técnico: **sin decisiones tributarias** (esas viven en `08-tax-engine.md`).

## Qué falta confirmar

- Delimitador y estructura de campos del TXT de entrada.
- Campos esperados (fecha, cuentas, concepto, RUT, IVA, importes — mencionados de forma genérica en `business-model.md`, sin spec exacta de columnas/orden).
- Encoding, manejo de líneas inválidas/malformadas.
- Volumen esperado (líneas por archivo mensual) — relevante para performance del parser.

No fabricar esta spec — pedir al usuario un ejemplo real del TXT de Memory antes de detallar este archivo.
