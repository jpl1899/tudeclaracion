# Test Cases — Estructurales (Parser / Validator / Exporter)

> Estado: **casos estructurales confirmados**, casos tributarios (mapeo Código IVA→tasa, significado de Libro E/I/P, casillas 502-504/506/552/553, notas de crédito) **pendientes** — requieren al contador campo por campo. No fabricar esos valores; completar cuando lleguen.

Cubre variaciones de **formato** ya confirmado en `../../SRS/05-parser.md` y `../../SRS/10-exporter.md`. No prueba reglas tributarias (eso vive en `mapping.md` / `formulas.md`, todavía pendientes).

## Línea base

Formato confirmado: `Día;Debe;Haber;Concepto;RUT;Moneda;Total;CódigoIVA;IVA;Cotización;Libro`

```
01;11411;11111;EFACTURA A 1234;211445588774;0;122;1;22;0;C
```

Código IVA=`1` y Libro=`C` son **placeholders de formato** en los casos donde no son el objeto del test — no afirman significado tributario (eso sigue sin confirmar).

## Casos

| TC | Qué prueba | Línea TXT / variación | Resultado esperado / pregunta abierta |
|---|---|---|---|
| 01 | Moneda=0 (pesos), caso base | `01;11411;11111;EFACTURA A 1234;211445588774;0;122;1;22;0;C` | Válida, sin conversión |
| 02 | Moneda=1 (dólares) | `01;11411;11111;EFACTURA A 1234;211445588774;1;122;1;22;60;C` | Dispara conversión a pesos con Cotización=60 |
| 03 | Moneda fuera de 0/1 | `01;11411;11111;EFACTURA A 1234;211445588774;2;122;1;22;0;C` | Formato válido (1 dígito 0-9) pero sin significado confirmado → **pregunta**: ¿el Validator lo rechaza? |
| 04 | Total mínimo (1 dígito) | `...;0;1;1;0;0;C` | Válida |
| 05 | Total máximo (9 dígitos, separador de miles) | `...;0;999.999.999;1;22;0;C` | Válida |
| 06 | Cotización máximo (6 dígitos) | `...;1;122;1;22;999999;C` | Válida |
| 07 | RUT corto (11 dígitos) | `...;21144558877;0;122;1;22;0;C` | Debe rechazar (Validator) |
| 08 | RUT largo (13 dígitos) | `...;2114455887741;0;122;1;22;0;C` | Debe rechazar — el error original detectado en el prompt fuente |
| 09 | RUT con letras | `...;21144A588774;0;122;1;22;0;C` | Debe rechazar |
| 10 | Concepto vacío | `01;11411;11111;;211445588774;0;122;1;22;0;C` | Debe rechazar (spec: nunca vacío) |
| 11 | Concepto <20 caracteres | Concepto=`FACT 1` (6 car.) | **Pregunta**: ¿rechaza o el rango 20-50 es solo guía no forzada? |
| 12 | Concepto límite inferior (20 car. exactos) | Concepto de 20 caracteres exactos | Válida |
| 13 | Concepto límite superior (50 car. exactos) | Concepto de 50 caracteres exactos | Válida |
| 14 | Concepto >50 caracteres | Concepto de 51+ caracteres | **Pregunta**: ¿rechaza o trunca? |
| 15 | Dos líneas mismo RUT, mismo Código IVA/Libro | Dos líneas idénticas salvo Concepto | Deben sumarse en una sola línea de casilla en el PADI |
| 16 | Dos líneas mismo RUT, distinto Código IVA/Libro | Ej. una con Libro=C, otra con Libro=V | Confirma que la clave de agrupación es RUT+concepto fiscal, no solo RUT — deberían ir a casillas separadas |
| 17 | Tres líneas, dos RUTs distintos | — | Deben generar dos líneas separadas en el PADI final |
| 18 | Dos líneas en dólares, mismo RUT/mes, Cotización distinta en cada línea del TXT | — | **Pregunta abierta real**: ¿la conversión usa la Cotización de cada línea del TXT, o la cotización única que el usuario tipea en la pantalla de declaración? Ambas existen, no se sabe cuál manda |
| 19 | Concepto con prefijo "NC" | `NCFACTURAA998` (ya aparece como ejemplo confirmado en `05-parser.md`) | Pista existente de que la nota de crédito se identifica por el Concepto, no por un campo dedicado — sin confirmar si resta directo del RUT/casilla o usa Debe/Haber invertido |

## Pendiente (bloqueado hasta hablar con el contador)

- Significado de cada valor de Libro (`C`, `V`, `E`, `I`, `P`).
- Mapeo Código IVA (1-9) → tasa, por empresa.
- Casillas 502, 503, 504, 506, 552, 553 (solo 505 confirmada — ver `casillas.md`).
- Tratamiento exacto de notas de crédito.
- Cuál cotización manda: la del TXT (por línea) o la que tipea el usuario (por declaración).
