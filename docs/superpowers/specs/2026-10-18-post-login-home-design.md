# Post-login home, user menu and account page — design

- **Date**: 2026-10-18
- **Status**: Approved in conversation, pending spec review
- **Design fidelity (Rule 14)**: no mockup. Spec-only build that reuses the live UI components (`Card`, `Button`, `Logo`, lucide icons, login/empresas visual language). Recorded as a ratified spec-only divergence in `.context/design/master-design-plan.md` §5, with new rows in §8.

## Problem

After login every entry point (password login, Google callback, email confirmation, middleware) lands on `/empresas`, a company picker. There is no neutral starting point, no way to reach Ayuda without first choosing a company, no way to sign out, and the account has no display name (`cuenta.nombre` exists but is never written: `handle_new_user()` only inserts `id` and `email`).

## Scope

1. New `/inicio` home screen as the post-login landing.
2. User menu (initials avatar) with name, email, "Mi cuenta", "Ayuda", "Salir".
3. New `/cuenta` page to edit the display name, built in sections.
4. Ayuda (`/dashboard/ayuda`) works without an active company.
5. Every post-login redirect points to `/inicio`.

**Out of scope**: dark mode / theme switch (needs a dark palette in DESIGN.md first — separate project), BCU quote widget, DGI due-date calendar, `Ctrl+K` search, plan limits and session/device limits (pending business model).

## 1. `/inicio`

Server Component. Requires a session (`/inicio` added to `PROTECTED_ROUTES` in `middleware.ts`).

```
+----------------------------------------------------------+
| [logo] tuDeclaracion                        [JL] <- menu |
|                                                          |
| Hola, Juan                                               |
| 4 empresas · 2 declaraciones pendientes de generar       |
|                                                          |
| [ Continuar donde quedaste                               |
|   Comercial del Sur S.A. · RUT 21xxxxxxxxxx     Ir -> ]  |
|                                                          |
| [ Empresas ]   [ Crear empresa ]   [ Ayuda ]             |
+----------------------------------------------------------+
```

**Data** (three queries, all RLS-scoped to `auth.uid()`):

| Data | Source |
|---|---|
| Display name | `cuenta.nombre` for the current user |
| Company count | `empresa` rows (`count`, `head: true`) |
| Pending count | `declaracion` rows with `estado = 'abierta'` — same rule as the dashboard's "Pendientes de generar" |
| Last active company | `EMPRESA_ACTIVA_COOKIE` resolved with `resolverEmpresaActiva` |

**Rules**

| Element | Behaviour |
|---|---|
| Greeting | `Hola, {nombre}` when `nombre` is set (first word only), otherwise `Hola`. |
| Summary | `{n} empresa(s) · {m} declaración(es) pendiente(s) de generar`; with 0 pending: `{n} empresa(s) · Sin declaraciones pendientes`; with 0 companies: `Todavía no cargaste empresas`. If either count query fails, the summary line is hidden and the error is logged server-side; the rest of the page renders. |
| Continuar donde quedaste | Shown only when the cookie resolves to an existing company. Shows name + RUT (mono font), links to `/dashboard`. |
| Action cards | Three `Link` cards (icon, title, one-line description), min height 48px, keyboard-focusable with visible focus ring. Grid: 3 columns from `md`, 1 column below. |
| Card copy | Empresas — "Elegí con qué empresa trabajar" → `/empresas`. Crear empresa — "Alta de una empresa con su plan de cuentas" → `/empresas/nueva`. Ayuda — "Guías de cada formulario" → `/dashboard/ayuda`. |
| No companies | "Crear empresa" card gets the primary (highlighted) style. |

Text building (greeting, pluralised summary) lives in a pure function `construirResumenInicio` in `src/modules/inicio/` with unit tests.

## 2. User menu

New `UserMenu` client component. Trigger: circle with initials (first letter of the first two words of `nombre`; if no `nombre`, a lucide `User` icon). Uses `@radix-ui/react-dropdown-menu` (new dependency, same family as the existing Radix dialog/checkbox) wrapped as `src/components/ui/dropdown-menu.tsx`.

```
+---------------------------+
| Juan Leites               |   <- omitted when no nombre
| jplmontevideo@gmail.com   |
+---------------------------+
| Mi cuenta        -> /cuenta
| Ayuda            -> /dashboard/ayuda
+---------------------------+
| Salir                     |
+---------------------------+
```

**Placement**: top-right of `/inicio`, `/empresas` and `/cuenta`; inside `DashboardShell` for every `/dashboard` screen. The component receives `{ nombre, email }` from the server page; no client-side fetch.

**Salir**: a Server Action that calls `supabase.auth.signOut()`, deletes `EMPRESA_ACTIVA_COOKIE` (so the next person on the same machine does not inherit it) and redirects to `/login`. On a sign-out error it still clears the cookie and redirects (the session cookie is gone client-side either way); the error is logged.

## 3. `/cuenta` — Mi cuenta

Protected route (added to `PROTECTED_ROUTES`). Built as stacked sections so later business features slot in without a redesign:

| Section | Now | Later (not in this spec) |
|---|---|---|
| Perfil | Nombre (editable, max 80 chars, trimmed; empty allowed = no name) and email (read-only) | — |
| Plan | — | Plan, company limit usage |
| Seguridad | — | Sessions / devices |

Saving updates `cuenta.nombre` through the existing RLS policy (`update` only on `id = auth.uid()`). Success and error banners follow the existing pattern (fixed Spanish message, raw error to `console.error`). No migration.

**Google name**: in `src/app/auth/callback/route.ts`, after a successful code exchange, if `cuenta.nombre` is null and `user.user_metadata.full_name` (fallback `name`) is present, write it to `cuenta.nombre`. Never overwrite a name the user already set. Covers new and existing Google users on their next login.

## 4. Ayuda without an active company

`/dashboard/ayuda` stops redirecting to `/empresas` when there is no active company. `DashboardShell.empresaNombre` becomes optional: when absent, the active-company slot shows an "Elegir empresa" link to `/empresas`. The other dashboard screens keep requiring an active company.

## 5. Navigation changes

| Place | Before | After |
|---|---|---|
| `login-client.tsx` after password login | `/empresas` | `/inicio` |
| `auth/callback` default `next` | `/empresas` | `/inicio` |
| `auth/confirm` default `next` | `/empresas` | `/inicio` |
| `middleware.ts` authenticated user on an auth route | `/empresas` | `/inicio` |
| Signup `emailRedirectTo` `next` | `/empresas` | `/inicio` |
| `DashboardShell` logo | not a link | link to `/inicio` |
| `/empresas` header | — | "Inicio" link to `/inicio` |

`safeInternalPath` fallbacks change with them; explicit `next` values keep working.

## Testing

- Unit: `construirResumenInicio` (name / no name, 0 / 1 / n companies, 0 / 1 / n pending).
- Unit: initials helper (two words, one word, empty).
- Types + lint + full test suite.
- Browser on local/staging: login lands on `/inicio`; each card navigates; "Continuar" appears only with an active company; Ayuda opens with no active company and shows "Elegir empresa"; Mi cuenta saves a name and the greeting/menu update; Salir returns to `/login` and `/inicio` then redirects back to login; Google login fills the name once.

## Risks

- Changing the landing route touches every auth entry point: a missed one leaves users on `/empresas` (harmless, but inconsistent). The navigation table above is the checklist.
- New dependency `@radix-ui/react-dropdown-menu` (Radix family already in use).
