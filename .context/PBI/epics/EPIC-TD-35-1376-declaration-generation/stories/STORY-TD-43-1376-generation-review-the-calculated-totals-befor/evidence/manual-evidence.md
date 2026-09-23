# TD-43 — Manual evidence (live UI)

Captured 2026-09-23 with Playwright CLI against the local dev server (`bun run dev`), logged in with the `.env` local user. Active empresa set via the `empresa_activa_id` cookie.

## clean-result

CAMBIO FENIX, period 202509 (its plan de cuentas has no 1376-relevant accounts, so nothing can be unmapped).

- Badge "Pendiente de generar", no `revision_1376_cuentas_sin_mapear` block, download button enabled.
- No empresa has a `mapeo_1376` saved yet, so the totals table rendered its empty message ("Ningún código de línea recibió movimiento en este período") instead of rows. The per-code amounts come from `calcularTotalesLinea1376` (TD-41), covered by `src/modules/generacion-1376/calcular-totales-1376.test.ts`.
- Screenshot: `td43-sin-advertencia-fenix-202509.png`

## unmapped-accounts

Recoba, period 202603 (and 202604 on re-check after the review fixes).

- Warning lists "Cuenta 21332 (código PADI 502 en el plan de cuentas)".
- `revision_1376_descargar` `disabled` = `true` before acknowledging → `false` after clicking `revision_1376_reconocer_advertencia`.
- Screenshot (after acknowledging): `td43-advertencia-reconocida-recoba-202603.png`

## no-data

Recoba, period 209912 (no `declaracion` for that period). Rendered `main` text:

```
Declaración 1376 — 209912
Todavía no hay datos para este período
El 1376 se calcula a partir del TXT mensual de asientos. Importá el TXT de este período desde el inicio y volvé a esta pantalla para revisar los totales.
Ir a importar el TXT
```

## aggregation-stated

`revision_1376_agregacion` ("Estos totales están agregados por cuenta contable, sin apertura por RUT (a diferencia del 2181).") present on every result render: FENIX 202509, Recoba 202603, Recoba 202604. Visible in both screenshots.

## entry-point

The dashboard for CAMBIO FENIX rendered "Ver 1376" links: `/dashboard/declaraciones-1376/202609`, `/202604`, `/202509`.

## console

0 console errors across the session.
