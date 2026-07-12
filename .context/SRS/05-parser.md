# 05 — Parser

> Estado: **campos confirmados**, ejemplo real del TXT todavía pendiente. Lo que existe hasta ahora (`c:\Users\DISCO\Downloads\2181.txt`) es el **TXT de salida** (compatible con PADI), documentado en `10-exporter.md` — no confundir ambos formatos.

## Responsabilidad

Interpreta el TXT mensual exportado por Memory → objetos estructurados. Puramente técnico: **sin decisiones tributarias** (esas viven en `08-tax-engine.md`).

## Formato confirmado del TXT de entrada

Delimitador: `;` (punto y coma). Campos en este orden, de izquierda a derecha:

| # | Campo | Formato | Regla |
| --- | --- | --- | --- |
| 1 | Día | Numérico, 2 dígitos | 01–31 |
| 2 | Debe | Numérico, 12 dígitos | — |
| 3 | Haber | Numérico, 12 dígitos | Regla de **formato**, no de valor: mismo tipo que Debe (no implica que el valor deba coincidir línea a línea) |
| 4 | Concepto | Alfanumérico, 20–50 caracteres | Nunca vacío. Ej: `EFACTURA A 1234`, `NCFACTURAA998` |
| 5 | RUT | Numérico, 12 dígitos | — |
| 6 | Moneda | Numérico, 1 dígito (0–9) | 0 = pesos, 1 = dólares |
| 7 | Total | Numérico, hasta 9 dígitos | Formato con separador de miles, ej. `10.000.000`. Campo crítico |
| 8 | Código IVA | Numérico, 2 dígitos (0–9) | — |
| 9 | IVA | Numérico, hasta 6 dígitos | Siempre en pesos |
| 10 | Cotización | Numérico, hasta 6 dígitos | — |
| 11 | Libre | Categórico | Solo uno de: `C`, `V`, `E`, `I`, `P` |

## Qué falta confirmar

- Ejemplo real de una línea del TXT de Memory (para validar el parser contra un caso concreto).
- Encoding, manejo de líneas inválidas/malformadas.
- Volumen esperado (líneas por archivo mensual) — relevante para performance del parser.
- Significado exacto de cada valor del campo Libre (`C`, `V`, `E`, `I`, `P`) y del campo Código IVA (0–9) — pendiente, lo investiga el contador.

No fabricar el resto de esta spec — se completa a medida que el usuario la provea.
