# Validations — Formulario 2181

> Estado: **pendiente**. Distinto de `.context/SRS/07-validator.md` (validaciones técnicas/estructurales: formato de RUT, formato de importe). Este archivo documenta las reglas de validación **tributarias** — las que dependen de la normativa DGI, no del formato del archivo.

## Qué falta confirmar

- Mínimos DGI: ¿existe un importe mínimo por debajo del cual una línea no se declara para el 2181?
- Condiciones de aplicación por casilla: ¿hay casillas que solo aplican bajo ciertas condiciones del contribuyente o del tercero (ej. tipo de contribuyente, régimen de IVA)?
- Consistencia cruzada: ¿debe validarse que la suma de las líneas coincida con algún total declarado en otro lado (ej. libro de compras/IVA)?
- Qué pasa ante una casilla sin regla de mapeo conocida (ver `mapping.md`) — ¿se rechaza el registro, se marca para revisión manual?

No fabricar reglas de negocio — son decisiones tributarias que debe confirmar el usuario.
