# Open Questions — tuDeclaracion.com

> Registro único y acumulativo de todo lo que quedó pendiente de confirmar en el proyecto. Hand-maintained, append-only (mismo criterio que `business/domain-glossary.md`) — no se regenera automáticamente ni se reescribe desde cero. Cada vez que surja un nuevo pendiente (en cualquier fase: Constitution, PRD, SRS, tax-rules, Design, Sprint), se agrega acá. Cuando uno se resuelve, se tacha (`~~texto~~`) con la fecha y la decisión tomada, no se borra — mantiene el historial de qué se decidió y cuándo.

Última actualización: 2026-08-27 (agregada sección "1376 / MVP 2 Track A").

## Arquitectura (`ADR-0001-modular-reusable-tax-platform.md`)

- [x] ~~¿Cuándo construir el backoffice de configuración (BO) para editar sin tocar código todo lo que sea configurable — antes o después de este MVP?~~ **Resuelto 2026-07-07**: la UI del BO queda fuera de este MVP. Pero el modelo de datos de todo lo configurable (tasas, casillas/mapeos de `tax-rules/`, plan de cuentas, etc.) debe ser config-driven (tablas en DB) desde el bootstrap — no hardcodeado en código — para que agregar el BO más adelante sea solo una capa CRUD encima de datos existentes, sin tocar el Tax Rules Engine ni otros módulos (consistente con ADR-0001).

## Constitution (`.context/business/market-context.md`)

- [ ] Competidores/herramientas que usan hoy los contadores uruguayos para la DJ 2181.
- [ ] Datos de tamaño de mercado (contadores activos, volumen DJ 2181, TAM/SAM/SOM).

## SRS — dominio técnico

- [ ] Formato exacto del TXT de ENTRADA de Memory (`SRS/05-parser.md`) — solo tenemos el de salida/PADI confirmado.
- [ ] Mecanismo de carga inicial del plan de cuentas en el MVP, sin UI de autoconfiguración (`SRS/06-normalizer.md`).
- [ ] Mínimos DGI, rango válido de importes, validación de período, si un error bloquea todo el archivo o solo la línea, contenido exacto de la guía de error (`SRS/07-validator.md`).
- [ ] Si el campo importe del TXT de salida lleva decimales implícitos (`SRS/10-exporter.md`).
- [x] ~~Modelo exacto de relación Cuenta de contador ↔ Empresa — ¿un contador = una cuenta con N empresas? ¿una empresa puede tener más de un contador? (`SRS/04-domain-model.md`).~~ **Resuelto 2026-07-05**: 1 Cuenta → N Empresas, estrictamente. Una Empresa pertenece a una única cuenta (FK simple, sin tabla N:N).
- [x] ~~Stack tecnológico (framework/DB/hosting) — decisión de `/project-bootstrap` (`SRS/02-system-architecture.md`).~~ **Resuelto 2026-07-05**: Next.js 15 + React 19 (monorepo, API routes) + Supabase (DB/Auth) + Bun + Vercel — el stack que soporta el scaffolding automático de este boilerplate.
- [x] ~~Modelo de autenticación/autorización, cifrado, retención de datos (`SRS/12-security.md`).~~ **Auth/autorización resuelto 2026-07-05**: self-service, un usuario = una cuenta (sin roles en MVP), autorización por aislamiento de tenant (`cuenta_id`). Cifrado y retención de datos siguen pendientes (no bloquean bootstrap, se definen junto al stack).

## Tax Rules (`.context/tax-rules/`)

- [ ] Reglas concretas concepto fiscal → casilla PADI — contenido central del tax engine, todavía vacío (`2181/mapping.md`).
- [ ] Fórmulas de cálculo de importe por casilla (`2181/formulas.md`).
- [ ] Catálogo COMPLETO de códigos PADI — solo confirmados 502, 503, 504, 505, 506, 552, 553; el usuario dejó constancia de que faltan más (`2181/casillas.md`, `SRS/09-forms.md`).
- [ ] Algoritmo de dígito verificador del RUT uruguayo (`common/rut.md`).
- [ ] Tasas de IVA vigentes exactas — básica/mínima/exenta (`common/iva.md`).
- [ ] Plazos de presentación DGI para la 2181 (`common/fechas.md`).

## PRD

- [ ] Persona secundaria "usuario sin contador" — casi sin definir (demographics, goals, pain points) (`PRD/user-personas.md`).
- [ ] Comportamiento ante múltiples errores en un mismo archivo — ¿todos juntos o de a uno? (`PRD/business-flow.md`, `PRD/user-journeys.md`).
- [ ] Valores objetivo exactos de las métricas de éxito — hoy son propuestas, no compromisos confirmados (`PRD/product-overview.md`).
- [ ] Canales de distribución y niveles de suscripción/pricing — siguen como "Propuesta a validar" (`future-roadmap.md`).

## Design (`.context/design/master-design-plan.md`)

