# Design System — tuDeclaracion.com

**Generado:** Frontend scaffolding (project-bootstrap, Fase 2 — Frontend Setup).
**Fuente de tokens:** `DESIGN.md` (raíz del repo). Este documento no duplica esa fuente,
solo documenta cómo se materializó en código.

---

## Stack

- **Framework:** Next.js 15.5 (App Router) + React 19, TypeScript.
- **Estilos:** Tailwind CSS **v3.4** (pinneado explícitamente — v4 no es compatible con
  el flujo clásico de shadcn/ui basado en `tailwind.config.ts` + CSS variables HSL).
- **Componentes UI:** shadcn/ui (estilo `new-york`, base Radix, `baseColor: slate`,
  CSS variables activadas). El CLI (`bunx shadcn@latest add ...`) detectó automáticamente
  Tailwind v3 (por la presencia previa de `tailwind.config.ts` + `postcss.config.cjs` +
  `globals.css`) y generó componentes en el formato clásico (HSL vars, sin el
  CSS-first `@theme` de Tailwind v4) — no fue necesario pinnear una versión vieja del CLI.
- **Paquete manager:** bun.

## Archivos de configuración

| Archivo | Propósito |
|---|---|
| `next.config.ts` | Config mínima de Next.js (App Router, `src/app` detectado por convención). |
| `postcss.config.cjs` | PostCSS + Tailwind + Autoprefixer. Extensión `.cjs` porque `package.json` declara `"type": "module"` — un `.js` con `module.exports` rompería como ESM. |
| `tailwind.config.ts` | Theme extendido con los tokens de `DESIGN.md` (ver mapeo abajo). |
| `components.json` | Config de shadcn/ui — escrito a mano (no vía `init` interactivo, ver nota abajo). |
| `src/app/globals.css` | Variables CSS HSL (`:root`) + directivas `@tailwind`. |
| `tsconfig.json` | Extendido con `jsx: preserve`, `lib: dom`, alias `@/* -> ./src/*`, plugin `next`. Mantiene `bun-types`/`node` para los scripts CLI existentes (`scripts/*.ts`) — un solo tsconfig sirve a ambos mundos. |

**Nota sobre `components.json` manual:** el CLI actual de shadcn (`shadcn@latest`,
hoy 3.5.x) por defecto apunta a un preset `base-nova` pensado para el CSS-first de
Tailwind v4. En vez de correr `shadcn init` interactivo (que además no funciona en un
shell no-interactivo), se escribió `components.json` a mano con el schema clásico
(`tailwind.config`/`css`/`baseColor`/`cssVariables`) y se corrió únicamente
`shadcn add <componente> --yes --overwrite`. El CLI detectó el Tailwind v3 ya
configurado (preflight check) y generó los componentes en el formato HSL clásico —
confirmado leyendo el código generado (`bg-primary`, `text-primary-foreground`, etc.).

## Colores

Ver `DESIGN.md` §Colors para la paleta completa y el hallazgo de accesibilidad
(success/error a saturación completa NO son válidos como color de texto — solo
como fondo tintado). Mapeo a CSS variables (`src/app/globals.css`) y clases
Tailwind (`tailwind.config.ts`):

