# ADR-0006 — La DJ 1376 corre un modo de agregación por cuenta contable, distinto del pipeline por-RUT del 2181

- **Status:** Accepted <!-- Proposed | Accepted | Superseded by ADR-MMMM | Deprecated -->
- **Date:** 2026-08-27
- **Deciders:** Juan Leites
- **Tags:** tax-engine, data-model, cross-cutting-invariant, forms, mvp-2
- **Supersedes:** —
- **Superseded by:** —

---

## Context

MVP 2 Track A agrega la **Declaración Jurada 1376** (DJ mensual de IVA + anticipos de IRAE, IPAT, ICOSA e IRPF por retiro de utilidades, para contribuyentes CEDE y Grandes Contribuyentes). Es el primer formulario más allá del 2181 que el producto construye. `ADR-0001` diseñó la plataforma como modular y reusable para exactamente esto, y `future-roadmap.md` asumía que "agregar un formulario nuevo implica sumar un módulo `forms/<nuevo>` y reglas en `tax-rules/<nuevo>/`, sin rediseñar Parser/Normalizer/Validator/Exporter".

El material que aportó el usuario (2 páginas DGI, `DJ 1376.xlsx` con el marco teórico y el diseño del motor, y un archivo PADI de ejemplo real) muestra que el 1376 **no encaja** en el pipeline del 2181 tal como está:

- El 2181 es **informativo** y su unidad es el **RUT**: cada línea declarada lleva RUT + total de IVA / compra exenta, resuelta línea por línea (`plan_cuentas`, Camino 1 / Camino 2 de `SRS/08-tax-engine.md`) y consolidada por `RUT + código PADI` (`tax-rules/2181/mapping.md`, `consolidate-lines.ts`).
- El 1376 es una **liquidación** y su unidad es la **cuenta contable**: no hay apertura de RUT. El contador configura un *matching* (qué cuenta es IVA compras, cuál IRAE, cuál IVA ventas, con Debe/Haber), el motor **agrega el saldo de cada cuenta** y lo totaliza por **código de línea del formulario**. La salida es un archivo `codigo;monto`, solo totales (ejemplo real confirmado).
- Lo único que el usuario confirmó explícitamente compartido es el **formato del TXT de entrada**: el mismo que la 2181, del software contable Memory.

Sin una decisión explícita, el riesgo es que una historia de `/sprint-development` intente forzar el 1376 dentro de `plan_cuentas` + la consolidación por RUT (violando el modelo del 1376), o que duplique el Parser (rompiendo la reutilización que `ADR-0001` buscaba).

## Decision

**El 1376 se implementa como un modo de procesamiento propio dentro del pipeline modular, que reusa el Parser y diverge después de él.**

Concretamente:

1. **Se reusa, sin cambios de contrato:** el **Parser** (`SRS/05-parser.md`) — la entrada del 1376 es el mismo TXT mensual de Memory que la 2181. La configuración de layout de columnas (`ADR-0005`) aplica igual.
2. **Se reusa, a confirmar caso por caso:** las reglas transversales de `tax-rules/common/` (IVA, fechas, y sobre todo la conversión de moneda por cotización BCU de `SRS/08-tax-engine.md`).
3. **NO se reusa:** la resolución por línea vía `plan_cuentas` (Camino 1 / Camino 2), la regla de consolidación por `RUT + código PADI`, ni el formato de salida de `SRS/10-exporter.md`.
4. **Es nuevo:**
   - Un **motor de agregación por cuenta** (`SRS/13-forms-1376.md`): saldo por cuenta contable del período → matching cuenta → código de línea → total por código, sin RUT.
   - Una **tabla de matriz de mapeo del 1376** por empresa, separada de `plan_cuentas`: `(empresa_id, cuenta_contable, tipo Debe|Haber, codigo_linea_1376)`. El schema físico lo fija `/project-bootstrap` / `/sprint-development`; lo que este ADR fija es que es **una tabla distinta**, no una extensión de `plan_cuentas`.
   - Un **formato de salida propio**: texto plano `codigo;monto`, un renglón por código de línea, monto entero, sin encabezado, **sin RUT ni período**.
   - Reglas de dominio del 1376 en `.context/tax-rules/1376/` (paralelo a `tax-rules/2181/`).

**Invariante que toda historia del 1376 debe respetar:** el procesamiento del 1376 es por **cuenta contable agregada**, no por tercero/RUT. Ninguna historia debe introducir apertura de RUT en el 1376 ni reutilizar `plan_cuentas` / `consolidate-lines.ts` para él.

La entidad `declaracion` de `ADR-0003` (`empresa_id`, `periodo`, `estado`) sí se reutiliza como raíz de agregación — una `declaracion` de un período puede tener asociada la 2181, la 1376, o ambas (la 2181 es anexo de la 1376). El detalle de cómo se vincula el par 2181+1376 en el modelo de datos es trabajo de `/sprint-development`, no de este ADR.

