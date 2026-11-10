# Future Roadmap — tuDeclaracion.com

> El brief original menciona explícitamente que "durante la evolución del producto podrán evaluarse otros modelos de comercialización" y que el producto debería soportar "nuevas declaraciones juradas más allá de la 2181". Este documento junta esos ítems declarados con las decisiones explícitas de "fuera de MVP, contemplar a futuro" tomadas durante esta sesión. Nada acá está priorizado ni tiene fecha — es un backlog de intención, no un compromiso.

## Confirmado como evolución futura

- **Nuevos formularios DGI más allá del 2181.** La arquitectura ya está diseñada para esto desde el MVP (`ADR-0001-modular-reusable-tax-platform.md`) — agregar un formulario nuevo implica sumar un módulo `forms/<nuevo>` y reglas en `tax-rules/<nuevo>/`, sin rediseñar Parser/Normalizer/Validator/Exporter.
  - **En curso (MVP 2 Track A, desde 2026-08-27): Formulario 1376** — DJ mensual de IVA + anticipos de IRAE/IPAT/ICOSA/IRPF para CEDE y Grandes Contribuyentes; la 2181 es su anexo. Ver `mvp-scope.md` → sección "MVP 2 — Track A". Nota de riesgo: el supuesto "sin rediseñar el pipeline" hay que verificarlo — la 1376 es de tipo **liquidación** y su unidad es **cuenta contable, no RUT** (agregación por saldo Debe − Haber, no consolidación por RUT). La decisión sobre reuso vs. rama del pipeline se registra en `ADR-0006`.
  - **Siguen a futuro**: retenciones **1146** (IRPF) y **1246** (IRNR, corre en Sigma), y el resto de formularios del grupo CEDE/GC (1144, 2183, 1050, 3107, 1474, 1379). Diferidos explícitamente el 2026-08-27.
- **UI de autoconfiguración del plan de cuentas.** En el MVP la carga es manual/asistida (mecanismo exacto pendiente); el modelo de datos ya soporta configuración por empresa, así que agregar la UI de autoservicio no debería requerir cambios de modelo.
- **Remediación automática/asistida de errores de validación.** En el MVP el sistema avisa + guía; a futuro se contempla autocorrección o un wizard de resolución guiada paso a paso (decisión explícita del usuario: "por ahora solo avisaremos... contemplar a futuro").
- **Roles múltiples dentro de una cuenta de contador.** El MVP no define roles — a confirmar si a futuro se necesita (ej. asistente contable con permisos limitados).
- **Niveles de suscripción / pricing diferenciado** (por volumen de declaraciones o cantidad de clientes gestionados) — el brief declara el modelo de suscripción como "preliminar", sin montos ni niveles definidos.
- **Backoffice de configuración (BO).** Pantallas de administración para editar sin tocar código todo lo que sea configurable (tasas, casillas/mapeos de `tax-rules/`, plan de cuentas, etc.) — la UI queda fuera de este MVP. Precondición ya decidida: el modelo de datos debe ser config-driven (tablas en DB) desde el bootstrap, no hardcodeado, para que el BO se agregue después sin rediseño (ver `open-questions.md`, resuelto 2026-07-07).

## Candidatas sin confirmar (no fabricar detalle, solo dejar registro de la pregunta)

- Historial y gestión de declaraciones generadas por empresa/período — parece un requisito natural pero no fue confirmado por el usuario como parte del MVP ni del roadmap.
- Canales de distribución (referidos entre contadores, gremiales/colegios profesionales) — hoy son "Propuesta a validar" en `business-model.md`, no decisiones tomadas.

## Explícitamente NO es roadmap — pertenece a Constitution

- Estructura de precios exacta, partners formales, costos — ver `.context/business/business-model.md` (Business Model Canvas), no se repiten acá.