| Token DESIGN.md | CSS variable | Uso Tailwind |
|---|---|---|
| `primary` (#08569A) | `--primary` | `bg-primary`, `text-primary` |
| `secondary` (#3082F6) | `--secondary` | `bg-secondary`, `text-secondary` |
| `neutral` (#F3F6FA) | `--accent`, `--muted` | `bg-accent`, `bg-muted` (ver nota) |
| `background` (#F8FAFC) | `--background` | `bg-background` |
| `surface` (#FFFFFF) | `--card`, `--popover` | `bg-card` |
| `text` (#293442) | `--foreground` | `text-foreground` |
| `muted` (#6A727D) | `--muted-foreground` | `text-muted-foreground` |
| `border` (#DCE2E8) | `--border`, `--input` | `border-border` |
| `success` / `successBg` / `successText` | `--success` / `--success-bg` / `--success-text` | `bg-success-bg text-success-text` |
| `warning` / `warningBg` / `warningText` | `--warning` / `--warning-bg` / `--warning-text` | `bg-warning-bg text-warning-text` |
| `error` / `errorBg` / `errorText` | `--error` / `--error-bg` / `--error-text` | `bg-error-bg text-error-text` |

**Decisión de mapeo — `accent`/`muted` background:** DESIGN.md no define un token
"tertiary"/accent separado. `neutral` (#F3F6FA) se usa consistentemente como
superficie alterna (badgeInfo, alertInfo, navInactive), y `muted` (#6A727D) se usa
siempre como color de TEXTO, nunca como fondo. Por eso: `--accent`/`--muted`
(shadcn los usa como *fondos*) apuntan al hex de `neutral`, mientras que
`--muted-foreground` apunta al hex de `muted`. Esto preserva el uso real observado
en `DESIGN.md` en vez de inventar un significado nuevo para los tokens.

**No usar** clases con colores hardcodeados (`bg-blue-500`, `#3B82F6`) — siempre las
clases semánticas de arriba.

## Tipografía

- **Sans / heading:** Inter (cargada vía `next/font/google` en `src/app/layout.tsx`,
  variables `--font-sans` / `--font-heading` — DESIGN.md no define un display font
  distinto, así que heading reutiliza Inter).
- **Mono:** JetBrains Mono (`--font-mono`) — **obligatorio** para RUT, períodos e
  importes (`font-mono` + `font-variant-numeric: tabular-nums` ya aplicado en
  `globals.css`). Ver `DESIGN.md` Do's — nunca usar `body` para datos tabulares.
- **Tamaño base:** `1.0625rem` (17px, no el 16px por defecto) — público de baja
  alfabetización digital heterogénea, ver `DESIGN.md` Typography.

## Spacing y radios

- **Spacing:** la escala nativa de Tailwind v3 (base 4px) ya coincide exactamente
  con `DESIGN.md` (`xs 8px=p-2`, `sm 16px=p-4`, `md 24px=p-6`, `lg 32px=p-8`,
  `xl 40px=p-10`, `2xl 48px=p-12`) — no se sobreescribió `theme.spacing`.
- **Radios:** `rounded-sm` (10px), `rounded`/`rounded-md` (12px, el radio dominante
  del sistema), `rounded-lg` (20px, solo para el shell de login), `rounded-full`
  (pills/badges).

## Componentes UI instalados (shadcn/ui)

Solo los necesarios para las 3 páginas demo — no se sobre-instaló el catálogo completo:

| Componente | Archivo | Uso |
|---|---|---|
| `Button` | `src/components/ui/button.tsx` | CTAs en las 3 páginas. |
| `Card` | `src/components/ui/card.tsx` | Resumen rápido y tabla de actividad (dashboard). |
| `Input` | `src/components/ui/input.tsx` | Login (email/password), búsqueda (empresas). |
| `Label` | `src/components/ui/label.tsx` | Labels de formulario del login (siempre visibles, nunca placeholder-only). |
| `Badge` | `src/components/ui/badge.tsx` | Estados (Operativa/Pendiente/Validado/Generado). **Editado a mano** para agregar las variantes `success`/`warning` (no vienen por defecto en shadcn) usando los tokens `*-bg`/`*-text` — ver `DESIGN.md` hallazgo de accesibilidad. |

`src/lib/utils.ts` — helper `cn()` (clsx + tailwind-merge), estándar de shadcn/ui.

## Páginas demo (rutas)

| Ruta | Mockup fuente | Historias cubiertas |
|---|---|---|
| `/login` | `.context/designs/tudeclaracion/mvp-core-screens/login.html` | US 1.2 |
| `/empresas` | `.context/designs/tudeclaracion/mvp-core-screens/companySelector.html` | US 1.3 (entry point), US 2.1 |
| `/dashboard` | `.context/designs/tudeclaracion/mvp-core-screens/dashboard.html` | US 3.1 (solo CTA), US 7.1, US 7.2 |
| `/` | — (sin mockup, sin US en scope) | Redirect a `/login` — no hay landing en el MVP scope actual. |

Todas usan mock data local (arrays hardcodeados en cada `page.tsx`) — **no hay fetch
real, no hay Supabase todavía** (ver sección "Integración backend" abajo). Los
botones que disparan flujos no mockeados (wizard de carga, alta de empresa) muestran
un mensaje inline en vez de `window.alert()` (el patrón del prototipo original), para
cumplir la regla de lint `no-alert` del repo sin perder la intención del mockup.

**Divergencia deliberada vs. mockup (documentada, no silenciosa):** el dashboard
original no tiene indicador de empresa activa en el sidebar ni filtra la tabla de
actividad — `.context/design/master-design-plan.md` §4.3 ya marca esto como gap
ratificado (D2) pendiente de mockear. Se agregó un indicador mínimo
("Empresa activa: Estudio Rivera (cambiar)", linkeando a `/empresas`) y se filtró
la tabla a una sola empresa, siguiendo el texto de la decisión ya ratificada — no es
una pantalla nueva, es completar un requisito ya aprobado que el mockup no alcanzó
a reflejar.

## Integración backend (diferido)

El backend (Supabase) **no existe todavía** en esta fase — se ejecuta en un pase
posterior de `/project-bootstrap`. Por eso:

- No existe `src/types/supabase.ts` ni `src/lib/types.ts`.
- Las 3 páginas demo declaran sus propios `interface` locales (`Empresa` en
  `/empresas`) en vez de importar tipos generados.
- **Próximo paso (cuando el backend exista):** generar tipos con
  `supabase gen types typescript`, crear `src/lib/types.ts`, y migrar el mock data
  de las páginas demo a esos tipos compartidos.

## Guidelines

**Hacer:**
- Usar siempre las clases semánticas (`bg-primary`, `text-muted-foreground`, etc.),
  nunca hex/colores Tailwind por defecto.
- Usar `font-mono` para cualquier RUT, período o importe.
- Una sola acción primaria (`<Button>` sin `variant`) por pantalla.
- Objetivos táctiles ≥48px (`h-[52px]` en CTAs principales, mockups usan 52px).

**No hacer:**
- No usar `success`/`warning`/`error` (tokens `DEFAULT`, saturación completa) como
  color de texto — solo `success-text`/`warning-text`/`error-text` sobre sus `*-bg`.
- No introducir un segundo acento de marca.
- No reemplazar labels de formulario por placeholders.
- No agregar iconografía decorativa ni emojis (regla explícita de `DESIGN.md`).
