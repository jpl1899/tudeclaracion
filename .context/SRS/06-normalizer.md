# 06 — Normalizer

> Estado: **pendiente**. Depende de `05-parser.md` (formato de entrada no confirmado aún).

## Responsabilidad

Mapea cuenta contable (del TXT de Memory) → concepto fiscal, usando una configuración de **plan de cuentas por empresa** (confirmado como configurable en `business-model.md` — no es un mapeo global fijo).

## Confirmado

- La **UI de autoconfiguración del plan de cuentas** (que el propio contador cargue/edite el mapeo desde la app) queda **fuera del alcance del MVP**. Se contempla para el futuro — el dato debe seguir siendo configurable por empresa a nivel de modelo (ver `ADR-0001`), aunque en el MVP la carga inicial pueda resolverse de forma manual/asistida (mecanismo exacto aún sin definir).

## Qué falta confirmar

- Cómo se carga el plan de cuentas de una empresa en el MVP, si no hay UI de autoconfiguración (¿carga manual del equipo, import de un archivo, planilla?).
- Estructura del plan de cuentas configurable (¿tabla cuenta → concepto fiscal? ¿jerárquico?).
- Qué pasa si una cuenta no tiene mapeo definido (¿error, línea ignorada, cola de revisión manual? — ver también `07-validator.md` sobre mensajes de error con guía clara).

No fabricar esta spec — depende de decisiones de producto (PRD) y del formato de entrada aún no definido.
