# Comments for TD-22

[View in Jira](https://lk-tudeclaracion.atlassian.net/browse/TD-22)

---

### Juan Leites - 7/7/2026, 20:24:15

Blocked — no AC until `Tax-rules/2181/mapping.md` is populated with real DGI line/code mapping rules.

---

### Juan Leites - 7/7/2026, 20:24:16

## Scope

- Each fiscal concept resolves to exactly one PADI line/code, via configurable (not hardcoded) rules (capability-level only; no mapping table implied).

---

### Juan Leites - 7/7/2026, 20:24:17

## Out Of Scope

- Manual override of an automatic mapping (future consideration, not sourced from any FR).

---

### Juan Leites - 14/7/2026, 7:51:01

## Reglas de mapeo Concepto → Código PADI confirmadas (2026-07-14)

Contador destrabó esta historia en sesión presencial.

### Cadena de resolución

1. Configuración por empresa (carga única, alta de empresa): el usuario asocia cada `Código IVA` (0-9) del TXT a una cuenta contable y a un "Nombre de Impuesto".
2. Tabla hardcodeada (no configurable por empresa) que traduce "Nombre de Impuesto" → código PADI.
3. Prioridad: si el TXT trae el campo opcional `Tipo` = `504`, el asiento se clasifica automáticamente como compra exenta sin pasar por los pasos 1-2.

### Catálogo completo (7 códigos, 2181)

| Código | Nombre de Impuesto |
| --- | --- |
| 502 | IVA ventas tasa básica |
| 503 | IVA ventas tasa mínima |
| 504 | Compras exentas |
| 505 | IVA compras tasa básica |
| 506 | IVA compras tasa mínima |
| 552 | Venta por cuenta ajena tasa básica (por cuenta y orden) |
| 553 | Venta por cuenta ajena tasa mínima |

### Casos especiales

- Compras exentas (504) admite ***varias cuentas contables*** (ej. gasoil, leche, carne, frutas, verduras) — todas resuelven al mismo código.
- Cuenta sin mapeo definido: se ***ignora***, no bloquea el archivo.
- Campo `Libro` (`C`/`V`/`E`/`I`/`P`) es informativo, no participa en la resolución del código.

> ***INFO:*** Fuente completa: `.context/SRS/08-tax-engine.md`, `06-normalizer.md`, `09-forms.md`, `05-parser.md`. Pendiente todavía: catálogo PADI para otras declaraciones juradas futuras (fuera del 2181), y reglas para `Tipo` = `CIE`/`RES`/`DIF`/`APE`.

---

### Juan Leites - 15/7/2026, 6:15:08

## Confirmado 2026-07-15 — alcance del campo Tipo cerrado

El campo opcional `Tipo` (12ª columna del TXT) solo se procesa para el valor numérico `504` (compra exenta, prioridad sobre la cadena Código IVA). Los valores alfabéticos (`CIE`, `RES`, `DIF`, `APE`) quedan ***definitivamente fuera de alcance*** de este motor — no es un pendiente a revisar más adelante, es una exclusión cerrada.

Spec actualizada en `SRS/05-parser.md` y `SRS/08-tax-engine.md`.

---

### Juan Leites - 15/7/2026, 7:23:52

## Corregido y ampliado 2026-07-15 — regla de dos caminos, con archivo real de Memory

Se validó la spec contra un TXT real del cliente (`ASIENTOS JUNIO 2026.TXT`). Dos correcciones importantes sobre lo confirmado el 14/07:

***1. Los campos "Debe" y "Haber" no son importes.*** Son códigos de cuenta contable (ej. `5215` para una compra de combustible a Ancap), de largo variable. El delimitador real del TXT es `,` (coma), no `;`.

***2. La resolución de importe/código PADI tiene dos caminos, no uno******:***

- ***Código IVA > 0**** (formato rápido): el dígito resuelve directo vía la configuración de la empresa → toma columna ****IVA***.
- ***Código IVA = 0**** (asiento abierto): ****no se asume automáticamente "Compras exentas"****. Se busca la cuenta contable del asiento — campo Debe si es compra (`Libro` = `C`/`E`), campo Haber si es venta (`Libro` = `V`/`I`) — contra el plan de cuentas configurado por la empresa. Esa cuenta puede resolver a cualquier Nombre de Impuesto (Compras exentas, IVA compras básica, IVA ventas mínima, etc.), no solo a Compras exentas. Toma columna ****Total***.

Implicancia para el modelo de datos (TD-7/TD-24): el plan de cuentas debe soportar ***varias cuentas contables mapeando al mismo Nombre de Impuesto***, no solo para el caso de Compras exentas — es el mecanismo general del Camino 2.

Spec completa en `SRS/05-parser.md`, `06-normalizer.md`, `08-tax-engine.md`.

---

### Juan Leites - 16/7/2026, 17:07:19

## Cerrado 2026-07-16 — superado por TD-15

La cadena de resolución confirmada para esta historia (14/7) era un modelo de dos pasos: Código IVA → cuenta + "Nombre de Impuesto" (paso 1), tabla fija "Nombre de Impuesto" → código PADI (paso 2). Ese paso 2 ya no existe: el rework de TD-7 (15/7, mismo día) descartó el intermedio "Nombre de Impuesto" como dato persistido — `plan*cuentas` resuelve directo `cuenta*contable`/`Código IVA` → `codigo_padi`.

TD-15 (Account Mapping), implementado y en revisión el 16/7, ya resuelve cada línea de asiento directo a código PADI usando exactamente esa configuración — incluyendo la prioridad del campo `Tipo = 504` y el Camino 2 (cuenta contable) que esta historia también documentaba. No queda lógica de mapeo pendiente que TD-15 no cubra.

***Gap real encontrado, no cubierto por TD-15 ni por esta historia***: el catálogo completo del 2181 tiene 7 códigos PADI (502/503/504/505/506/552/553), pero el `check` constraint de `plan*cuentas` (TD-7) solo permite 5 — no soporta 552/553 (Venta por cuenta ajena tasa básica/mínima). Ese es un gap de cobertura de datos, no de lógica de mapeo, y queda fuera del alcance de esta historia. Se abre como punto separado a definir (extender `plan*cuentas` o confirmar que 552/553 están fuera del MVP).

Detalle completo de la decisión: `.context/PBI/epics/EPIC-TD-14-normalization-validation/stories/STORY-TD-15-account-mapping-map-accounting-entries-to-fiscal-c/` (review.md + comments.md) y engram topic `architecture/normalizer-tax-resolution-scope`.

---


_Synced from Jira by sync-jira-issues_
