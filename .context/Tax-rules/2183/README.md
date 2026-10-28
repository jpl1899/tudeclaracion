# Formulario 2183 — research notes

> Status: **research only, not validated with the accountant**. Sources: DGI public pages (fetched 2026-10-26). Do not implement until the questions at the end are answered.

## What it is

- Sworn declaration of **withholdings and collections of other taxes** (retenciones y percepciones de otros impuestos), payment code **549**.
- Filed by withholding / collecting agents. Listed by DGI among the declarations for CEDE and Grandes Contribuyentes.
- Prepared in **PADI**, filed through Servicios en línea ("Envío de declaraciones"). Paid separately from the 1376, with code 549 (boleto 2908 or credit certificates with 2903).
- Source: <https://www.gub.uy/direccion-general-impositiva/comunicacion/publicaciones/cede-grandes-contribuyentes-declaraciones-presentar>

## Structure (from the PADI instructions)

- Same entry logic as the **2181**: Rubro 2 = amounts without breakdown (definitive withholdings / collections, by line); **Rubro 5** = detail grouped by taxpayer identification, line number and amount (RUC or CI).
- **Rubros 3 and 4 are computed automatically from Rubro 5** (the 2181 only computes Rubro 3).
- Duplicate error: "Ya existe igual RUT/Período/Línea para esta declaración".
- Source: <https://www.gub.uy/direccion-general-impositiva/comunicacion/publicaciones/instructivo-para-confeccion-presentacion-declaraciones-aplicacion-beta>

## Import file (Rubro 5) — same layout as the 2181

`;`-separated, fixed widths, one record per line:

| Pos. | Field | Notes |
|---|---|---|
| 1-12 | RUT informante | Zero-padded on the left |
| 14-18 | Formulario | `02183` (the 2181 uses `02181`) |
| 20-25 | Período AAAAMM | Must match the header |
| 27-38 | RUT informado | RUC, CI or NIE |
| 40-45 | Factura AAAAMM | ≤ declared period |
| 47-49 | Línea | Must exist in the form's line table |
| 51-62 | Importe | Integer, may be negative (e.g. `-2750`) |

Each field is followed by `;`. Decimals are rounded by PADI. Unlike the 2181, the instructions only document summing repeated RUT/período/línea **for the 2181** — for the 2183 a repeat is a duplicate error, so the app must consolidate before exporting.

**Reuse potential**: the 2181 exporter (`src/modules/exporter/generate-padi-file.ts`) already writes this layout; the 2183 would mostly change the form code and the line catalog.

## Questions for the accountant

1. Line table of the 2183 Rubro 5: which line numbers exist and what each one means (e.g. which tax / withholding regime).
2. How a TXT asiento maps to a 2183 line: by account, by Código IVA, by Tipo? A new plan-de-cuentas column per company, like the 2181 `codigo_padi`?
3. Periodicity (monthly?) and whether it is filed together with the 1376 / 2181 for the same period.
4. Does Rubro 2 (amounts without breakdown) apply to our users, or only Rubro 5?
5. A real example: TXT + the 2183 file already accepted by PADI.
