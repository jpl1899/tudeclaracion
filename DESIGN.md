---
version: alpha
name: tuDeclaracion
description: Sistema visual profesional, sobrio y de alto contraste para un SaaS de generación de declaraciones juradas DGI, pensado para contadores de 22 a 65 años con alfabetización digital heterogénea.
colors:
  primary: '#08569A'
  secondary: '#3082F6'
  neutral: '#F3F6FA'
  background: '#F8FAFC'
  surface: '#FFFFFF'
  text: '#293442'
  muted: '#6A727D'
  border: '#DCE2E8'
  success: '#2F9F3D'
  successBg: '#E6F4E8'
  successText: '#006B00'
  warning: '#EE9E10'
  warningBg: '#FDF3E2'
  warningText: '#7D4700'
  error: '#F13936'
  errorBg: '#FDE7E7'
  errorText: '#B00000'
typography:
  display:
    fontFamily: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif
    fontSize: 3.5rem
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: '-0.03em'
  h1:
    fontFamily: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif
    fontSize: 2.5rem
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: '-0.02em'
  h2:
    fontFamily: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif
    fontSize: 1.875rem
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: '-0.02em'
  body:
    fontFamily: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif
    fontSize: 1.0625rem
    fontWeight: 400
    lineHeight: 1.55
  body-sm:
    fontFamily: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: '0.01em'
  label:
    fontFamily: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif
    fontSize: 0.9375rem
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: '0.02em'
  mono:
    fontFamily: JetBrains Mono, "SFMono-Regular", Consolas, ui-monospace, monospace
    fontSize: 0.9375rem
    fontFeature: tnum
rounded:
  sm: 10px
  md: 12px
  lg: 20px
  full: 9999px
spacing:
  xs: 8px
  sm: 16px
  md: 24px
  lg: 32px
  xl: 40px
  2xl: 48px
components:
  button:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.surface}'
    typography: '{typography.label}'
    rounded: '{rounded.md}'
    padding: '{spacing.sm}'
    height: 48px
  buttonSecondary:
    backgroundColor: '{colors.neutral}'
    textColor: '{colors.primary}'
    typography: '{typography.label}'
    rounded: '{rounded.md}'
    padding: '{spacing.sm}'
    height: 48px
  buttonGhost:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text}'
    typography: '{typography.label}'
    rounded: '{rounded.md}'
    padding: '{spacing.sm}'
    height: 48px
  input:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text}'
    typography: '{typography.body}'
    rounded: '{rounded.md}'
    padding: '{spacing.xs}'
    height: 48px
  card:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text}'
    rounded: '{rounded.md}'
    padding: '{spacing.md}'
  modal:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text}'
    rounded: '{rounded.lg}'
    padding: '{spacing.lg}'
  badgeInfo:
    backgroundColor: '{colors.neutral}'
    textColor: '{colors.primary}'
    rounded: '{rounded.full}'
    padding: '{spacing.xs}'
    height: 28px
  badgeSuccess:
    backgroundColor: '{colors.successBg}'
    textColor: '{colors.successText}'
    rounded: '{rounded.full}'
    padding: '{spacing.xs}'
    height: 28px
  badgeWarning:
    backgroundColor: '{colors.warningBg}'
    textColor: '{colors.warningText}'
    rounded: '{rounded.full}'
    padding: '{spacing.xs}'
    height: 28px
  alertInfo:
    backgroundColor: '{colors.neutral}'
    textColor: '{colors.primary}'
    rounded: '{rounded.md}'
    padding: '{spacing.sm}'
  alertWarning:
    backgroundColor: '{colors.warningBg}'
    textColor: '{colors.warningText}'
    rounded: '{rounded.md}'
    padding: '{spacing.sm}'
  alertError:
    backgroundColor: '{colors.errorBg}'
    textColor: '{colors.errorText}'
    rounded: '{rounded.md}'
    padding: '{spacing.sm}'
  table:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.muted}'
    typography: '{typography.body-sm}'
    padding: '{spacing.xs}'
  nav:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text}'
    rounded: '{rounded.md}'
    padding: '{spacing.xs}'
  navInactive:
    backgroundColor: '{colors.background}'
    textColor: '{colors.muted}'
    rounded: '{rounded.md}'
    padding: '{spacing.xs}'
  divider:
    backgroundColor: '{colors.border}'
    height: 1px