## Consequences

- **Positive:**
  - El modelo del 1376 (agregación por cuenta, sin RUT) queda protegido de intentos de encajarlo en el pipeline del 2181.
  - Se preserva la reutilización real que buscaba `ADR-0001`: el Parser (la parte más trabajada y validada contra archivos reales) se comparte tal cual.
  - Deja explícito, para `/product-management` y `/sprint-development`, qué es nuevo (motor de agregación, tabla de mapeo, exporter) y qué no.
- **Negative / trade-offs:**
  - `future-roadmap.md` sobre-simplificaba: "un formulario nuevo no toca el pipeline" no se cumple para formularios de tipo liquidación. El pipeline gana un segundo modo de procesamiento, con su propio motor, tabla y exporter — más superficie que "sumar `forms/1376/`".
  - Dos configuraciones de mapeo por empresa (la del 2181 y la del 1376) que el contador mantiene por separado. Es intrínseco a que los formularios declaran cosas distintas, pero es carga de configuración adicional.
- **Neutral / follow-ups:**
  - `SRS/13-forms-1376.md` y `tax-rules/1376/` quedan sembrados con estructura + `[PLACEHOLDER]`; el contenido tributario (catálogo de líneas real, fórmulas de agregación, columna de importe por tipo de línea) depende de que la contadora aporte ejemplos reales procesados en PADI.
  - Abierto: si el motor del 1376 **determina la liquidación** (saldo a pagar) o se limita a totales por código. El ejemplo real es solo totales; este ADR no lo resuelve.
  - Abierto: la fuente del dato "ventas/compras acumuladas del ejercicio" que pide el Panel 1 y que el TXT mensual no trae.
  - Cuando llegue un tercer formulario, revisar si "modo por-RUT" vs "modo por-cuenta" se generaliza a una abstracción explícita de tipos de formulario, o si cada uno sigue siendo su propio modo.

## Alternatives considered

- **Forzar el 1376 dentro de `plan_cuentas` + consolidación por RUT del 2181.** Rechazado: el 1376 no tiene apertura de RUT, y su matching es cuenta+Debe/Haber → código de línea, no cuenta → código PADI. Encajarlo obligaría a inventar RUTs ficticios o a mutilar el modelo del 1376. Contradice lo que el usuario dejó escrito en `DJ 1376.xlsx` ("es información sin apertura de RUT... el contador indicará cuál es la cuenta de iva, la de irae etc y el sistema tiene que totalizar").
- **Un pipeline separado de punta a punta para el 1376, incluido su propio parser.** Rechazado: duplicaría el Parser, que es la parte más validada del sistema (contra múltiples archivos reales, `ADR-0005`) y que el usuario confirmó idéntico para el 1376. Rompería la reutilización que `ADR-0001` justifica.
- **Extender `plan_cuentas` con columnas para el 1376** (`codigo_linea_1376`, `tipo`) en vez de una tabla nueva. Rechazado: acopla dos configuraciones con semántica y ciclo de vida distintos; una empresa que solo presenta 2181 tendría columnas 1376 vacías y viceversa; y el `unique(empresa_id, cuenta_contable)` del `plan_cuentas` no necesariamente aplica al mapeo del 1376 (una cuenta podría alimentar base imponible + IVA). Tabla separada es más limpio.
- **Esperar a tener el catálogo de líneas real antes de decidir la arquitectura.** Rechazado: la forma del procesamiento (agregación por cuenta, sin RUT, salida `codigo;monto`) ya está confirmada por el usuario y el archivo de ejemplo; no depende del catálogo. Bloquear la decisión arquitectónica en un dato de dominio detallado retrasaría `/product-management` sin reducir el riesgo.

## References

- `.context/SRS/13-forms-1376.md` — módulo del 1376 (sembrado esta pasada)
- `.context/SRS/08-tax-engine.md` §"Modo 1376 — agregación por cuenta"
- `.context/SRS/05-parser.md` §"Compartido con el 1376"
- `.context/tax-rules/1376/` — reglas de dominio del 1376
- `.context/PRD/mvp-scope.md` §"MVP 2 — Track A: Formulario 1376"
- `.context/PRD/user-journeys.md` §"Journey 4 — paquete mensual CEDE/GC"
- `ADR-0001-modular-reusable-tax-platform.md` — la arquitectura modular que este ADR pone a prueba
- `ADR-0003-declaracion-periodo-entity.md` — la entidad `declaracion` que se reutiliza como raíz de agregación
- `ADR-0005-configurable-txt-field-layout-2181.md` — configuración de layout del TXT, aplica igual al 1376
- Fuentes DGI + `DJ 1376.xlsx` + archivo PADI de ejemplo — consolidados en el brief de la sesión de foundation
