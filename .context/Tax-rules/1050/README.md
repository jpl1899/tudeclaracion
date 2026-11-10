# Formulario 1050 — research notes

> Status: **research only, not validated with the accountant**. Sources: DGI public pages (fetched 2026-10-26). Do not implement until the questions at the end are answered.

## What it is

- **Annual** sworn declaration of **IRAE, IPAT (Impuesto al Patrimonio) and ICOSA**, with their balances due: IRAE code 103, IPAT 322, IPAT surcharge 334, ICOSA 607.
- Prepared in **PADI** (since periods from 10/2020 it replaces the Sigma forms), together with the "Instructivo de Detalle de Inmuebles". Filed through Servicios en línea, Abitab or Red Pagos.
- Charge month = fiscal year closing month. Can also be filed as a **provisional** declaration (e.g. to reduce advances).
- Sources: <https://www.gub.uy/direccion-general-impositiva/comunicacion/publicaciones/cede-grandes-contribuyentes-declaraciones-presentar>, <https://www.gub.uy/direccion-general-impositiva/comunicacion/publicaciones/errores-frecuentes-confeccion-presentacion-pago-del-formulario-1050>

## Known lines (advances and cross-checks)

| Line | Meaning | Must match |
|---|---|---|
| 901 | IRAE mínimo — sum of minimum advances of the year | — |
| 903 | IRAE advances of the period (includes 901) | CEDE: line 79 of the monthly 1376 forms of the period. NO CEDE: line 34 of the 2178 |
| 904 | Retentions / perceptions not deducted in 2176/2178/1376 | — |
| 905 | IMEBA payments not deducted | Lines 30 + 40 of the 2142 forms of the last 11 months |
| 906 | IMEBA retentions not deducted | Lines 110–129 + 210–229 of the 2142 forms |
| 340 | ICOSA of the year | — |
| 343 | ICOSA advances | Line 52 of the 1376 / 2178 |
| 344 | ICOSA balance (auto) | — |
| 308 | IPAT advances | Line 38 of the 1376 / 2178 |
| 306 | IPAT settled in another closing (two closings in one calendar year) | Previous 1050 |
| 365 | IPAT surcharge advances | Line 56 of the 1376 / 2178 |
| 322 | Balance due | Lines 970/971/972 if paid with credit certificates |

Source: <https://www.gub.uy/direccion-general-impositiva/comunicacion/publicaciones/lineas-utilizar-formulario-1050-para-declaracion-anticipos-impuestos>

## Why this one is different

- It is **annual** and a full tax **liquidation** (income tax, net worth, ICOSA), not a monthly listing of movements like the 2181 or a total per code like the 1376.
- Several lines must equal the **sum of the 12 monthly 1376** of the fiscal year — the app would need the year's 1376 history per company.
- The net-worth tax (IPAT) needs balance-sheet data (assets, liabilities, property detail) that a monthly asientos TXT does not obviously carry.
- Fiscal years do not always match the calendar year (and "rural" companies may have 12- or 4-month periods — see `../contador-respuestas-2026-10-26.md`).

## Questions for the accountant

1. Scope for this version: the whole 1050, or only some lines (e.g. the advances block 901–906, 308, 343, 365, built from the 1376 history)?
2. Data source: an annual TXT (all asientos of the fiscal year)? The 12 monthly TXT already uploaded? A balance sheet?
3. Output: is there a PADI import file for the 1050 (`linea;importe` like the 1376?), or is it typed in by hand?
4. How the fiscal year closing month is known per company (new company setting?).
5. A real example: the source data + a 1050 already accepted by PADI.
