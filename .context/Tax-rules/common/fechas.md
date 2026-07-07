# Fechas — Reglas comunes

## Confirmado

- Formato de período: **AAAAMM** (ej. `201612` = diciembre 2016), confirmado en el TXT de salida (`.context/SRS/10-exporter.md`).
- En el registro de salida del 2181, los dos campos de período (declaración y tercero) son **siempre iguales** — confirmado por el usuario, no representan períodos distintos.

## Pendiente de confirmar

- Plazos de presentación de la DJ 2181 ante DGI (¿mensual, con qué vencimiento respecto al período declarado?).
- Si el sistema debe validar que el período declarado sea uno "presentable" (no futuro, no vencido más allá de cierto plazo).
- Manejo de correcciones/rectificativas de un período ya presentado — fuera de scope MVP salvo que el usuario indique lo contrario (ver `.context/business/business-model.md`).

No fabricar plazos ni normativa de vencimientos — confirmar con el usuario o fuente oficial DGI.
