# 05 — Parser

> Estado: **campos confirmados y validados contra un archivo real** (`ASIENTOS JUNIO 2026.TXT`, 2026-07-15). `c:\Users\DISCO\Downloads\2181.txt` es el **TXT de salida** (compatible con PADI), documentado en `10-exporter.md` — no confundir ambos formatos.

## Responsabilidad

Interpreta el TXT mensual exportado por Memory → objetos estructurados. Puramente técnico: **sin decisiones tributarias** (esas viven en `08-tax-engine.md`).

## Formato confirmado del TXT de entrada

Delimitador: `,` (coma) — **corregido 2026-07-15**, no `;` como se documentaba antes; confirmado contra `ASIENTOS JUNIO 2026.TXT`. Los campos alfanuméricos vienen entre comillas dobles; los numéricos, sin comillas. Campos en este orden, de izquierda a derecha:

| # | Campo | Formato | Regla |
| --- | --- | --- | --- |
| 1 | Día | Numérico | Sin cero a la izquierda en la práctica (ej. `1`, no `01`), aunque representa 01–31 |
| 2 | Debe | Numérico, largo variable | **Corregido 2026-07-15**: NO es un importe — es el **código de cuenta contable que se debita** en el asiento (ej. `5215`, `114115`). Ver `06-normalizer.md` / `08-tax-engine.md` para cómo se usa en la resolución del código PADI. |
| 3 | Haber | Numérico, largo variable | **Corregido 2026-07-15**: tampoco es un importe — es el **código de cuenta contable que se acredita**. Misma naturaleza que Debe, cuenta distinta. |
| 4 | Concepto | Alfanumérico, 20–50 caracteres | Nunca vacío. Ej: `Efactura A 1234`, `Ancap Ticket A 12452548` |
| 5 | RUT | Numérico, 12 dígitos | — |
| 6 | Moneda | Numérico, 1 dígito (0–9) | 0 = pesos, 1 = dólares |
| 7 | Total | Numérico | Sin separador de miles en la práctica (ej. `1000`). Campo crítico |
| 8 | Código IVA | Numérico, 1 dígito (0–9) | `0` = sin código asignado (ver regla de dos caminos en `08-tax-engine.md`) |
| 9 | IVA | Numérico, con decimales | Siempre en pesos (ej. `180.33`) |
| 10 | Cotización | Numérico | — |
| 11 | Libro | Categórico | Solo uno de: `C`, `V`, `E`, `I`, `P` |
| 12 | Tipo | Categórico, **opcional** | Confirmado 2026-07-14. En la práctica el campo 12 aparece siempre como posición (coma final), vacío cuando no aplica. Valores posibles en el TXT: `504`, `CIE` (cierre del ejercicio), `RES` (resultado del ejercicio), `DIF` (diferencia de cambio), `APE` (apertura de ejercicio) — pero **confirmado 2026-07-15**: el motor solo procesa el valor numérico `504`; los valores alfabéticos (`CIE`/`RES`/`DIF`/`APE`) se ignoran, fuera de alcance definitivo. Regla de negocio de `504` → ver `08-tax-engine.md`. Nunca contiene `502`, `503`, `505`, `506`, `552` o `553` — esos códigos PADI solo se derivan por la cadena Código IVA / cuenta contable → configuración de empresa. |

**Ejemplo real** (`ASIENTOS JUNIO 2026.TXT`, línea 5 — compra exenta):
```
5,"5215","11111","Ancap Ticket A 12452548","233669988774",0,1000,0,0,0,"E",
```
Cuenta debitada `5215` (combustible), Código IVA `0` → dispara la resolución por cuenta contable (ver `08-tax-engine.md`); Total `1000` es el importe que se declara.

> **Corrección 2026-07-13**: el usuario confirmó que el nombre real del campo 11 es **Libro** (no "Libre" como se había documentado antes) — se aplica sin excepción a todas las líneas.

> **Confirmado 2026-07-14 — significado del campo Libro**: `C` y `E` = egresos (compras) — IVA compras tasa básica, tasa mínima, o compras exentas. `V` e `I` = ventas — IVA ventas tasa básica o tasa mínima. `P` = libre uso para data entry — no permite inferir dirección (compra/venta); para estas líneas se resuelve exclusivamente por la cadena ya confirmada en `08-tax-engine.md`. **Ampliado 2026-07-15**: el campo Libro sí participa, indirectamente, en la resolución por cuenta contable (el camino "asiento abierto" de `08-tax-engine.md`) — determina si se busca la cuenta en el campo Debe (compra, `C`/`E`) o en el campo Haber (venta, `V`/`I`). No requiere validación de consistencia propia — el contador confirmó que viene pre-validado por Memory antes de exportar el TXT.

## Pendiente de producto (no bloquea el motor)

- Agregar botón **"Importar asiento"** (archivo `.txt`) en `/dashboard`, luego de presionar "Iniciar nueva declaración" (contador, 2026-07-14).

## Qué falta confirmar

- Encoding, manejo de líneas inválidas/malformadas.
- Volumen esperado (líneas por archivo mensual) — relevante para performance del parser.

No fabricar el resto de esta spec — se completa a medida que el usuario la provea.
