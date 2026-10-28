# Casillas — Formulario 2181

> Mismo catálogo numérico que `.context/SRS/09-forms.md` — mantener ambos sincronizados si se agregan/corrigen códigos. Acá se documenta el **significado fiscal** de cada casilla; en SRS se documenta solo como dato técnico del Exporter.

## Catálogo conocido

| Casilla (código PADI) | Concepto fiscal | Fórmula | Estado |
|---|---|---|---|
| 502 | IVA Ventas Tasa Básica a Contribuyentes | ver `formulas.md` | Descripción oficial DGI (2026-10-26) |
| 503 | IVA Ventas Tasa Mínima a Contribuyentes | ver `formulas.md` | Descripción oficial DGI (2026-10-26) |
| 504 | Compras Plaza Exentas de IVA | ver `formulas.md` | Descripción oficial DGI (2026-10-26) |
| 505 | IVA Compras Plaza Tasa Básica | Suma del IVA de los asientos del mismo RUT cuyo Libro/Código IVA correspondan a compra tasa básica | Confirmado (parcial) — 2026-07-13; descripción oficial DGI |
| 506 | IVA Compras Plaza Tasa Mínima | ver `formulas.md` | Descripción oficial DGI (2026-10-26) |
| 552 | IVA Ventas Tasa Básica a Contribuyentes — Venta por Cuenta Ajena | ver `formulas.md` | Descripción oficial DGI (2026-10-26) |
| 553 | IVA Ventas Tasa Mínima a Contribuyentes — Venta por Cuenta Ajena | ver `formulas.md` | Descripción oficial DGI (2026-10-26) |

**Fuente de las descripciones (2026-10-26)**: tabla oficial de líneas de PADI, Release 10 del 2026-10-08 (`https://descargas.dgi.gub.uy/media/wdgi/Descargas/Padi/Lineas_FormsPADI_R10_20261008.padi`, XML con el contenido en base64 + zlib), formulario `218100` (121 líneas en total). Los 7 códigos que usa la app existen en esa tabla, todos en el Rubro 3.

**Lista incompleta** — el usuario dejó constancia explícita de que faltan casillas por confirmar. No fabricar códigos ni descripciones faltantes.

## Pendiente

- Descripción/concepto fiscal de cada casilla.
- Casillas faltantes del catálogo completo del 2181.
- Si existen casillas mutuamente excluyentes o dependientes entre sí.
