# 06 — Normalizer

> Estado: **carga self-service confirmada** (2026-07-12); mecanismo de mapeo campo→"Nombre de Impuesto" confirmado (2026-07-14, ver `05-parser.md` y `08-tax-engine.md`).

## Responsabilidad

Mapea cuenta contable (del TXT de Memory) → concepto fiscal, usando una configuración de **plan de cuentas por empresa** (confirmado como configurable en `business-model.md` — no es un mapeo global fijo).

## Confirmado

- **Revertido 2026-07-12**: la carga del plan de cuentas **SÍ es self-service** en el MVP — el propio contador la completa como parte del flujo de alta de una empresa nueva (US 1.3 / TD-8, ver `mvp-scope.md` EPIC-TD-02). Decisión anterior (carga fuera de alcance de autoconfiguración) queda revertida; no hay UI separada de "autoconfiguración" post-alta — se carga una vez, al momento de crear la empresa, dentro del mismo flujo de "Agregar nueva empresa".
- El dato sigue siendo configurable por empresa a nivel de modelo (ver `ADR-0001`) — no es un mapeo global fijo.

## Confirmado

- **Estructura final del plan de cuentas (implementada 2026-07-15, TD-7/TD-24 rework)**: dos tablas libres, sin catálogo fijo, editables por el cliente en `/empresas/nueva`:
  1. **Códigos de formato rápido de IVA**: filas de Cuenta contable | Código PADI (502/503/505/506) | Código IVA (0-9, dígito del "formato rápido", Camino 1 de `08-tax-engine.md`).
  2. **Compras Exentas**: filas de solo Cuenta contable — código PADI 504 implícito, sin Código IVA (matchea por Camino 2).
  - Se descartó el intermedio "Nombre de Impuesto" como dato guardado — el usuario elige el Código PADI directamente por fila; el texto descriptivo (ej. "IVA compras tasa básica") vive solo como label en el selector, no se persiste.
  - Schema real: `plan_cuentas(empresa_id, cuenta_contable, codigo_padi, codigo_iva nullable)`, `unique(empresa_id, cuenta_contable)`, `unique(empresa_id, codigo_iva)` — el unique de `codigo_iva` permite múltiples `null` (Compras Exentas no usa este campo). Reemplaza al catálogo fijo `codigo_iva` (5 filas) y al viejo `plan_cuentas` 1:1 por empresa.
- **Campo que determina el código PADI en el Camino 1** (2026-07-14): el campo `Código IVA` del TXT de entrada (ver `05-parser.md`) es la clave que se busca en la tabla de arriba, ya cargada por el usuario al alta de la empresa. Detalle completo de la cadena de resolución en `08-tax-engine.md`.

## Confirmado (cont.)

- **Cuenta sin mapeo** (2026-07-14): el sistema la **ignora** — no bloquea el archivo ni genera cola de revisión manual. Siempre prioriza lo definido en la configuración del usuario.
- **Compras exentas admite múltiples cuentas** (2026-07-14, caso especial — el resto de las categorías es 1 cuenta = 1 Nombre de Impuesto): distintos bienes exentos (ej. gasoil, leche, carne, frutas, verduras) son cuentas contables separadas en el plan de cuentas de la empresa, pero todas resuelven al mismo "Nombre de Impuesto" = Compras exentas → mismo código PADI 504 (hardcodeado, ver `08-tax-engine.md`).
- **Segunda vía de resolución por cuenta contable, más allá de Compras exentas** (confirmado 2026-07-15, ver ejemplo real en `05-parser.md`): cuando el TXT trae un asiento en formato "abierto" (`Código IVA = 0`), el Normalizer no asume automáticamente Compras exentas — busca la cuenta contable del asiento en el plan de cuentas de la empresa, probando primero Debe y después Haber (**revertido 2026-07-21**: ya no depende de si Libro es de compra o venta, ver `05-parser.md` / `08-tax-engine.md`). Esa cuenta puede resolver a **cualquier** Nombre de Impuesto (Compras exentas, IVA compras tasa básica, IVA ventas tasa mínima, etc.), no solo a Compras exentas. Detalle de los dos caminos combinados (Código IVA vs. cuenta contable) en `08-tax-engine.md`.

- **Alcance del Normalizer (TD-15, confirmado 2026-07-16)**: resuelve **directo a código PADI** — no hay "Nombre de Impuesto" intermedio que devolver, porque `plan_cuentas` (TD-7) ya lo persiste así. Por línea de asiento, el Normalizer devuelve `{ codigoPadi, importe, rut }` o "sin mapeo"/"fuera de alcance" — nunca agrupa. La consolidación por RUT+código (ver `08-tax-engine.md`) es responsabilidad de una historia posterior (armado/export de la declaración), no de TD-15. Consecuencia de negocio: TD-22 (Tax Line Mapping) y buena parte de TD-23 (Amount Calculation) quedan probablemente redundantes con esta resolución — pendiente de revisión de alcance en Jira, no resuelto todavía.

No fabricar el resto de esta spec — depende de decisiones de producto (PRD) y de la investigación pendiente del contador.