---

## Overview

**Confianza institucional, sin fricción.** Adaptado de un prototipo funcional ya construido por el usuario (`design-system.html`, `landing-2.html`, `login.html`, `dashboard.html` — cuatro superficies HTML/CSS reales, no un brief abstracto), este sistema traduce a la práctica los tres pilares de `business-model.md`: **facilidad de uso, rapidez y confiabilidad**.

La atmósfera es profesional, conservadora y moderna — deliberadamente antónima de la estética "startup". Cada pantalla tiene **una sola acción primaria** (principio explícito del prototipo original), alto contraste para lectura inmediata, y componentes repetibles pensados para escalar de una declaración (2181) a muchas sin rehacer la base (`ADR-0001-modular-reusable-tax-platform.md`). El público objetivo —contadores de 22 a 65 años con niveles de alfabetización digital heterogéneos— exige objetivos táctiles grandes (mínimo 48px), tipografía legible sin esfuerzo, y cero ambigüedad en el siguiente paso.

## Colors

Paleta sobria: fondo casi blanco, un único acento azul institucional, y tres colores semánticos de estado. Todos los valores fuente estaban en **OKLCH** (`design-system.html`); se convirtieron a hex sRGB porque la spec DESIGN.md (alpha) todavía no admite OKLCH. Verificación de contraste incluida — ver hallazgo de accesibilidad al final de esta sección.

- **Primary (`#08569A`):** azul institucional — el acento controlado del sistema, aparece una sola vez por pantalla como CTA principal. Contraste con `surface`/`background`: 7.15–7.48:1 (AAA).
- **Secondary (`#3082F6`):** azul secundario más saturado (`--accent-2` en el prototipo). **Nota de honestidad**: en el prototipo original este token está declarado pero no aplicado a ningún componente concreto (los links y estados usan `primary`, no `accent-2`) — lo mantengo declarado tal cual el sistema fuente, sin inventarle un uso que no existe. El linter lo marca como "orphaned token"; es correcto, no un error a corregir.
- **Neutral (`#F3F6FA`):** superficie alterna (`--surface-alt`) para paneles secundarios, sidebars y dropzones — separa jerarquía sin introducir un segundo color.
- **Background (`#F8FAFC`):** fondo general, casi blanco con un matiz frío apenas perceptible.
- **Surface (`#FFFFFF`):** blanco puro — cards, paneles, inputs.
- **Text (`#293442`):** texto principal — azul-gris oscuro, no negro puro, para evitar dureza visual. Contraste 12.06–12.62:1 sobre fondo/superficie.
- **Muted (`#6A727D`):** texto secundario, ayudas, metadata. Contraste 4.65–4.87:1 — pasa AA para texto normal.
- **Border (`#DCE2E8`):** bordes y separadores de baja intensidad.
- **Success / Warning / Error (`#2F9F3D` / `#EE9E10` / `#F13936`):** color de estado a saturación completa — el prototipo original los usa para relleno de badge y borde de alerta (mezclados con blanco al 24% para el borde; la spec DESIGN.md no tiene un sub-token de color de borde, así que ese uso queda documentado acá, no en el frontmatter). Declarados pero no referenciados directamente por ningún componente del frontmatter — el linter los marca "orphaned"; es intencional, ver nota de `secondary` arriba.
- **successBg / warningBg / errorBg (`#E6F4E8` / `#FDF3E2` / `#FDE7E7`):** el mismo color de estado mezclado al 12% con blanco — el fondo REAL que usan los badges y alerts del prototipo (nunca el color a saturación completa como fondo de texto, eso fue el hallazgo de accesibilidad de abajo).
- **successText / warningText / errorText (`#006B00` / `#7D4700` / `#B00000`):** variantes oscurecidas de cada color de estado, exclusivamente para texto sobre los fondos `*Bg` de arriba. `warningText` ya existía en el prototipo original (`oklch(45% 0.12 72)` codeado a mano en `.badge.warning`); `successText` y `errorText` son una extensión mía siguiendo el mismo patrón, porque el prototipo no los tenía.

