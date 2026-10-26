# Formulario 2183 — line catalog

> Source: official PADI line table, Release 10 of 2026-10-08 — `https://descargas.dgi.gub.uy/media/wdgi/Descargas/Padi/Lineas_FormsPADI_R10_20261008.padi` (XML; the `<Declaracion>` payload is base64 + zlib), form version `218300`. 67 lines, none with PADI validation rules. **Not yet validated with the accountant** — which lines our users actually file is question 1 in `README.md`.
>
> The same table covers the 1144, 1146, 2142, 2181 (`218100`, 121 lines) and 2185. It does **not** cover the 1376 or the 1050.

`Visible = false` lines are hidden in PADI (repealed taxes / regimes) and are listed at the end for reference only.

## Rubro 2 — amounts without breakdown (visible)

| Line | Description |
|---|---|
| 10 | IVA |
| 11 | IVA — Banca de Cubierta Colectiva |
| 30 | Impuesto al Patrimonio |
| 31 | Impuesto al Patrimonio — Convenio de doble imposición |
| 51 | IVA — Frigoríficos y Mataderos |
| 52 | IVA — I.NA.VI. |
| 60 | IMESI |
| 80 | Impuesto Específico a las Apuestas — máquinas electrónicas o automáticas |

## Rubro 3 — withholdings (retenciones, visible)

| Line | Description |
|---|---|
| 110 | IVA — Prestación de servicios de salud (Art. 8 bis Dec. 220/98) |
| 111 | IVA — Consultoría con el Estado (Art. 7 Dec. 220/98) |
| 112 | IVA — Corredores de seguros (Res. 406/82) |
| 113 | IVA — Corredores de bolsa (Res. 10/83) |
| 114 | IVA — Empresas de seguridad, vigilancia y limpieza (Dec. 194/00 y 528/03) |
| 115 | IVA — Empresas transportistas profesionales de carga |
| 116 | IVA — Entidades aseguradoras (Dec. 336/03) |
| 117 | IVA — Transporte terrestre de pasajeros (Dec. 405/03) |
| 118 | IVA — Compras del Estado (Dec. 528/03 y 319/06) |
| 119 | IVA — Otras retenciones |
| 121 | IRAE — Empresas de seguridad, vigilancia y limpieza (Dec. 194/00) |
| 122 | IRAE — Empresas contratistas de obras públicas viales (Dec. 271/90) |
| 123 | IRAE — Otras retenciones |
| 124 | IRAE — Instituciones deportivas |
| 131 | Impuesto al Patrimonio — Convenio de doble imposición |
| 141 | Impuesto al Patrimonio |
| 160 | Obligaciones tributarias — Administradoras de crédito, Cont. Lit. E |
| 161 | Obligaciones tributarias — Administradoras de crédito, tasa 5 % |
| 162 | Obligaciones tributarias — Administradoras de crédito, tasa 2 % |
| 163 | Obligaciones tributarias — Administradoras de tarjetas (Ley 17.934) |
| 164 | Obligaciones tributarias de terceros — ANTEL |
| 165 | Obligaciones tributarias de terceros — Dec. 134/009 |
| 166 | Obligaciones tributarias — Administradoras de tarjetas (Dec. 288/012) |
| 167 | Obligaciones tributarias — Operaciones del Art. 1 Dec. 203/014 |
| 168 | Obligaciones tributarias — Operaciones del Art. 2 Dec. 203/014 |
| 169 | Obligaciones tributarias — Operaciones del Art. 3 Dec. 203/014 |
| 171 | OTT — Apps de transporte (Res. 1810/2017) |

## Rubro 3 — collections (percepciones, visible)

| Line | Description |
|---|---|
| 211 | IVA — Frigoríficos y mataderos, carne fresca (Art. 9 Dec. 220/98) |
| 212 | IVA — Frigoríficos y mataderos, faena (Art. 12 Dec. 220/98) |
| 213 | IVA — Grasas y lubricantes (Art. 14 Dec. 220/98) |
| 214 | IVA — Venta directa (Art. 16 Dec. 220/98) |
| 215 | IVA — Vehículos automotores (Art. 20 Dec. 220/98) |
| 216 | IVA — I.NA.VI. |
| 217 | IVA — Fabricantes e importadores de preformas PET y envases |
| 218 | IVA — Establecimientos de faena de aves (Dec. 621/06) |
| 219 | IVA — Gas oil |
| 220 | IVA — Otras percepciones |
| 221 | IVA — Fuegos artificiales (Res. 4.080/2013) |
| 228 | IRAE — Establecimientos de faena de aves (Dec. 621/006) |
| 229 | IRAE — Otras percepciones |

## Hidden in PADI (`Visible = false`)

Rubro 2: 21–25 (IRIC), 40–47 (Comisiones, compraventa de bienes muebles en remate, activos bancarios, sorteos, retribuciones al Estado, adicional y retribuciones personales, control del sistema financiero), 50 (IVA bancas, duplicate of 11), 70 (cesión de derechos sobre deportistas). Rubro 3: 151–153 (Impuesto a las Comisiones), 170 (COFIS).

## How this maps to the import file

The PADI import file for the 2183 (same layout as the 2181, form code `02183`) carries one record per informed RUT + invoice month + **line**. Rubro 3 is computed by PADI from that detail, so the app would export only Rubro 3 lines (1xx withholdings, 2xx collections). Rubro 2 lines are amounts without breakdown — whether our users need them is an open question.
