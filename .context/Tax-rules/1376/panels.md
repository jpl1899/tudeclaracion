# Paneles y rubros — Formulario 1376

> Estado: **esqueleto confirmado** (paneles y rubros, de las páginas DGI). El detalle de líneas dentro de cada rubro está en imágenes en las páginas DGI — `[PLACEHOLDER]`. Fuentes: páginas DGI "Líneas a utilizar en el Formulario 1376 relativas a..." (IVA / créditos-anticipos IRAE / anticipos otros impuestos / pago con certificados de crédito).

## Estructura

| Panel | Rubro | Contenido | Notas |
|---|---|---|---|
| **Panel 1** | Rubro 2 — IVA Ventas e IVA Compras | Cuadro "Ventas e IVA Ventas" (ventas del mes + IVA ventas). Cuadro "Cálculo de IVA Compras Deducible" (IVA compras del mes). | Pide además **ventas y compras acumuladas del ejercicio** — dato que el TXT mensual NO trae. Fuente `[PLACEHOLDER]`. |
| **Panel 2** | Rubro 3 — Determinación de IVA | Saldo acreedor de IVA compras por diferencia de tasas; crédito por reducción de alícuota; contribuyentes con operaciones de exportación; contribuyentes que pasaron de No CEDE a CEDE; "otras líneas de interés". | |
| **Panel 3** | Rubro 4 — Créditos: Retenciones OTT y Otros Créditos | Créditos de IRAE por retenciones sufridas y otros. | |
| **Panel 3** | Rubro 5 — Anticipos de IRAE | Base de cálculo de ingresos y determinación del anticipo mensual de IRAE. Código de pago 108. | Reporte de respaldo: mayor de cuentas de ingresos brutos del período. |
| **Panel 4** | Rubro 6 — Anticipos de Otros Impuestos | IPAT (líneas 30/38), Sobretasa IPAT (líneas 55/56), ICOSA (líneas 52/53). Casilla "Mostrar líneas de anticipos de IP Agropecuario y Sobretasa" (Si/No). | Reportes de respaldo: balance de comprobación de saldos ajustado (IPAT), registro de accionistas / capital integrado (ICOSA). |
| **Pago con certificados de crédito** | — | Se completa cuando la línea 322 (saldo a pagar) tiene valor. Líneas 970 / 971 / 972: preguntas Si/No sobre pago con certificados de crédito aún no disponibles y su origen (proyectos de inversión / otros). | `[PLACEHOLDER]` — si el motor llega a determinar el saldo a pagar o solo entrega totales por código. |

## Casos especiales (alcance a confirmar)

- **Giro agropecuario**: líneas 33 (IRAE Agrop.), 36 (IPAT Agrop.), 54 (Sobretasa IPAT Agrop.) + "códigos especiales PADI para rural".
- **DJ sin movimiento**: si no hay ingresos ni anticipos a pagar en el mes, igual se presenta la 1376 con la opción "DJ sin movimiento".
- **IVA en Suspenso** (art. 32 Título 10 TO 2023, venta de chatarra/residuos de papel, vidrio y similares): se declara mensual, la recuperación va en la declaración del último mes del ejercicio fiscal.
- **Transporte terrestre de pasajeros**: presenta el formulario 1379 en lugar del 1376 — fuera de alcance por definición.

## Pendiente

- Número y descripción de cada línea dentro de cada rubro (en imágenes DGI).
- Qué líneas de cada panel alimenta el motor (agregación por cuenta) y cuáles requieren datos que el TXT no tiene (ej. acumulados del ejercicio, tipo de anticipo IPAT/ICOSA).
- Confirmar alcance MVP 2 de cada caso especial.
