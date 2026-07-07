# 02 — System Architecture

> Estado: **stack confirmado** (2026-07-05, al arrancar `/project-bootstrap`). Estructura de carpetas confirmada (`ADR-0001`).

## Stack confirmado

- **Frontend + Backend**: Next.js 15 (App Router) + React 19 — monorepo único, API routes hacen de backend (ver `.agents/project.yaml`).
- **Base de datos**: Supabase (PostgreSQL) — también resuelve Auth (self-service, ver `12-security.md`) y aislamiento de tenant vía RLS sobre `cuenta_id`.
- **Runtime / package manager**: Bun.
- **Hosting**: Vercel (implícito por el resto del toolchain de este boilerplate — `vercel-cli` skill).

## Confirmado — estructura de carpetas (`ADR-0001-modular-reusable-tax-platform.md`)

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

Cada carpeta dentro de `modules/` corresponde 1:1 a un módulo del pipeline documentado en `03-modules.md`. `domain/` aloja las entidades compartidas de `04-domain-model.md`; `infrastructure/` y `services/` separan detalles técnicos (DB, integraciones) de la lógica de dominio; `shared/` es agnóstico de dominio (ver Rule 10 del CLAUDE.md raíz del repo — utilidades sin acoplamiento a un módulo específico).

## Qué falta definir

- Diagrama de arquitectura a nivel componentes/despliegue (Mermaid, una vez el scaffolding exista)

## Restricciones conocidas (de Constitution + `ADR-0001`)

- El **Tax Rules Engine** es el activo diferencial del producto — reglas en DB, configurables, no hardcodeadas; su contenido de negocio vive en `.context/tax-rules/`, separado de este SRS.
- El **plan de cuentas** (mapeo cuenta contable → concepto fiscal) es configurable por empresa.
- El Parser, Normalizer, Validator y Exporter deben ser **genéricos** (no acoplados al 2181) para sostener la reutilización multi-formulario decidida en `ADR-0001`.

