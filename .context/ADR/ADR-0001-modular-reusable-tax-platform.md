# ADR-0001 — Modular architecture built for a reusable multi-form tax platform

- **Status:** Accepted
- **Date:** 2026-07-02
- **Deciders:** Usuario (product owner de tuDeclaracion.com)
- **Tags:** architecture, modularity, cross-cutting-invariant, tax-engine
- **Supersedes:** —
- **Superseded by:** —

---

## Context

El MVP funcional del producto es únicamente la Declaración Jurada 2181 (ver `.context/business/business-model.md`, "no ampliar a otros formularios sin confirmación"). Sin embargo, el usuario definió — en una sesión previa de diseño, resumida en `Resumen_Arquitectura_tuDeclaracion_MVP.pdf` — que el objetivo del producto **no es construir solo el 2181**, sino una plataforma capaz de soportar múltiples declaraciones juradas de DGI, siendo el 2181 la primera implementación sobre una arquitectura reutilizable. La motivación explícita: las reglas tributarias cambian con la normativa y varían por formulario; si la arquitectura no separa el motor tributario del resto del sistema desde el día uno, incorporar nuevos formularios o cambios regulatorios más adelante implicaría rediseñar el producto.

## Decision

El sistema se construye con una arquitectura modular de pipeline, con **responsabilidad única por módulo**, diseñada para que agregar un nuevo formulario DGI no requiera rediseñar los módulos existentes — solo agregar un nuevo módulo de tipo `forms` y las reglas correspondientes en `tax-rules/`.

**Flujo funcional aprobado (pipeline):**

```
Upload Manager → Parser → Normalizer → Validator → Tax Rules Engine → Form Builder (2181) → Exporter
```

**Módulos** (uno por responsabilidad): Upload Manager, Parser, Normalizer, Validator, Tax Rules Engine, Forms (2181 y futuros), Exporter. Detalle de cada uno en `.context/SRS/03-modules.md` y siguientes.

**Invariante**: el Parser interpreta el archivo exportado por Memory y produce un modelo de datos interno — **no calcula impuestos ni aplica reglas tributarias**. Toda decisión tributaria vive exclusivamente en el Tax Rules Engine (`.context/tax-rules/`), nunca en el Parser, Normalizer o Validator.

**Estructura de carpetas del código** (aplicación bajo `src/`):

```
src/
├── app/
├── components/
├── modules/
│   ├── parser/
│   ├── normalizer/
│   ├── validator/
│   ├── tax-engine/
│   ├── forms/
│   └── exporter/
├── domain/
├── infrastructure/
├── services/
└── shared/
```

**Documentación en tres niveles**, cada uno con una responsabilidad distinta y sin solaparse:
1. **PRD** (`.context/PRD/`) — qué producto se construye y qué problema resuelve.
2. **SRS** (`.context/SRS/`) — cómo está diseñado técnicamente el sistema (módulos, arquitectura, dominio).
3. **Tax Rules** (`.context/tax-rules/`) — reglas tributarias y lógica de negocio específica de cada declaración, separada porque cambia con la normativa y no debe forzar cambios en PRD/SRS.

## Consequences

- **Positive:** agregar una nueva declaración jurada a futuro = agregar un módulo `forms/<nueva>` + reglas en `tax-rules/<nueva>/`, sin tocar Parser/Normalizer/Validator/Exporter (que son genéricos). Los cambios regulatorios del 2181 quedan aislados en `tax-rules/2181/`, sin tocar código de módulos.
- **Negative / trade-offs:** más esfuerzo de diseño upfront para el MVP que si se hubiera hardcodeado todo específicamente para el 2181 — el Validator y el Exporter deben diseñarse genéricos desde el principio aunque hoy solo exista un formulario real para validarlos contra.
- **Neutral / follow-ups:** el Validator se ejecuta **antes** del Tax Rules Engine en el pipeline (valida estructura/RUTs/importes de los datos normalizados, no reglas tributarias) — esto refina el flujo informal descrito originalmente en `business-model.md` (que mencionaba validaciones después del motor de reglas). El pipeline de este ADR es la versión vigente. Pendiente: definir el contrato exacto de "modelo interno estándar" que el Parser entrega al resto del pipeline (`.context/SRS/05-parser.md`).

## Alternatives considered

- **Hardcodear el 2181 sin capa de abstracción reutilizable** — rechazado: contradice el objetivo explícito del usuario de construir una plataforma multi-formulario; hubiera significado reescribir el motor tributario en cuanto se agregue el segundo formulario.
- **Mezclar reglas tributarias dentro del PRD/SRS** — rechazado: las reglas tributarias cambian con la normativa (frecuencia distinta a cambios de producto o arquitectura); mezclarlas forzaría revisar/versionar PRD o SRS cada vez que DGI actualiza una tasa o casilla.

## References

- `Resumen_Arquitectura_tuDeclaracion_MVP.pdf` — fuente de esta decisión (sesión de diseño previa del usuario).
- `.context/SRS/01-system-overview.md`, `03-modules.md` — reflejan este pipeline y estructura de módulos.
- `.context/tax-rules/README.md` (implícito vía `2181/README.md`) — separación de reglas tributarias.
- `.context/business/business-model.md` — MVP funcional (2181 únicamente) vs. arquitectura (multi-formulario).
