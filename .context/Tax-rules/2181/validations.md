# Validations — Formulario 2181

> Estado: **confirmado 2026-07-17** (ver `preguntas-pendientes-contador.md`). Distinto de `.context/SRS/07-validator.md` (validaciones técnicas/estructurales: formato de RUT, formato de importe) — ese archivo ahora también incorpora estas mismas respuestas del lado técnico. Este archivo documenta las reglas de validación **tributarias**.

## Confirmado

- **Mínimos DGI**: no existe un importe mínimo por debajo del cual una línea no se declara para el 2181.
- **Condiciones de aplicación por casilla**: no hay casillas que apliquen solo bajo ciertas condiciones del contribuyente o del tercero.
- **Consistencia cruzada**: no se valida que la suma de las líneas coincida con algún total declarado en otro lado (ej. libro de compras/IVA).
- **Casilla sin regla de mapeo conocida**: respuesta tentativa, sin certeza confirmada por el contador — se excluye solo esa línea (no se rechaza todo el archivo). Ver `SRS/07-validator.md` §"manejo de errores" para el detalle de por qué esto queda marcado como no-definitivo.

## Seguimiento abierto (no fabricar hasta la próxima sesión)

- Excepción de validación de período para clientes "rurales" — qué la define y cómo se aplica (ver `SRS/07-validator.md`).
