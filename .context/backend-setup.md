# Backend Setup — tuDeclaracion

> Fase 1 (`/project-bootstrap` — Backend) ejecutada sobre un frontend ya scaffoldeado (Fase 2 completada antes por deviation aprobada). Supabase project ya existía (`kqrleobwemscldkfissh`) — no se creó, solo se conectó.

## Database Schema

### `public.cuenta`

Una fila por usuario humano autenticado. **`id` es el mismo `auth.users.id`** (no un uuid independiente) — modela directamente la regla de negocio "1 usuario humano = 1 cuenta de contador" (`SRS/12-security.md`), sin necesidad de una columna `owner_user_id` separada ni de sincronizar dos identificadores.

| Columna      | Tipo        | Notas                                      |
| ------------ | ----------- | ------------------------------------------- |
| `id`         | uuid PK     | FK → `auth.users(id)` on delete cascade     |
| `email`      | text        | copiado desde `auth.users` al signup        |
| `nombre`     | text, null  | opcional, editable luego                    |
| `created_at` | timestamptz | default `now()`                             |
| `updated_at` | timestamptz | auto-actualizado por trigger                |

Se crea automáticamente vía trigger `on_auth_user_created` (función `handle_new_user()`, `SECURITY DEFINER`) cada vez que Supabase Auth inserta una fila en `auth.users` — cubre US 1.1 (alta self-service) sin código de aplicación adicional. La función tiene `EXECUTE` revocado para `anon`/`authenticated` (no debe poder invocarse manualmente vía PostgREST RPC).

### `public.empresa`

N filas por cuenta (`1 Cuenta → N Empresas`, `SRS/04-domain-model.md`) — FK simple, sin tabla intermedia (confirmado: una empresa nunca se comparte entre cuentas).

| Columna            | Tipo        | Notas                                                   |
| ------------------ | ----------- | -------------------------------------------------------- |
| `id`                | uuid PK     | default `gen_random_uuid()`                              |
| `cuenta_id`         | uuid FK     | → `cuenta(id)` on delete cascade                         |
| `nombre`            | text        | not null                                                  |
| `rut`               | text        | not null; unique junto con `cuenta_id`                   |
| `estado`            | text        | check `IN ('Operativa', 'Pendiente')`, default `Pendiente` |
| `responsable`       | text, null  |                                                            |
| `ultimo_movimiento` | text, null  | texto libre — reemplazar por una vista sobre `declaraciones` cuando ese módulo exista |
| `created_at` / `updated_at` | timestamptz | igual que `cuenta`                                |

Shape elegida para calzar 1:1 con lo que `src/app/empresas/empresas-client.tsx` ya renderiza (nombre, RUT, estado, responsable, último movimiento) — cero cambios de UI al conectar datos reales.

Índices: `idx_empresa_cuenta_id` (FK), `idx_empresa_rut` y `idx_empresa_nombre` (columnas que el selector de empresas filtra/busca).

### Tablas preexistentes (fuera de este alcance)

El proyecto Supabase **ya tenía** `public.declarations`, `public.data_fields` y `public.declaration_required_fields` (RLS habilitado, sin políticas, 0 filas) antes de esta fase — no fueron creadas ni modificadas acá. Parecen un scaffold temprano del Tax Rules Engine / catálogo de formularios (`ADR-0001`). No se tocaron por estar fuera del alcance de esta fase (solo `cuenta`/`empresa`); quedan con RLS habilitado y sin políticas (== inaccesibles hasta que se diseñen explícitamente).

## Row Level Security

Aislamiento de tenant por `cuenta_id`, no por rol (`SRS/12-security.md` — no hay roles múltiples en el MVP):

- `cuenta`: `SELECT`/`UPDATE` solo si `id = (select auth.uid())`. Sin política de `INSERT` para roles de usuario — solo el trigger `SECURITY DEFINER` inserta filas.
- `empresa`: `SELECT`/`INSERT`/`UPDATE`/`DELETE` solo si `cuenta_id = (select auth.uid())`.

Las políticas envuelven `auth.uid()` en `(select ...)` — evaluación una vez por query, no una vez por fila (recomendación de rendimiento de Supabase, ver advisor `auth_rls_initplan`).

## Authentication