**Hallazgo de accesibilidad (transparente, no corregido en silencio):** medí el contraste de `success` y `error` tal como estaban en el prototipo original, usados como color de texto sobre su propio fondo tintado al 12% (patrón de los badges) — dieron **2.98:1** y **3.30:1** respectivamente, por debajo del mínimo AA (4.5:1). El prototipo ya había resuelto este mismo problema para `warning` (con un `warningText` manual), pero no para `success`/`error`. Repliqué esa misma solución para los dos que faltaban, y de paso separé el fondo tintado (`*Bg`) del color a saturación completa, porque el linter oficial de `@google/design.md` verifica el par literal `backgroundColor`/`textColor` de cada componente — con el color a saturación completa como fondo, ni siquiera el texto oscurecido pasaba AA. Todos los pares `*Bg`/`*Text` verifican por encima de 5.9:1 (ver `npx designmd lint` en el reporte). Si preferís mantener los tonos originales sin esta corrección, avisame y lo revierto — quedó documentado para que sea una decisión tuya, no mía.

## Typography

Familia única: **Inter** (sans, fallback a system-ui) para todo el sistema, más **JetBrains Mono** exclusivamente para valores numéricos tabulares (RUTs, importes, períodos) — el prototipo ya usa `.mono` con `font-variant-numeric: tabular-nums` para esto, un detalle importante en un dominio tributario donde los números deben alinearse en columna.

- **Display (56px / 3.5rem, weight 600):** títulos hero de portada ("Declaración 2181"). En pantallas de producto reales se implementa con `clamp()` fluido, ancla en este tamaño máximo.
- **H1 (40px / 2.5rem, weight 600):** título de pantalla principal (ej. "Panel principal", "Hola, Andrea.").
- **H2 (30px / 1.875rem, weight 600):** títulos de sección dentro de una pantalla.
- **Body (17px / 1.0625rem):** texto de formularios, paneles, ayudas, tablas — deliberadamente mayor que el "16px" por defecto de la mayoría de los sistemas, por el público con alfabetización digital heterogénea.
- **Body-sm (14px):** texto auxiliar, disclaimers.
- **Label (15px, weight 600):** labels de formulario, siempre visibles (nunca placeholder-only).
- **Mono:** valores tabulares — RUT, períodos, importes.

## Layout

Unidad base: **8px**. Escala: `xs 8px · sm 16px · md 24px · lg 32px · xl 40px · 2xl 48px`. Contenedor máximo: `1200–1280px`, centrado, con padding lateral que se reduce en mobile (`calc(100% - 24px)` bajo 720px).

Grillas observadas en el prototipo: 4 columnas para cards de resumen (`grid-4`), 2 columnas para paneles emparejados (formulario + ayuda, tabla + navegación), sidebar fijo de `240–260px` + contenido fluido para el dashboard (colapsa a una columna bajo `1080px`). No hay un grid de 12 columnas explícito — el sistema usa grids de propósito específico por sección, no un grid universal.

## Elevation & Depth

Dos niveles de sombra, ambas sutiles (nunca sombras duras):

- **sm** — `0 8px 20px rgba(0,0,0,.06)`: cards, paneles, botones flotantes.
- **md** — `0 16px 36px rgba(0,0,0,.08)`: elementos que se elevan por sobre el contenido (login shell, modal propuesto).

**Z-index:** el prototipo solo define un valor real (`topbar` sticky, `z-index: 5`) — no hay modal ni dropdown construidos todavía, así que no hay convención de capas observada más allá de eso. Propuesta razonable a validar cuando se construya el primer overlay: `base 0 · sticky-header 5 · dropdown 100 · modal 1000 · toast 10000`.

## Shapes

- **sm (10px):** elementos internos menores (swatches, thumbs de preview).
- **md (12px):** radio estándar de componentes — botones, inputs, cards, badges de navegación. Es el radio que domina el sistema.
- **lg (20px):** contenedores destacados de una sola instancia por flujo (el shell de login).
- **full (9999px):** pills — badges de estado, chips de navegación.

## Components

> Nota de esquema: la versión actual del linter (`@google/design.md` v0.3.0) solo reconoce estos sub-tokens por componente: `backgroundColor, textColor, typography, rounded, padding, size, height, width`. No existe un sub-token de color de borde — por eso el color `border` se documenta acá en prosa y se materializa vía el componente `divider`, en vez de aparecer en cada componente individualmente (limitación de esta versión alpha de la spec, no una omisión).

