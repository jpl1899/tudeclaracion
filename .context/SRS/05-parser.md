# 05 — Parser

> Estado: **campos confirmados y validados contra un archivo real** (`ASIENTOS JUNIO 2026.TXT`, 2026-07-15). `c:\Users\DISCO\Downloads\2181.txt` es el **TXT de salida** (compatible con PADI), documentado en `10-exporter.md` — no confundir ambos formatos.

## Responsabilidad

Interpreta el TXT mensual exportado por Memory → objetos estructurados. Mayormente técnico: **sin decisiones tributarias** (código PADI, importes — esas viven en `08-tax-engine.md`).

**Excepción confirmada 2026-08-02**: el parser recibe el plan de cuentas de la empresa (`PlanCuentaRow[]`) para poder cruzar Libro contra el prefijo de la cuenta de IVA resuelta (Camino 2) y reportarlo **junto** al resto de los campos inválidos de la misma línea — no recién cuando la línea ya pasó el parseo estructural y llega al motor tributario. La lógica de matching (`resolverCuentaCamino2`) vive en `src/modules/plan-cuentas/`, compartida entre el parser y `normalize-asiento.ts` para no duplicarla. Esto significa que importar un TXT ya no es una operación puramente sincrónica/client-side: `handleImportar` (`dashboard-client.tsx`) primero busca el plan de cuentas de la empresa activa en Supabase y recién después llama al parser.

## Formato confirmado del TXT de entrada

Delimitador: `,` (coma) — **corregido 2026-07-15**, no `;` como se documentaba antes; confirmado contra `ASIENTOS JUNIO 2026.TXT`. Los campos alfanuméricos vienen entre comillas dobles; los numéricos, sin comillas. Campos en este orden, de izquierda a derecha:

| # | Campo | Formato | Regla |
| --- | --- | --- | --- |
| 1 | Día | Numérico | Sin cero a la izquierda en la práctica (ej. `1`, no `01`), aunque representa 01–31 |
| 2 | Debe | Numérico, largo variable, **puede venir vacío** | **Corregido 2026-07-15**: NO es un importe — es el **código de cuenta contable que se debita** en el asiento (ej. `5215`, `114115`). Ver `06-normalizer.md` / `08-tax-engine.md` para cómo se usa en la resolución del código PADI. **Confirmado 2026-07-21**: un asiento "abierto" (multilínea, una cuenta por línea) legítimamente trae Debe vacío en las líneas donde solo hay Haber — Debe y Haber nunca están vacíos **a la vez** en la misma línea. |
| 3 | Haber | Numérico, largo variable, **puede venir vacío** | **Corregido 2026-07-15**: tampoco es un importe — es el **código de cuenta contable que se acredita**. Misma naturaleza que Debe, cuenta distinta. Mismo permiso de vacío que Debe (ver arriba) — nunca ambos a la vez. |
| 4 | Concepto | Alfanumérico, 20–50 caracteres | Nunca vacío. Ej: `Efactura A 1234`, `Ancap Ticket A 12452548` |
| 5 | RUT | Numérico, 12 dígitos | **Corregido 2026-10-05 (ADR-0008)**: se exige solo en las líneas que resuelve el 2181 (Tipo `504`; Código IVA > 0 mapeado; o Código IVA = 0 con cuenta de Debe/Haber en el plan de cuentas 2181). El 1376 declara solo totales y no usa el RUT, así que una línea ajena al 2181 (ej. anticipo de IRAE, 13122 contra 11111) acepta cualquier valor. |
| 6 | Moneda | Numérico, 1 dígito (0–9) | 0 = pesos, 1 = dólares |
| 7 | Total | Numérico | Sin separador de miles en la práctica (ej. `1000`). Campo crítico |
| 8 | Código IVA | Numérico, 1 dígito (0–9) | `0` = sin código asignado (ver regla de dos caminos en `08-tax-engine.md`) |
| 9 | IVA | Numérico, con decimales | Siempre en pesos (ej. `180.33`) |
| 10 | Cotización | Numérico | **Confirmado 2026-08-02**: `0` (pesos) o un valor con dos dígitos enteros y dos decimales (ej. `38.45`) — el peso uruguayo nunca cotiza por debajo de 10, así que un solo dígito entero también es inválido. Ampliado después: cualquier cantidad de decimales (2026-08-19), y el cero también puede venir con decimales, ej. `0.0000` (2026-10-05) |
| 11 | Libro | Categórico, **case-insensitive** | Solo uno de: `C`, `V`, `E`, `I`, `P` (confirmado 2026-07-22: el TXT puede traerlo en minúscula — ej. notas de crédito con `"v"` — se normaliza a mayúscula al parsear) |
| 12 | Tipo | Categórico, **opcional** | Confirmado 2026-07-14. En la práctica el campo 12 aparece siempre como posición (coma final), vacío cuando no aplica. Valores posibles en el TXT: `504`, `CIE` (cierre del ejercicio), `RES` (resultado del ejercicio), `DIF` (diferencia de cambio), `APE` (apertura de ejercicio) — pero **confirmado 2026-07-15**: el motor solo procesa el valor numérico `504`; los valores alfabéticos (`CIE`/`RES`/`DIF`/`APE`) se ignoran, fuera de alcance definitivo. Regla de negocio de `504` → ver `08-tax-engine.md`. Nunca contiene `502`, `503`, `505`, `506`, `552` o `553` — esos códigos PADI solo se derivan por la cadena Código IVA / cuenta contable → configuración de empresa. |