- [x] ~~**D1** — el mockup de login (`login.html`) incluye la nota "¿Primera vez? Contactá al administrador del estudio", lo que sugiere que el alta de cuenta (US 1.1) podría **no ser self-service** — contradice el supuesto actual del PRD (que asume que el contador se registra solo). Necesita decisión explícita del usuario antes de construir US 1.1.~~ **Resuelto 2026-07-05**: el alta de cuenta ES self-service, tal como asume el PRD. El mockup estaba desactualizado y se corrigió a "¿Primera vez? Creá tu cuenta".
- [x] ~~**D2** — el mockup de dashboard no tiene selector ni alta de empresa visible (US 1.3 / US 2.1) — probablemente porque el prototipo se diseñó antes de confirmar multi-tenancy en esta sesión. Falta un mockup para el flujo multi-empresa antes de construir esas historias.~~ **Resuelto 2026-07-05**: tras el login se muestra un listado de empresas del contador (pantalla `company-select`, mockup entregado — `companySelector.html`); al seleccionar una, redirige al dashboard scoped a esa empresa. El dashboard suma un indicador/link de empresa activa para volver al listado y cambiar de empresa sin cerrar sesión. Pendiente: ajustar `dashboard.html` (sidebar + tabla scoped, ver checklist §4.3).
- [x] ~~El mockup `companySelector.html` no tiene CTA de "dar de alta nueva empresa" (US 1.3) — solo permite seleccionar entre empresas existentes. Definir si se agrega ahí (ej. card "+ Nueva empresa") o si US 1.3 tiene pantalla propia.~~ **Resuelto 2026-07-05**: se agregó una card con borde punteado "Agregar nueva empresa" al final del listado, en `companySelector.html`. Dispara un placeholder por ahora — el formulario/flujo real de alta de empresa sigue sin mockear.
- [ ] Decisión sobre `successText`/`errorText` agregados a `DESIGN.md`: ¿mantener la corrección de accesibilidad (recomendado) o revertir a los tonos originales del prototipo, que fallaban WCAG AA?
- [ ] Pantallas todavía sin mockear: wizard de carga de TXT (US 3.x), flujo de error de validación en contexto real (US 4.2/4.3), recuperación de contraseña (US 1.4), pantalla de descarga del archivo PADI (US 6.1).

## 1376 / MVP 2 Track A (`SRS/13-forms-1376.md`, `tax-rules/1376/`, `ADR-0006`)

> Lista detallada y viva en `.context/tax-rules/1376/open-questions.md`. Acá el resumen de las que afectan diseño/arquitectura.

- [ ] **Catálogo real de líneas del 1376** por panel/rubro — DGI lo publica en imágenes, no capturado. Los códigos que hoy están en `tax-rules/1376/codigos.md` (101/201/301/302/501/502/510/601) son del diseño del usuario, sin validar contra DGI (`tax-rules/1376/codigos.md`, `panels.md`).
- [ ] **Cómo se computa el saldo de una cuenta** desde el formato del TXT del 2181, donde `Debe`/`Haber` son códigos de cuenta y los importes están en `Total`/`IVA` (`tax-rules/1376/formulas.md`, `SRS/13-forms-1376.md`).
- [ ] **¿El motor determina la liquidación** (saldo a pagar, líneas 322/970/971/972, boleto 2908) o solo entrega totales por código de línea? El ejemplo real es solo totales (`SRS/13-forms-1376.md`, `ADR-0006`).
- [ ] **Fuente del dato "ventas/compras acumuladas del ejercicio"** que pide el Panel 1 — el TXT mensual no lo trae (`tax-rules/1376/panels.md`).
- [ ] **Regla de selección de código "según tipo de contribuyente/sector"** (IRAE 108/126/128, IPAT 328/320/323, Sobretasa 335/330/333) (`tax-rules/1376/codigos.md`).
- [ ] **Casos especiales — alcance MVP 2**: DJ sin movimiento, giro agropecuario (líneas 33/36/54), IVA en Suspenso, chatarra/residuos. ¿Entran? (`tax-rules/1376/panels.md`).
- [ ] **Vínculo 2181 ↔ 1376 en el modelo de datos** — la 2181 es anexo de la 1376; cómo se relaciona el par bajo una `declaracion` de período (trabajo de `/sprint-development`, `ADR-0006`).
- [ ] **Matriz de mapeo del 1376**: schema físico, si admite versión/histórico como `plan_cuentas`, si hay mapeo base sugerido (US M2.3) (`tax-rules/1376/mapping.md`).
- [ ] **Fixtures de prueba**: TXT reales procesados en PADI para la 1376 + resultado esperado — pendiente que la contadora los aporte.

## Notas

- Link roto en la fuente externa `C:\Projects\Personal\Design\`: `index.html`/`tudeclaracion-sistema-base.html` linkean a `landing-page.html` (no existe); el archivo real es `landing-2.html`. No corregido — esa carpeta no es este repo.
