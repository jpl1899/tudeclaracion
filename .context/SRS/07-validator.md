# 07 — Validator

> Estado: **parcial**. El formato de RUT está confirmado; el resto de las reglas de validación (mínimos DGI, importes) sigue pendiente. Posición en el pipeline confirmada en `ADR-0001`: corre **antes** del Tax Rules Engine (`08-tax-engine.md`) — valida estructura/datos normalizados, no reglas tributarias. Módulo genérico: no debe acoplarse a reglas específicas del 2181.

## Validaciones confirmadas

- **RUT** (declarante y tercero): 12 dígitos. *(Pendiente confirmar si además se valida el dígito verificador uruguayo, o solo longitud/formato numérico.)*

## Confirmado — manejo de errores (MVP)

- Ante un error de validación, el sistema **avisa al usuario** (no falla en silencio) y el mensaje **debe incluir una guía clara de cómo seguir** — no alcanza con reportar el error, coherente con el principio de facilidad de uso del producto (ver `business-model.md`).
- Remediación más sofisticada (ej. autocorrección sugerida, resolución guiada paso a paso) queda **fuera del MVP**, contemplada para el futuro.
- **Pendiente todavía**: si el error bloquea todo el archivo o excluye solo esa línea con reporte parcial — ver también abajo.

## Validaciones pendientes de confirmar

- Mínimos DGI (montos por debajo de los cuales una línea no se declara, si existen para el 2181).
- Rango/formato válido de importes (¿acepta cero? ¿negativos?).
- Validación de período (¿debe coincidir con el período de presentación vigente?).
- Validación de código PADI contra el catálogo real (ver `09-forms.md`, catálogo incompleto).
- Qué hace el sistema ante un registro inválido: ¿bloquea todo el archivo, o excluye solo esa línea con reporte de error? (el mensaje en sí ya está definido arriba — falta esta mecánica).
- Contenido exacto de la "guía clara de cómo seguir" por tipo de error — a definir junto con `user-journeys.md` del PRD.

No fabricar reglas de negocio — son decisiones tributarias que debe confirmar el usuario.