**Ejemplo real** (`ASIENTOS JUNIO 2026.TXT`, línea 5 — compra exenta):
```
5,"5215","11111","Ancap Ticket A 12452548","233669988774",0,1000,0,0,0,"E",
```
Cuenta debitada `5215` (combustible), Código IVA `0` → dispara la resolución por cuenta contable (ver `08-tax-engine.md`); Total `1000` es el importe que se declara.

> **Corrección 2026-07-13**: el usuario confirmó que el nombre real del campo 11 es **Libro** (no "Libre" como se había documentado antes) — se aplica sin excepción a todas las líneas.

> **Confirmado 2026-07-14 — significado del campo Libro**: `C` y `E` = egresos (compras) — IVA compras tasa básica, tasa mínima, o compras exentas. `V` e `I` = ventas — IVA ventas tasa básica o tasa mínima. `P` = libre uso para data entry — no permite inferir dirección (compra/venta).
>
> **Historial de la validación de consistencia de Libro** — revertida dos veces, estado final más abajo:
> - 2026-07-14: se asumía que no requería validación propia (el contador confirmó que venía pre-validado por Memory).
> - **Revertido 2026-07-21**: la ampliación del 2026-07-15 (Libro decide si el Camino 2 mira Debe o Haber) quedó descartada — el usuario confirmó que Libro "es un dato innecesario para el motor" (una nota de crédito real traía `Libro='E'` con su cuenta de IVA en Haber, no en Debe, y esa regla posicional no la resolvía). El Camino 2 pasó a probar Debe y después Haber contra el plan de cuentas, sin mirar Libro.
> - **Revertido de nuevo 2026-08-02** (sesión en vivo con el contador, TXT con un asiento de venta que traía `Libro='E'` por error): Libro vuelve a ser decisorio, pero ya no por posición (Debe/Haber) sino por **prefijo de la cuenta contable resuelta** — el contador confirmó que una cuenta de IVA que empieza con `2` es siempre venta (Libro debe ser `V`/`I`) y una que empieza con `1` es siempre compra (Libro debe ser `C`/`E`). Si el TXT trae un Libro inconsistente con el prefijo de la cuenta resuelta, la línea se excluye del PADI (mismo tratamiento que "sin mapeo") — esto es justamente lo que permite detectar un TXT mal generado, el caso que la regla del 2026-07-21 no cubría. Cuentas que no empiezan con `1` ni `2` (ej. Gastos, usadas para compras exentas) no tienen dirección propia y no se cruzan contra Libro; `Libro='P'` tampoco. Detalle de la implementación en `08-tax-engine.md`.
> - **Ampliado, mismo día 2026-08-02**: el contador señaló que si la línea también trae otros campos estructuralmente inválidos (RUT, Moneda, Cotización), el error de Libro inconsistente debe reportarse **en la misma pasada**, no solo cuando la línea llega intacta al motor tributario. Como el archivo se aborta por completo ante cualquier campo inválido (ver más abajo), el motor nunca llegaba a evaluar esa línea. Por eso el parser ahora recibe el plan de cuentas y corre este mismo chequeo (Código IVA = 0 → busca la cuenta de Debe/Haber que matchea el plan de cuentas → cruza su prefijo contra Libro) como parte de la validación estructural de la línea.