- Provider: Supabase Auth, email + password, self-service (US 1.1).
- Sesión: cookies gestionadas por `@supabase/ssr` (browser: `createBrowserClient`; server: `createServerClient` con `cookies()` async de Next 15).
- `middleware.ts` (raíz del repo) refresca la sesión en cada request vía `supabase.auth.getUser()` (revalida el token contra Supabase Auth — no usa `getSession()`, que solo lee la cookie local sin validar) y protege `/empresas` y `/dashboard`; redirige usuarios autenticados fuera de `/login`.
- No existe todavía una página de signup dedicada — `src/app/login/page.tsx` solo llama `signInWithPassword`. El link "Creá tu cuenta" sigue siendo un placeholder (`href="#"`) hasta que esa story se implemente.

## API Layer

Archivos creados bajo `src/infrastructure/supabase/` (no `src/lib/supabase/`, ver ADR-0001 — `infrastructure/` es la capa que separa detalles técnicos/DB del dominio):

- `env.ts` — validación de env vars requeridas, acceso estático a `process.env.NEXT_PUBLIC_*` (Next.js las reemplaza en build time; un lookup dinámico no funciona en el bundle del browser).
- `client.ts` — `createClient()` para Client Components (browser).
- `server.ts` — `createClient()` async para Server Components / Route Handlers (Next 15 requiere `await cookies()`).

Tipos generados: `src/types/supabase.ts` (via Supabase MCP `generate_typescript_types` — regenerar con el mismo tool cada vez que cambie el schema).

## Variables de Entorno

Este repo usa las keys NEW-STYLE de Supabase (publishable/secret), no las legacy anon/service_role. Detalle completo en `.env.example`. Cambio introducido en esta fase:

- Se agregó `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (mismo valor que `SUPABASE_PUBLISHABLE_KEY`) porque Next.js **solo** inyecta al bundle del browser las vars con prefijo `NEXT_PUBLIC_*` — la var sin prefijo sigue existiendo porque `.mcp.json` la lee para el MCP server de Supabase. Mantener ambas en sync manualmente si la key rota.
- `SUPABASE_SECRET_KEY` no se usa en código de aplicación en esta fase (no hay admin client) — solo lo consume el Supabase MCP server fuera de banda.

Validación en boot: `src/infrastructure/supabase/env.ts` lanza un error descriptivo si `NEXT_PUBLIC_SUPABASE_URL` o `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` faltan.

## Comandos Útiles

Ver `package.json` para la lista completa (Critical Rule #10 — no la dupliques de memoria). Relevantes a este setup: `bun run build`, `bun run types:check`, `bun run lint:check`.

Regenerar tipos tras un cambio de schema: usar el Supabase MCP tool `generate_typescript_types` (no `supabase gen types` CLI — este repo no usa Supabase CLI local, todo pasa por MCP).

## Troubleshooting

- **`Missing required environment variable`** al arrancar `next dev`/`next build` → falta `NEXT_PUBLIC_SUPABASE_URL` o `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` en `.env`. Copiar de `.env.example` y completar.
- **Usuario ve 0 empresas después de loguearse** → esperado en un signup nuevo (no hay seed data, ver "Próximos Pasos"). No es un bug — `src/app/empresas/empresas-client.tsx` ya maneja el estado vacío.
- **Cambios en `.env` no se reflejan** → limpiar caché de Next: `rm -rf .next` y volver a correr `bun run dev`.

## Próximos Pasos

- No se insertó seed data de `cuenta`/`empresa`: `cuenta.id` es FK a `auth.users(id)`, y no existe un mecanismo seguro vía MCP para crear usuarios de `auth.users` sin pasar por el flujo real de Supabase Auth (insertar directo por SQL rompería el modelo de auth). El primer signup real vía la UI crea la primera `cuenta` automáticamente (trigger); las primeras `empresa` se cargan con US 1.3 (todavía no implementada — el botón "Agregar nueva empresa" es un placeholder).
- Página de signup dedicada (US 1.1 UI) — pendiente.
- Recuperación de contraseña (US 1.4) — pendiente, link placeholder en el mockup.
- `ultimo_movimiento` en `empresa` es texto libre por ahora; migrar a una vista/consulta sobre `declaraciones` cuando ese módulo exista (EPIC-TD-07).