- **Button** (`button` / `buttonSecondary` / `buttonGhost`): `button` es la única acción primaria por pantalla (fondo `primary`, texto `surface`). `buttonSecondary` usa fondo `neutral` + texto `primary` (equivalente al "fondo primary al 8%" del prototipo original). `buttonGhost` usa fondo `surface` + borde `border` (borde documentado en prosa, ver nota de esquema arriba). Altura 48px (52px en formularios destacados como login/dashboard) — objetivo táctil grande, deliberado para el público del producto.
- **Input** (`input`): campos de texto, select, textarea — altura 48px, radio `md`, borde `border`, foco con anillo de 3px al 24% de `primary` (efecto de foco, no representable como sub-token en esta versión de la spec — documentado acá). Labels siempre visibles arriba del campo, nunca solo placeholder.
- **Card / Panel** (`card`): contenedor base del sistema — superficie blanca, borde `border`, sombra `sm` (ver Elevation), padding `md` (24px).
- **Modal** (`modal`): **no existe todavía en el prototipo** (no hay pantalla con overlay) — lo definí por completitud de la spec (requisito mínimo de DESIGN.md), reusando los mismos tokens del sistema (superficie, radio `lg`, sombra `md`). Antes de implementarlo, validar con un mockup real.
- **Badge** (`badgeInfo` / `badgeSuccess` / `badgeWarning`): pill de estado, texto en mayúsculas, siempre usando las variantes `*Text` para pasar contraste (ver hallazgo en Colors). No existe `badgeError` en el prototipo original — solo se documenta si aparece un caso de uso real.
- **Alert** (`alertInfo` / `alertWarning` / `alertError`): banner de mensaje — este es el componente que materializa el requisito de producto confirmado "todo error de validación viene con una guía clara de cómo seguir" (`PRD/functional-requirements.md`, FR-12).
- **Table** (`table`): headers en mayúsculas color `muted`, filas separadas por `divider` — usado para listados de clientes/declaraciones/actividad reciente. Valores numéricos en tipografía `mono`.
- **Nav** (`nav` / `navInactive`): sidebar (dashboard) o barra horizontal (design-system) — ítem activo con fondo `surface` + borde `border`, inactivo con fondo `background` + texto `muted`.
- **Divider** (`divider`): línea de 1px en color `border` — separadores de filas de tabla y secciones. Materializa el token `border`, que el esquema de componentes no puede referenciar directamente por color (ver nota arriba).
- **Dropzone** (sin componente formal en la spec — patrón compuesto): borde punteado en `primary` al 24%, fondo `neutral`, para la carga del TXT exportado de Memory (el paso más crítico del flujo, `PRD/business-flow.md`). No lo modelé como componente porque la spec no tiene un sub-token de estilo de borde (`dashed`); documentado acá para no perder el patrón.

## Do's and Don'ts

**Hacer:**
- Una sola acción primaria (`btn primary`) por pantalla — es un principio explícito del sistema original, no negociable.
- Usar `mono`/tabular-nums para cualquier RUT, período o importe — nunca la fuente `body` para datos tabulares.
- Acompañar TODO estado de error con texto accionable ("qué pasó" + "cómo seguir"), nunca solo un color o ícono.
- Mantener objetivos táctiles ≥48px en toda acción interactiva — el público incluye usuarios con baja soltura digital.
- Usar `successText`/`warningText`/`errorText` (nunca los tokens de relleno) cuando un color semántico se usa como texto.

**No hacer:**
- No usar `success`/`error`/`warning` (los tokens de relleno) como color de texto directo sobre `surface`/`background` — fallan AA (ver hallazgo en Colors). Solo como fondo tintado, borde o ícono.
- No introducir un segundo acento de marca — el sistema es deliberadamente mono-acento (`primary` + `secondary` como variante de interacción, no un segundo color de marca).
- No usar sombra `md` fuera de elementos que se elevan sobre el flujo normal (login shell, modal) — devalúa la jerarquía visual.
- No reemplazar labels de formulario por placeholders — el público objetivo necesita el label siempre visible.
- No agregar iconografía decorativa ni emojis — el prototipo original es explícito: "Nunca emojis ni iconos decorativos para llenar espacio."