## Confirmado 2026-08-04 — variante de 13 campos (proveedor FMSSRL)

Algunos proveedores contables (ej. FMSSRL, archivo `FMSSRL Asientos Abril 2026.TXT`, empresa real del contador en regresión) exportan la línea con **13 campos** en vez de 12: agregan un campo extra sin uso **después** de Tipo (que se mantiene en su posición 12 de siempre). El campo 13 se ignora por completo — no se valida, no se usa. El parser acepta ambas variantes (12 o 13 campos) leyendo Tipo siempre de la posición fija 12.

> **Corregido el mismo día**: la primera versión de esta corrección asumía (mal) que el campo nuevo se insertaba *antes* de Tipo, corriéndolo a la posición 13 — el contador confirmó con un ejemplo real (`Día 9, RUT 012547412548, Libro "E", Tipo "504"` en la posición 12, campo 13 vacío) que Tipo nunca se mueve de la posición 12; el campo nuevo siempre va al final.

## Confirmado 2026-07-22 — fila de encabezado opcional

El TXT puede venir con o sin una primera fila de encabezado (`DIA,DEBE,HABER,CONCEPTO,RUT,...`) describiendo los campos — depende de cómo lo exporte el proveedor contable en cada caso. El parser la detecta (campo Día no numérico, valor `DIA`) y la descarta antes de interpretar datos; no se trata como una línea inválida y no corre el conteo de línea de los asientos reales.

## Aceptado 2026-08-07 — layout configurable de campos (reemplaza el caso FMSSRL puntual)

**Ver `ADR-0005-configurable-txt-field-layout-2181.md` para el detalle completo de contexto, decisión y alternativas descartadas.** Implementado en `parse-asientos.ts` (TD-31, 2026-08-08) — el fix ad-hoc del 13er campo (FMSSRL) queda cubierto como el caso particular de `numeroAsiento` habilitado. La configuración de columnas especiales es efímera (estado de `ImportarAsientoDialog`, se descarta al cerrar el diálogo) — no hay tabla nueva en Supabase.

El TXT puede traer hasta 9 columnas adicionales conocidas, agregadas por distintos proveedores contables: C.Costos, Comprobante, Número, Emisión, Vencimiento, Número Documento, Serie Documento, Serie, Número Asiento. Estas se ignoran por completo (no se validan, no se usan) — junto con los 12 campos obligatorios (Día, Debe, Haber, Concepto, RUT, Moneda, Total, Código IVA, IVA, Cotización, Libro, Tipo), forman el universo cerrado de 21 campos posibles, en un **orden canónico fijo**:

```
Día, Debe, Haber, [C.Costos, Comprobante, Número], Concepto, [Emisión, Vencimiento],
RUT, Moneda, Total, Código IVA, IVA, Cotización, Libro,
[Número Documento, Serie Documento, Serie, Número Asiento]
```

(entre corchetes, los campos opcionales — su presencia o ausencia no altera el orden relativo del resto).

**Archivos de 11 o 12 campos** (modelo clásico, sin columnas adicionales): se procesan exactamente como hoy, sin ningún cambio ni configuración.

**Archivos con otra cantidad de campos**: la subida queda bloqueada hasta que el usuario complete una configuración previa — checklist de los 21 campos posibles, los 12 obligatorios siempre habilitados, los 9 especiales deshabilitados por defecto. El usuario habilita solo los que su archivo puntual trae. La posición de cada campo se deriva de esa selección + el orden canónico fijo — nunca se infiere por el contenido/forma del valor (dos campos especiales pueden compartir tipo de dato y cantidad de dígitos sin ambigüedad, porque nunca se identifican por su valor).

