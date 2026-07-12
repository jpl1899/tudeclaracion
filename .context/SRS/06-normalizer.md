# 06 — Normalizer

> Estado: **carga self-service confirmada** (2026-07-12); mecanismo exacto de mapeo campo→"Nombre de Impuesto" todavía pendiente (ver `05-parser.md`, campos ya confirmados).

## Responsabilidad

Mapea cuenta contable (del TXT de Memory) → concepto fiscal, usando una configuración de **plan de cuentas por empresa** (confirmado como configurable en `business-model.md` — no es un mapeo global fijo).

## Confirmado

- **Revertido 2026-07-12**: la carga del plan de cuentas **SÍ es self-service** en el MVP — el propio contador la completa como parte del flujo de alta de una empresa nueva (US 1.3 / TD-8, ver `mvp-scope.md` EPIC-TD-02). Decisión anterior (carga fuera de alcance de autoconfiguración) queda revertida; no hay UI separada de "autoconfiguración" post-alta — se carga una vez, al momento de crear la empresa, dentro del mismo flujo de "Agregar nueva empresa".
- El dato sigue siendo configurable por empresa a nivel de modelo (ver `ADR-0001`) — no es un mapeo global fijo.

## Confirmado (parcial)

- Estructura del plan de cuentas configurable: tabla **plana** (no jerárquica), dos columnas — **Nombre de Impuesto** | **Número de Cuenta** — editable, la define el cliente (empresa), no el sistema.

## Qué falta confirmar

- Con qué campo(s) del TXT de entrada (ver `05-parser.md`) se determina el "Nombre de Impuesto" antes de buscarlo en esta tabla — **pendiente, lo investiga el contador**.
- Qué pasa si una cuenta no tiene mapeo definido (¿error, línea ignorada, cola de revisión manual? — ver también `07-validator.md` sobre mensajes de error con guía clara).

No fabricar el resto de esta spec — depende de decisiones de producto (PRD) y de la investigación pendiente del contador.
