# 07 — Validator

> Estado: **reglas núcleo confirmadas 2026-07-17** (ver `Tax-rules/2181/preguntas-pendientes-contador.md`). Posición en el pipeline confirmada en `ADR-0001`: corre **antes** del Tax Rules Engine (`08-tax-engine.md`) — valida estructura/datos normalizados, no reglas tributarias. Módulo genérico: no debe acoplarse a reglas específicas del 2181. Quedan 2 puntos con seguimiento abierto — ver abajo.

## Validaciones confirmadas

- **RUT** (declarante y tercero): 12 dígitos. **Confirmado 2026-07-17**: no se valida el dígito verificador uruguayo, solo formato/longitud numérica.
- **Mínimos DGI**: **confirmado 2026-07-17 — no existe** un importe mínimo por debajo del cual una línea no se declara en el 2181.
- **Importe cero**: **confirmado 2026-07-17 — no es válido.** Una línea con importe 0 no se declara (mecánica de bloqueo-vs-exclusión, ver abajo).
- **Importe negativo**: **corregido 2026-07-27** (la respuesta original del 2026-07-17, "jamás es válido", quedó superada). Un importe negativo representa una nota de crédito/devolución: resuelve normal contra el plan de cuentas y se **netea** (suma simple) contra el asiento positivo del mismo RUT+código PADI en `08-tax-engine.md` (agrupación). Si el neto final da 0 o negativo, esa línea **no se declara** — mismo tratamiento que importe cero, confirmado con el contador para ambos casos (2026-07-27).
- **Validación de período**: **confirmado 2026-07-17 (parcial)** — en general, el período del asiento debe coincidir con el período de la declaración. ⚠️ **Seguimiento abierto**: el contador señaló una excepción para clientes "rurales" que todavía no está definida (qué régimen/actividad califica como rural, y por qué el período no coincide en ese caso) — no fabricar la excepción, retomar en la próxima sesión.
- **Casillas condicionadas**: **confirmado 2026-07-17 — no existen.** Ninguna casilla del 2181 aplica solo bajo condiciones del contribuyente o del tercero.
- **Consistencia cruzada**: **confirmado 2026-07-17 — no se valida** que la suma de las líneas coincida con otro total declarado (ej. libro de compras/IVA).

## Confirmado — manejo de errores (MVP)

- Ante un error de validación, el sistema **avisa al usuario** (no falla en silencio) y el mensaje **debe incluir una guía clara de cómo seguir** — no alcanza con reportar el error, coherente con el principio de facilidad de uso del producto (ver `business-model.md`).
- Remediación más sofisticada (ej. autocorrección sugerida, resolución guiada paso a paso) queda **fuera del MVP**, contemplada para el futuro.
- **Mecánica de bloqueo — respuesta tentativa 2026-07-17, NO confirmada con certeza**: ante un asiento sin regla de mapeo conocida (código IVA o cuenta contable no configurados), el contador respondió que el sistema **no** debería bloquear todo el archivo — solo excluir esa línea con reporte de error — pero indicó explícitamente que tiene dudas sobre esta respuesta. **No tratar como regla definitiva** hasta retomarla en una próxima sesión (distinto del caso ya confirmado del Parser — dato inválido de formato SÍ aborta el archivo completo, ver `05-parser.md`; esto es específicamente sobre asientos válidos en formato pero sin mapeo tributario).

## Pendiente

- Validación de código PADI contra el catálogo real (ver `09-forms.md`, catálogo completo para el 2181 desde 2026-07-14) — mecánica de validación en sí todavía no implementada.
- Contenido exacto de la "guía clara de cómo seguir" por tipo de error — a definir junto con `user-journeys.md` del PRD.
- Excepción de período para clientes rurales (ver arriba).
- Confirmación definitiva de la mecánica de bloqueo-vs-exclusión ante mapeo faltante (ver arriba).

No fabricar reglas de negocio — son decisiones tributarias que debe confirmar el usuario.