Reglas de la configuración:
- Es **por archivo completo**, nunca por línea individual ni por asiento. El ancho de línea (cantidad de campos separados por coma) es fijo para todo el archivo: 12 + cantidad de especiales habilitados.
- **Invariante**: toda línea del archivo debe tener exactamente esa cantidad de campos. Una línea con una cantidad distinta es un campo estructuralmente inválido — mismo tratamiento que hoy (aborta el archivo completo, ver sección más abajo).
- Un campo especial habilitado que no tiene dato aplicable en una línea puntual viene **vacío** en su posición (no ausente) — esto permite que distintas líneas del mismo archivo tengan contenido distinto sin requerir esquemas distintos entre sí.
- Un campo que no está en ninguna de las dos listas (ni de los 12 obligatorios ni de los 9 especiales conocidos) se reporta al usuario como campo desconocido.

Esta regla **generaliza y reemplaza** el fix puntual del 2026-08-04 (proveedor FMSSRL, campo 13 fijo después de Tipo) — ese caso queda cubierto como una instancia particular (solo "Número Asiento" u otro campo único habilitado) de esta mecánica general.

**No forma parte de este alcance, decidido explícitamente que no se implementa**: tope de longitud en Debe/Haber, tope de importe en Total/IVA, tabla de monedas configurable, ampliación del rango de Tipo más allá de `504`/`CIE`/`RES`/`DIF`/`APE`. Código IVA no cambia — `0` sigue siendo el sentinel que dispara Camino 2.

## Confirmado 2026-08-17 — advertencia genérica cuando faltan columnas obligatorias

`ImportarAsientoDialog` (TD-31, ADR-0005) ya distingue el modelo clásico (11/12 campos) del caso con columnas de más, mostrando un checklist para que el usuario declare cuáles de las 9 especiales trae su archivo. Nunca contempló el caso inverso: un archivo con **menos** de 11 campos, porque le falta alguna de las 12 obligatorias.

**Caso real disparador**: el contador recibió el TXT mensual de un cliente (`Estancia los molles.txt`, setiembre 2026) con 10 campos por línea en las 106 líneas del archivo — sin columna RUT, algo que ese cliente normalmente sí incluye y que el contador no advirtió al recibirlo.

Hoy ese archivo cae en la misma rama que "sobran columnas" (`esNoEstandar`): muestra el checklist de especiales, cuyo ancho declarado arranca en 12 y solo puede subir. Con 10 campos detectados nunca hay forma de igualar ese ancho, así que el botón "Importar" queda deshabilitado sin ninguna explicación de por qué.

**Decisión**: cuando se detectan menos de 11 campos en la primera línea de datos, mostrar un mensaje de bloqueo genérico — sin intentar adivinar cuál columna falta — y esperar que el usuario (el contador, con conocimiento del dominio) pida al proveedor contable una versión completa del archivo. No hay ningún camino de importación para este caso.

- Nueva condición, independiente de `esNoEstandar` (que queda acotada a más de 12 campos): `esFaltante = camposDetectados !== null && camposDetectados < 11`.
- El mensaje tiene dos líneas: "Faltan N columna(s), por favor revisa los asientos" (con `N = 11 - camposDetectados` y singular/plural según corresponda) y, debajo, "Campos esperados en orden: Día, Debe, Haber, Concepto, RUT, Moneda, Total, Código IVA, IVA, Cotización, Libro." No incluye título ni el cierre de "pedile al proveedor contable...".
- El botón "Importar" queda deshabilitado siempre que `esFaltante` sea true — no existe ninguna configuración que lo desbloquee, a diferencia del checklist de especiales.
- No se toca `parse-asientos.ts`: el chequeo vive enteramente en `ImportarAsientoDialog`, antes de siquiera intentar `parseAsientosTxt` — igual que hoy hace `esNoEstandar`.

