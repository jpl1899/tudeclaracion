# Comments for TD-23

[View in Jira](https://lk-tudeclaracion.atlassian.net/browse/TD-23)

---

### Juan Leites - 7/7/2026, 20:24:32

Blocked — no AC until `Tax-rules/2181/formulas.md` and `Tax-rules/common/iva.md` are populated with real calculation formulas/rates.

---

### Juan Leites - 7/7/2026, 20:24:33

## Scope

- Each PADI line carries a calculated amount, via configurable (not hardcoded) formulas (capability-level only; no formula implied).

---

### Juan Leites - 7/7/2026, 20:24:37

## Out Of Scope

- Multi-currency support (not sourced from any FR, and not confirmed as in-scope either).

---

### Juan Leites - 14/7/2026, 7:51:03

## Regla de cálculo del importe confirmada (2026-07-14)

Contador destrabó esta historia en sesión presencial.

### Regla por asiento

- `Código IVA > 0` → asiento "formato rápido" → importe = columna ***IVA*** del TXT.
- `Código IVA = 0` → asiento "abierto" → importe = columna ***Total*** (ya resuelto de Debe/Haber).
- Precondición: `RUT` debe tener 12 dígitos para considerarse válido.
- Si el campo opcional `Tipo` = `504`, tiene prioridad sobre la regla anterior: importe = columna Total directo (compra exenta).

### Agrupación

RUTs repetidos se consolidan en ***una sola línea***, sumando el IVA de todos sus asientos. No se generan múltiples líneas por el mismo tercero+código.

> ***INFO:*** Fuente completa: `.context/SRS/08-tax-engine.md`, `05-parser.md`. Pendiente todavía: mínimos DGI, rango/formato válido de importes (¿acepta cero/negativos?), redondeo — ver `07-validator.md`.

---

### Juan Leites - 15/7/2026, 6:15:09

## Confirmado 2026-07-15 — alcance del campo Tipo cerrado

El campo opcional `Tipo` (12ª columna del TXT) solo se procesa para el valor numérico `504` (compra exenta, prioridad sobre la cadena Código IVA). Los valores alfabéticos (`CIE`, `RES`, `DIF`, `APE`) quedan ***definitivamente fuera de alcance*** de este motor — no es un pendiente a revisar más adelante, es una exclusión cerrada.

Spec actualizada en `SRS/05-parser.md` y `SRS/08-tax-engine.md`.

---

### Juan Leites - 15/7/2026, 7:23:53

## Corregido y ampliado 2026-07-15 — regla de dos caminos, con archivo real de Memory

Se validó la spec contra un TXT real del cliente (`ASIENTOS JUNIO 2026.TXT`). Dos correcciones importantes sobre lo confirmado el 14/07:

***1. Los campos "Debe" y "Haber" no son importes.*** Son códigos de cuenta contable (ej. `5215` para una compra de combustible a Ancap), de largo variable. El delimitador real del TXT es `,` (coma), no `;`.

***2. La resolución de importe/código PADI tiene dos caminos, no uno******:***

- ***Código IVA > 0**** (formato rápido): el dígito resuelve directo vía la configuración de la empresa → toma columna ****IVA***.
- ***Código IVA = 0**** (asiento abierto): ****no se asume automáticamente "Compras exentas"****. Se busca la cuenta contable del asiento — campo Debe si es compra (`Libro` = `C`/`E`), campo Haber si es venta (`Libro` = `V`/`I`) — contra el plan de cuentas configurado por la empresa. Esa cuenta puede resolver a cualquier Nombre de Impuesto (Compras exentas, IVA compras básica, IVA ventas mínima, etc.), no solo a Compras exentas. Toma columna ****Total***.

Implicancia para el modelo de datos (TD-7/TD-24): el plan de cuentas debe soportar ***varias cuentas contables mapeando al mismo Nombre de Impuesto***, no solo para el caso de Compras exentas — es el mecanismo general del Camino 2.

Spec completa en `SRS/05-parser.md`, `06-normalizer.md`, `08-tax-engine.md`.

---

### Juan Leites - 16/7/2026, 17:10:42

## Alcance revisado 2026-07-16 — reducido tras TD-15

La regla de "qué columna leer" (IVA si Código IVA > 0, Total si Código IVA = 0 o Tipo = 504) ya la implementa TD-15 (Account Mapping) — cada línea resuelta por TD-15 (`resolveAsientoFiscal`) ya trae su `importe` correcto junto al `codigoPadi`. Esa parte del alcance original de esta historia (confirmado 14/7) queda cubierta y no se re-implementa acá.

Lo que ***no**** cubre TD-15 y sigue siendo responsabilidad de esta historia: la ****consolidación de líneas por RUT + código PADI***.

## Acceptance Criteria (reemplaza el alcance original)

```gherkin
Scenario: Dos asientos con mismo RUT y mismo código PADI se consolidan en una línea

  Given TD-15 resolvió dos asientos al mismo RUT y al mismo código PADI, con importes 500 y 300
   When se calculan las líneas declaradas
   Then se genera una única línea para ese RUT+código, con importe 800
```

```gherkin
Scenario: Mismo RUT con distinto código PADI genera líneas separadas

  Given TD-15 resolvió dos asientos con el mismo RUT pero código PADI "504" y "506" respectivamente
   When se calculan las líneas declaradas
   Then se generan dos líneas separadas, una por cada código PADI, sin sumar sus importes entre sí
```

```gherkin
Scenario: Un solo asiento para un RUT+código no requiere agregación

  Given TD-15 resolvió un único asiento para un RUT y código PADI dados
   When se calculan las líneas declaradas
   Then se genera una línea con el importe de ese asiento, sin cambios
```

```gherkin
Scenario: Los asientos sin resolver no generan línea

  Given TD-15 marcó un asiento como no resuelto (sin mapeo o fuera de alcance)
   When se calculan las líneas declaradas
   Then ese asiento no participa de ninguna línea ni de ninguna suma
```

## Business Rules Specification

1. ***Alcance reducido (2026-07-16)***: esta historia consume la salida ya resuelta de TD-15 (`codigoPadi`, `importe`, `rut` por asiento) — no vuelve a decidir qué columna leer, eso ya está resuelto.
2. ***Clave de agrupación***: RUT + código PADI (no RUT solo). Confirmado originalmente el 14/7: "no se generan múltiples líneas por el mismo tercero+código", lo que implica que tercero+código distinto sí genera líneas distintas.
3. ***Suma***: el importe de la línea consolidada es la suma de los importes de todos los asientos que comparten esa clave.
4. ***Asientos no resueltos***: excluidos completamente — no generan línea, no participan de ninguna suma (mismo criterio que TD-15: "se ignora, no bloquea").

## Spec Implementation Plan (Dev) — orientativo, a confirmar en la sesión de planning de TD-23

Función pura adicional (ej. `consolidarLineasDeclaracion(resueltos: NormalizedAsiento[]): LineaDeclaracion[]`), agrupa por `${rut}:${codigoPadi}`, suma importes. Mismo patrón que TD-15: sin UI, sin schema, leaf module para el futuro export (TD-20).

---


_Synced from Jira by sync-jira-issues_
