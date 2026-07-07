# IVA — Reglas comunes

> Estado: **pendiente de confirmación por el usuario**. Lo que sigue es conocimiento general sobre el IVA en Uruguay `(especulativo / conocimiento general, no verificado contra fuente oficial actual)` — igual criterio que `.context/business/market-context.md`. No tratar como dato confirmado hasta que el usuario lo valide.

## Conocimiento general (a confirmar)

- Uruguay tiene, históricamente, más de una tasa de IVA: una **tasa básica** y una **tasa mínima**, además de operaciones **exentas**. Los valores exactos vigentes no están confirmados acá — no asumir un porcentaje sin verificarlo con el usuario o fuente oficial de DGI.
- El campo 7 del TXT de salida del 2181 (`.context/SRS/10-exporter.md`) representa, según lo confirmado por el usuario, "IVA o total de compra exenta" — es decir, la casilla determina si el importe es un monto de IVA discriminado o un total de compra exenta (sin IVA).

## Qué falta confirmar

- Tasas de IVA vigentes relevantes para el 2181 (básica, mínima, exenta) y sus porcentajes exactos.
- Qué determina, para una operación dada, con qué tasa se calculó (relevante para `../2181/formulas.md` y `../2181/mapping.md`).
- Si existen retenciones de IVA relevantes para este flujo.

No fabricar porcentajes ni normativa — pedir confirmación al usuario o fuente oficial DGI.
