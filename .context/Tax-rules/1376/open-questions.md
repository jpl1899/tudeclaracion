# Preguntas pendientes — Formulario 1376 (para el usuario / la contadora)

> Append-only. Cuando una se resuelve, se tacha (`~~texto~~`) con fecha y decisión, no se borra. Mismo criterio que `.context/open-questions.md` y `tax-rules/2181/preguntas-pendientes-contador.md`.

Sembrado 2026-08-27 (pasada incremental de `/project-foundation`, MVP 2 Track A).

## Catálogo de líneas

- [ ] Catálogo completo y real de códigos de línea del 1376 por panel/rubro (DGI lo publica en imágenes; no capturado). _(2026-09-01: TD-38 lo sembró provisoriamente como tabla configurable `codigo_linea_1376` con los 10 códigos del diseño — 101/102/103/201/301/302/501/502/510/601. Reemplazar el seed cuando llegue el catálogo real de DGI, sin tocar código.)_
- [ ] ¿Los códigos del ejemplo de diseño (101/201/301/302/501/502/510/601) son los números de línea reales que espera PADI, o son ilustrativos? _(2026-09-01: se usan como seed provisorio del combo en TD-38 hasta confirmar contra DGI.)_
- [ ] Descripción fiscal precisa de cada línea.
- [ ] Regla de selección de código "según tipo de contribuyente/sector": IRAE 108/126/128, IPAT 328/320/323, Sobretasa IPAT 335/330/333. ¿Qué la determina?

## Motor / fórmulas

- [x] ~~Cómo se computa el saldo de una cuenta contable desde el formato del TXT del 2181 (Debe/Haber = códigos de cuenta, importes en Total/IVA). ¿Qué columna de importe imputa a cada lado? ¿Depende del código de línea destino?~~ **Resuelto 2026-09-01 (con la contadora)**: la columna de importe (`Total` | `IVA`) la define el contador **por fila** en la matriz de mapeo del 1376 (TD-38) — `Total` para asientos abiertos, `IVA` para el "formato rápido" de Memory Conty. El motor toma, por cada cuenta mapeada, el importe de su columna configurada.
- [x] ~~Qué columna de importe (`Total` vs `IVA`) alimenta cada tipo de línea (base imponible vs IVA).~~ **Resuelto 2026-09-01**: no depende del tipo de línea sino del formato del asiento, y queda configurado por fila en el mapeo (ver arriba).
- [x] ~~Conversión de moneda para `Moneda = 1`: ¿mismo mecanismo de cotización que el 2181?~~ **Resuelto 2026-09-01**: sí, misma conversión por cotización que el 2181.
- [x] ~~Tratamiento de movimientos negativos (devoluciones, notas de crédito) en la agregación.~~ **Resuelto 2026-09-01**: entran como importes en negativo y se suman en forma simple con los positivos.
- [x] ~~Redondeo: ¿mismo criterio que el 2181 o distinto? (el ejemplo real muestra enteros).~~ **Resuelto 2026-09-01**: mismo criterio que el 2181 (mitad hacia abajo).
- [ ] ¿El motor determina la liquidación (saldo a pagar, líneas 322/970/971/972, boleto 2908) o solo entrega totales por código de línea? _(2026-09-01: diferido — "lo vemos en la marcha"; TD-41 queda por ahora en totales por código, consistente con ADR-0006)._

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
