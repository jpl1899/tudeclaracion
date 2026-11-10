# Preguntas pendientes — Formulario 1376 (para el usuario / la contadora)

> Append-only. Cuando una se resuelve, se tacha (`~~texto~~`) con fecha y decisión, no se borra. Mismo criterio que `.context/open-questions.md` y `tax-rules/2181/preguntas-pendientes-contador.md`.

Sembrado 2026-08-27 (pasada incremental de `/project-foundation`, MVP 2 Track A).

## Catálogo de líneas

- [x] ~~Catálogo completo y real de códigos de línea del 1376 por panel/rubro (DGI lo publica en imágenes; no capturado). _(2026-09-01: TD-38 lo sembró provisoriamente como tabla configurable `codigo_linea_1376` con los 10 códigos del diseño — 101/102/103/201/301/302/501/502/510/601. Reemplazar el seed cuando llegue el catálogo real de DGI, sin tocar código.)_~~ **Resuelto 2026-10-01 (usuario + contador)**: los 10 códigos de `codigo_linea_1376` (101/102/103/201/301/302/501/502/510/601) **no son provisorios, son los reales**. Es la base para continuar.
- [x] ~~¿Los códigos del ejemplo de diseño (101/201/301/302/501/502/510/601) son los números de línea reales que espera PADI, o son ilustrativos? _(2026-09-01: se usan como seed provisorio del combo en TD-38 hasta confirmar contra DGI.)_~~ **Resuelto 2026-10-01**: son los reales (ver arriba).
- [ ] Descripción fiscal precisa de cada línea.
- [ ] Regla de selección de código "según tipo de contribuyente/sector": IRAE 108/126/128, IPAT 328/320/323, Sobretasa IPAT 335/330/333. ¿Qué la determina?
- [ ] **(2026-09-29) Reemplazar el catálogo provisorio por las líneas reales del formulario — pendiente de validar con la contadora.** Se extrajo el catálogo del formulario oficial de PADI (`Instalacion_Formulario_1376_Version_01_R05.37658.exe` de descargas.dgi.gub.uy → `F1376v01.jar`, descompilado) y la ayuda oficial de importación (`f1376v01_ayuda_importacion.pdf`, dentro del mismo instalador). Hallazgos:
  - El archivo de importación usa el **número de línea del formulario** (`linea;importe`). Ninguno de los códigos del seed (101/102/103/201/301/302/501/502/510/601) existe en el formulario; PADI los ignoraría con una advertencia ("la línea X no existe en este formulario, será ignorada").
  - Panel 1 — Ventas (Importe / IVA): No gravadas L8; Exportación L9; IVA en suspenso L78; Impuesto percibido L10; Gravadas tasa mínima L11 / L15; Gravadas tasa básica L12 / L16; fila sin etiqueta L13 / L17; TOTAL L14 / L18.
  - Panel 1 — Cálculo de IVA Compras Deducible (filas No gravadas / Exportación / Suspenso / Percibido / Gravadas / TOTALES): acum. ventas ejercicio 249, 253–257; porcentual 258–263; acum. mes actual 264–269; acum. mes anterior 270–275; directo del mes 276, 277, 284, 285, 278, 279; total del mes 290–294, 62.
  - Panel 2: 18, 19, 21, 57, 77, 22, 68, 63, 65, 66, 67, 23, 44, 45, 24, 25, 26, 46, 47, 48, 27, 40, 41, 42, 43.
  - Panel 3: 49 (Retenciones OTT), 90, 91, 30 (marca IRAE), 31 (coeficiente, decimal con punto), 32, 79, 87 (marca IRAE agro), 76, 81, 95, 96, 82, 34, 33, 84.
  - Panel 4 (marca / monto): IPAT 35/38; IPAT agro 37/36; Sobretasa 55/56; Sobretasa agro 85/54; ICOSA 53/52; IRPF retiro utilidades 86/59.
  - Panel 5 / pago: 322 saldo a pagar; 970/971/972 (1=Sí, 2=No); 320–326 y pares 70x/80x de compensación.
  - Flags de importación: `MOSTRARLINEAS1;1|2` y `MOSTRARLINEAS2;1|2`.

  _(2026-10-01: el usuario y el contador confirman que los códigos 101–601 de la app son los reales y la base para continuar. Queda registrado que difieren de los números de línea hallados en el formulario descompilado; la prueba definitiva es importar en PADI un archivo generado por la app.)_

  A confirmar con la contadora (idealmente con captura de PADI): (a) qué representa la fila sin etiqueta L13/L17 (DGI indica que la deducción por incobrables va en L17 con signo negativo); (b) los encabezados de columna de la grilla de IVA compras (alineados por posición en pantalla, lo menos seguro); (c) qué líneas son de ingreso (mapeables a cuentas) y cuáles las calcula PADI (totales, saldos, excedentes); (d) de dónde salen las líneas de "marca" (L30/L35/L37/L53/L55/L85/L86/L87), que no son montos. Nota: la página DGI "Anticipos de Otros Impuestos" dice que el tipo de anticipo IPAT va en L30; el formulario y la ayuda de importación dicen **L35** (L30 es la marca de IRAE).

## Motor / fórmulas

