# Accountant answers — Ayuda review notes (2026-10-20)

Answers to the `<!-- revisar contador -->` notes in `content/ayuda/`. Verbatim (Spanish) as given by the accountant; propagated to the help content on 2026-10-21.

| # | Note (file) | Answer |
|---|---|---|
| 1 | Formato rápido vs. asientos abiertos (`02-archivo-txt.md`) | Un asiento abierto es cuando viene por lo menos el movimiento contable en 3 líneas donde queda desglosada la cuenta correspondiente al impuesto (en general IVA ventas o IVA compras). El asiento en formato rápido es cuando el usuario digita un código particular en la columna CODIGOIVA y la columna que le sigue, IVA, le devuelve el monto del mismo y lo vuelca en forma interna a la cuenta contable previamente mapeada a ese código. |
| 2 | Letras de Libro (`02-archivo-txt.md`) | C = compras, V = ventas, E = egresos, I = ingresos. Son los libros que el sistema tiene que tener presentes para los cálculos. También puede venir libro P, que también se debe tener en cuenta. |
| 3 | Valores de Tipo (`02-archivo-txt.md`) | Abreviatura puntual que se adjudica al asiento. Ej.: DIF = diferencia de cambio; 504 = compra exenta para el 2181. |
| 4 | "Cuenta fiscal real" (`04-asientos-excluidos.md`) | Pending — accountant asked for a clearer question. |
| 5 | Columna Total / IVA por criterio (`05-mapeo-1376.md`) | El archivo PADI del 1376 se genera según el mapeo (cuenta de IVA, ICOSA, IRAE, etc.). Toma el total de los asientos si son abiertos, o el valor del campo IVA si es formato rápido. No se desglosa por RUT como el 2181: se envían totales. Ej.: IVA con total 1000 → `110:1000`. |
| 6 | Movimiento sin mapear que no corresponde al 1376 (`05-mapeo-1376.md`) | Nunca. |
| 7 | Cotización día hábil anterior (`06-situaciones-especiales.md`) | Se toma la cotización vigente del BCU que tiene la aplicación. |
| 8 | Importes negativos en el archivo PADI (`06-situaciones-especiales.md`) | No se incluyen importes negativos en ningún caso. |

## Follow-up (2026-10-21)

- 1376 PADI separator is `;` (the `110:1000` example was a typo). The exporter already uses `;`.
- Cotización: the previous business day's BCU rate, as the app already does.
- Note 4 / note 6: the only source of truth for what goes to the 2181 or the 1376 is the company setup (Código IVA, cuenta contable, código PADI, mapeo 1376). Anything unmapped does not belong to that form. The 1376 review warning about unmapped accounts / IVA codes is now informational and no longer blocks the download.
- All notes propagated to `content/ayuda/`.
