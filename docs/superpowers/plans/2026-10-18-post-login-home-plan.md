# Post-login home — implementation plan

Spec: `docs/superpowers/specs/2026-10-18-post-login-home-design.md`. One branch (`feat/post-login-home`) off `staging`, one PR. Each step ends with its `verify:`.

## Step 1 — Pure helpers + tests (TDD)

- `src/modules/inicio/resumen-inicio.ts`: `construirResumenInicio({ nombre, empresas, pendientes })` → `{ saludo, resumen }` (`resumen` is `null` when counts are unavailable); `iniciales(nombre)`.
- `src/modules/inicio/resumen-inicio.test.ts`: name / no name / blank name, 0 / 1 / n companies, 0 / 1 / n pending, counts unavailable; initials for two words, one word, empty, extra spaces.
- verify: `bun run test` green with the new cases.

## Step 2 — Dropdown primitive

- `bun add @radix-ui/react-dropdown-menu`.
- `src/components/ui/dropdown-menu.tsx`: shadcn-style wrapper (Root, Trigger, Content, Label, Item, Separator) using existing tokens.
- verify: `bun run types:check` clean.

## Step 3 — Sign out + user menu

- `src/app/auth/actions.ts` (`'use server'`): `salir()` — `signOut()`, delete `EMPRESA_ACTIVA_COOKIE`, `redirect('/login')`; logs and continues on sign-out error.
- `src/components/auth/user-menu.tsx` (client): loads `{ nombre, email }` via browser client; trigger = initials circle (48px target) or `User` icon; items Mi cuenta → `/cuenta`, Ayuda → `/dashboard/ayuda`, Salir → form posting to `salir`.
- verify: types + lint clean.

## Step 4 — `/inicio`

- `src/app/inicio/page.tsx` (server): `getUser` guard; parallel queries — `cuenta.nombre`, `empresa` count, `declaracion` count with `estado = 'abierta'`, `resolverEmpresaActiva(cookie)`; count errors → `console.error` + `resumen: null`.
- Layout per spec: header (logo + `UserMenu`), greeting, summary, "Continuar donde quedaste" card (only with active company, RUT in mono), 3 action `Link` cards (lucide `Building2`, `Plus`, `CircleHelp`), "Crear empresa" highlighted with 0 companies; 1 column below `md`.
- verify: types + lint clean.

## Step 5 — `/cuenta`

- `src/app/cuenta/page.tsx` (server): guard, loads `cuenta.nombre` + email.
- `src/app/cuenta/cuenta-client.tsx`: section "Perfil" — Nombre input (trim, max 80, empty allowed → `null`), email read-only, save via browser client `update` on `cuenta` where `id = user.id`; success / error banners (fixed Spanish copy, raw error to console). Header with logo link to `/inicio` + `UserMenu`.
- verify: types + lint clean.

## Step 6 — Google name on login

- `src/app/auth/callback/route.ts`: after a successful exchange, read `cuenta.nombre`; if null and `user_metadata.full_name ?? user_metadata.name` is a non-empty string, update it. Failures are logged and never block the redirect.
- verify: types clean.

## Step 7 — Ayuda without active company + shell changes

- `DashboardShell`: `empresaNombre?: string`; absent → "Elegir empresa" link to `/empresas`; logo wrapped in `Link` to `/inicio`; `UserMenu` added to the sidebar header.
- `src/app/dashboard/ayuda/page.tsx`: drop the `/empresas` redirect; pass `empresaActiva?.nombre`.
- verify: types + lint clean.

## Step 8 — Landing route switch

- `/inicio` and `/cuenta` added to `PROTECTED_ROUTES` (`middleware.ts`); authenticated-on-auth-route redirect → `/inicio`.
- `login-client.tsx` push → `/inicio`; `auth/callback` and `auth/confirm` fallback → `/inicio`; signup `emailRedirectTo` `next=/inicio`.
- `/empresas` header: "Inicio" link + `UserMenu`.
- verify: `rg -n "'/empresas'" middleware.ts src/app/auth src/app/login src/app/signup` shows no post-login fallbacks left.

## Step 9 — Design plan + quality gate

- `.context/design/master-design-plan.md`: §5 spec-only divergence entry (Inicio, Mi cuenta, user menu); §8 rows pointing to the spec.
- verify: `bun run test`, `bun run types:check`, `bun run lint:check` all clean.

## Step 10 — Browser check (local dev)

- Login → `/inicio`; each card navigates; "Continuar" only with an active company; Ayuda without active company shows "Elegir empresa"; Mi cuenta saves a name → greeting + initials update; Salir → `/login`, then `/inicio` redirects to login; mobile width stacks cards.
- verify: all of the above observed; then commit (feat + docs), push, PR to `staging` after user OK.