- [x] ~~Cómo se computa el saldo de una cuenta contable desde el formato del TXT del 2181 (Debe/Haber = códigos de cuenta, importes en Total/IVA). ¿Qué columna de importe imputa a cada lado? ¿Depende del código de línea destino?~~ **Resuelto 2026-09-01 (con la contadora)**: la columna de importe (`Total` | `IVA`) la define el contador **por fila** en la matriz de mapeo del 1376 (TD-38) — `Total` para asientos abiertos, `IVA` para el "formato rápido" de Memory Conty. El motor toma, por cada cuenta mapeada, el importe de su columna configurada.
- [x] ~~Qué columna de importe (`Total` vs `IVA`) alimenta cada tipo de línea (base imponible vs IVA).~~ **Resuelto 2026-09-01**: no depende del tipo de línea sino del formato del asiento, y queda configurado por fila en el mapeo (ver arriba).
- [x] ~~Conversión de moneda para `Moneda = 1`: ¿mismo mecanismo de cotización que el 2181?~~ **Resuelto 2026-09-01**: sí, misma conversión por cotización que el 2181.
- [x] ~~Tratamiento de movimientos negativos (devoluciones, notas de crédito) en la agregación.~~ **Resuelto 2026-09-01**: entran como importes en negativo y se suman en forma simple con los positivos.
- [x] ~~Redondeo: ¿mismo criterio que el 2181 o distinto? (el ejemplo real muestra enteros).~~ **Resuelto 2026-09-01**: mismo criterio que el 2181 (mitad hacia abajo).
- [ ] ¿El motor determina la liquidación (saldo a pagar, líneas 322/970/971/972, boleto 2908) o solo entrega totales por código de línea? _(2026-09-01: diferido — "lo vemos en la marcha"; TD-41 queda por ahora en totales por código, consistente con ADR-0006)._
- [x] ~~¿El mapeo de cuenta→código del 1376 necesita el RUT de terceros en los asientos, como el 2181?~~ **Resuelto 2026-09-17**: no. El 1376 no discrimina por RUT — solo toma el saldo total de la cuenta contable mapeada (según su columna configurada), a diferencia del 2181 que sí consolida por RUT+código (TD-23).
- [x] ~~¿Con qué separador se lee el TXT de entrada (Memory) vs. con qué separador se escribe el archivo de salida hacia PADI?~~ **Resuelto 2026-09-17**: son dos archivos distintos, cada uno con su propio separador — no hay contradicción. (1) TXT de entrada (exportado por Memory, el que sube el usuario): separador coma, ya confirmado para todas las declaraciones (2181, 1376, etc.) porque comparten el mismo parser — ver `SRS/05-parser.md` (confirmado 2026-07-15 contra `ASIENTOS JUNIO 2026.TXT`). (2) Archivo de salida a importar en PADI: separador `;`, consistente con el instructivo oficial de DGI (`Tax-rules/common/padi-import-format.md`) para las 8 familias que documenta.
- [x] ~~Separador del archivo de salida del 1376 hacia PADI~~ **Resuelto 2026-09-17**: `;`, formato `codigo;importe` por línea (ej. `101;10000`) — confirmado por el usuario, consistente con la convención de DGI para el resto de formularios.
- [x] ~~Layout posicional exacto restante~~ **Resuelto 2026-10-01 (usuario + contador)**: el archivo de salida son solo varias líneas `codigo_padi;total` (separador `;`, sin encabezado), un total por código según el mapeo del contador. La entrada sigue siendo el TXT separado por comas. Texto original: (¿una línea por código con longitud fija, o `codigo;importe` de longitud variable como en el ejemplo? ¿lleva cabezal con RUT/formulario/período como el 2181?) — el instructivo de DGI no documenta el formulario 1376, así que esto queda sin confirmar hasta tener un ejemplo real completo o acceso al PADI. No bloquea TD-41/TD-42 (cálculo interno); sí bloquea TD-44 (exportación).

## Datos que el TXT mensual no trae

- [ ] Panel 1 pide **ventas y compras acumuladas del ejercicio** — fuente del dato (¿acumular varios TXT mensuales? ¿carga aparte? ¿lo trae otro export de Memory?).
- [ ] Tipo de anticipo IPAT (línea 30) y tipo de anticipo ICOSA (línea 53) — son selecciones, no montos; ¿de dónde salen?

## Alcance MVP 2 Track A

- [ ] ¿"DJ sin movimiento" entra en MVP 2?
- [ ] ¿Giro agropecuario (líneas 33/36/54 + códigos especiales rural) entra en MVP 2?
- [ ] ¿IVA en Suspenso / chatarra-residuos entra en MVP 2?
- [ ] Matriz de mapeo: ¿admite versión/histórico como el `plan_cuentas`? ¿se ofrece un mapeo base sugerido (US M2.3)?
- [ ] Cuenta con movimiento no mapeada: ¿la advertencia bloquea la descarga o solo avisa?

## Fixtures de prueba

- [ ] TXT reales de asientos ya procesados en PADI para la 1376 + su resultado esperado (`CODIGO;MONTO`) — pendiente que la contadora los aporte tras probar el MVP (Excel `DJ 1376.xlsx`, observación R112).
