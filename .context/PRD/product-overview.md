# Product Overview — tuDeclaracion.com

> Fuente: `.context/business/business-model.md` (Constitution), `ADR-0001-modular-reusable-tax-platform.md`, y las 3 decisiones de producto confirmadas en sesión (multi-tenancy, alcance de configuración, manejo de errores). Igual criterio que Constitution: lo marcado **Propuesta a validar** no es un hecho confirmado por el usuario, es una síntesis razonable a partir de lo que sí está confirmado.

## 1. Problem Statement

La confección de la Declaración Jurada 2181 de DGI (Uruguay) es hoy un proceso manual: el contador toma el TXT exportado del software contable **Memory**, aplica criterio y reglas tributarias "a mano", y arma el archivo compatible con **PADI**. No hay automatización de por medio.

**Pain point crítico**: el proceso es repetitivo, propenso a error humano, y escala mal — cuantos más clientes atiende un contador, más tiempo absoluto insume una tarea que no aporta valor profesional diferencial (no es la parte del trabajo donde el contador aplica criterio experto).

**Impacto en el usuario actual**: tiempo operativo que no se traduce en valor para el cliente, mayor costo por cliente atendido, y riesgo de error en una presentación regulatoria ante DGI.

## 2. Solution Overview

tuDeclaracion.com automatiza el flujo completo TXT (Memory) → archivo compatible con PADI, para la DJ 2181 en el MVP. Ver `business-flow.md` para el flujo paso a paso desde la perspectiva del usuario.

**Features core (MVP)**:
- Carga del TXT mensual exportado de Memory, con interpretación automática (sin edición manual del archivo).
- Normalización automática: mapeo de cuentas contables a conceptos fiscales vía plan de cuentas configurable por empresa.
- Validación de RUTs, importes y estructura, con mensajes de error acompañados de una guía clara de cómo resolverlos (no un error genérico).
- Motor de reglas tributarias configurable que determina la línea/código PADI y el importe de cada concepto.
- Generación y descarga del archivo TXT final, compatible con PADI, listo para importar en DGI.
- Una cuenta de contador gestiona **múltiples empresas/clientes**, con datos aislados entre sí (multi-tenant, confirmado en el MVP).

**Cómo resuelve el problema**: reemplaza el armado manual del archivo por un pipeline automático (`ADR-0001`), reduciendo el tiempo de la tarea de un proceso manual a minutos, sin requerir que el contador sea un usuario técnico.

**Fuera del MVP 1, pero contemplado en la arquitectura** (no una limitación de diseño, una decisión de secuencia): soporte a formularios DGI más allá del 2181, UI de autoconfiguración del plan de cuentas, remediación automática de errores de validación — ver `mvp-scope.md` y `future-roadmap.md`.

**MVP 2 (desde 2026-08-27)** empieza a concretar ese "más allá del 2181": **Track A** agrega la **DJ 1376** (declaración mensual de IVA + anticipos de IRAE/IPAT/ICOSA/IRPF para contribuyentes CEDE y Grandes Contribuyentes, de la cual la 2181 es anexo). El motor del 1376 reusa el mismo TXT de Memory y agrega saldos por cuenta contable hacia códigos de línea, en vez de consolidar por RUT. Detalle en `mvp-scope.md` → "MVP 2 — Track A: Formulario 1376". Los formularios de retenciones 1146/1246 quedan diferidos.

## 3. Value Proposition

Tres pilares de diferenciación declarados explícitamente: **facilidad de uso, rapidez y confiabilidad** (hecho, del brief). Foco específico y profundo en la DJ 2181 como punto de entrada, en vez de ser un módulo secundario dentro de un sistema contable más amplio.

## 4. Success Metrics

> **Propuesta a validar** — derivadas de las 3 hipótesis del MVP en `business-model.md`; el usuario debe confirmar los valores objetivo exactos y el método de medición.

| Métrica | Tipo | De qué hipótesis se deriva |
|---|---|---|
| Tiempo promedio TXT → archivo PADI listo | Adopción/producto | Hipótesis de tiempo (objetivo: < 5 minutos) |
| % de declaraciones generadas sin error de validación en el primer intento | Confiabilidad | Principio de "confiabilidad" (pilar de diferenciación) |
| % de usuarios que completan el flujo sin contactar soporte | Usabilidad | Hipótesis de usabilidad |
| Tasa de renovación mensual de la suscripción | Negocio | Hipótesis comercial |
| Cantidad de contadores gestionando 2+ empresas bajo una cuenta | Adopción multi-tenant | Decisión de producto: multi-tenancy confirmada en MVP |

## 5. Target Users

Ver `user-personas.md` para el detalle completo.

- **Contador** (cliente principal) — confecciona DJ 2181 para múltiples clientes/empresas desde una sola cuenta. Pain point principal: tiempo manual repetitivo y riesgo de error en una tarea sin valor profesional diferencial.
- **Usuario sin contador** (cliente secundario) — genera su propia DJ 2181 sin intermediario. Muy poco definido en el brief original — persona thin, requiere validación con el usuario.

## Pendiente

- Tech stack (framework, DB, hosting) — decisión de `/project-bootstrap`, no de este documento.
- Valores objetivo exactos de las métricas de éxito (hoy son propuestas, no compromisos confirmados).
- Datos de mercado (competidores, tamaño de mercado) — siguen como `[PLACEHOLDER]` en `.context/business/market-context.md`.