**Corregido 2026-08-17, mismo día (verificación manual con un archivo real editado a propósito)**: probando con un archivo real donde además de faltarle una columna en toda la línea (setiembre, `Estancia los molles.txt`) se le sacaron campos adicionales solo en una línea puntual (línea 44, no toda la línea), se confirmó que `camposDetectados` solo mira la primera línea de datos — el mensaje no puede reflejar problemas de líneas específicas más abajo sin escanear el archivo completo, algo fuera de alcance por decisión explícita. El conteo "N" es siempre el de la primera línea, puede haber más líneas con otros problemas que el mensaje no refleja. El texto se simplificó a "Faltan N columna(s), por favor revisa los asientos" (con singular/plural), pero conserva la lista de campos obligatorios en orden — el usuario confirmó que esa lista tiene que quedar.

**Alternativas descartadas**:
- *Detección automática de cuál campo falta*, probando cada combinación posible contra las reglas de validación de cada campo (RUT 12 dígitos, Moneda 0/1, Libro enum, etc.) hasta encontrar la que hace válido el archivo completo. Más preciso que el conteo puro que rechazó ADR-0005 — los campos obligatorios tienen validaciones bien distintas entre sí —, pero el usuario lo descartó explícitamente: no tiene sentido intentar cubrir cada variante de error humano en el archivo de origen, el espacio de casos es infinito. Consistente además con la filosofía de ADR-0005: nunca se infiere el layout por contenido.
- *Checklist inverso* (como el de especiales, pero el usuario destilda cuáles de los 12 obligatorios faltan) — descartado a favor del mensaje genérico: no hace falta que el usuario "confirme" nada en la UI, el archivo de todos modos queda bloqueado sin importar cuál sea el campo faltante.

**Consecuencias**: el mensaje es el mismo sin importar cuál(es) columna(s) falten — deliberadamente no distingue "falta RUT" de "falta Moneda y Cotización". Si en el futuro aparece evidencia real de que el mensaje genérico no alcanza, se puede revisar esta decisión con un caso concreto, no antes.

No amerita un ADR nuevo — no pasa el gate 2 de `.context/ADR/README.md` (hard to reverse): es una extensión de bajo riesgo de la lógica de UI ya cubierta por ADR-0005, sin tocar el modelo de datos ni el parser.

## Compartido con el 1376 (MVP 2 Track A) — 2026-08-27

El motor de la DJ 1376 (`13-forms-1376.md`) consume **el mismo TXT de entrada** que el 2181 — mismo formato, mismo Parser, sin cambios acá. La divergencia empieza aguas abajo: el 1376 agrega saldos por cuenta contable en vez de resolver línea por línea y consolidar por RUT (ver `08-tax-engine.md` §"Modo 1376" y `ADR-0006`). Abierto: cómo se computa el saldo de una cuenta desde este formato (donde `Debe`/`Haber` son códigos de cuenta, no importes) — `[PLACEHOLDER]` en `13-forms-1376.md`.

## Pendiente de producto (no bloquea el motor)

- Agregar botón **"Importar asiento"** (archivo `.txt`) en `/dashboard`, luego de presionar "Iniciar nueva declaración" (contador, 2026-07-14).

## Manejo de líneas inválidas/malformadas — confirmado 2026-07-16, ampliado 2026-08-02

Si una línea trae un dato inválido en cualquier campo, la interpretación del archivo completo se aborta — no se generan datos parciales. Rosana ve un mensaje que identifica el número de línea, mostrado con el patrón genérico `alert.error` de `design-system.html` (mismo patrón que usarán TD-16/17/18) — no requiere mockup dedicado.

**Ampliado 2026-08-02**: si esa línea trae **más de un** campo inválido a la vez, el parser ya no reporta solo el primero que encuentra — valida todos los campos de la línea y devuelve la lista completa de campos inválidos en una sola pasada (ej. RUT y Moneda inválidos en la misma línea se reportan juntos).

## Confirmado 2026-07-17

- **Encoding**: UTF-8. Verificado además de forma independiente contra los dos archivos reales de muestra (`ASIENTOS JUNIO 2026.TXT`, `Anexo2181 - 212583570018.txt`) — ambos son ASCII puro, subconjunto válido de UTF-8, sin conflicto.
- **Volumen esperado**: puede superar las 1000 líneas por archivo mensual — el parser debe soportar ese volumen sin degradación notable de performance (no hay un techo exacto confirmado todavía, solo que 1000 no es un límite seguro para asumir).

No fabricar el resto de esta spec — se completa a medida que el usuario la provea.
