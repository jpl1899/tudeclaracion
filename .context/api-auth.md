# API Authentication — tuDeclaracion

## Métodos de Autenticación

- Supabase Auth, email + password, self-service (US 1.1) — sin invitación de admin, sin roles múltiples (`SRS/12-security.md`).
- Sesión basada en cookies (`sb-*`), gestionadas por `@supabase/ssr`. No hay JWT manual ni headers `Authorization` custom en esta fase.
- Flujo: `signUp` (pendiente de UI, ver `.context/backend-setup.md` § Próximos Pasos) → trigger `on_auth_user_created` crea `public.cuenta` → `signInWithPassword` en `/login` → cookies de sesión → `middleware.ts` refresca la sesión en cada request.

## Para Desarrolladores

### Acceder al usuario autenticado

**Server Components / Route Handlers / Server Actions:**

```ts
import { createClient } from '@/infrastructure/supabase/server';

const supabase = await createClient(); // await — cookies() es async en Next 15
const { data: { user } } = await supabase.auth.getUser();
```

**Client Components:**

```ts
import { createClient } from '@/infrastructure/supabase/client';

const supabase = createClient();
const { data: { user } } = await supabase.auth.getUser();
```

Usar siempre `getUser()` para decisiones de autorización (revalida el token contra Supabase Auth) — nunca `getSession()` para ese propósito (solo lee la cookie local, no valida el JWT).

### Proteger rutas

`middleware.ts` (raíz) ya protege `/empresas` y `/dashboard` — redirige a `/login?redirect=<path>` si no hay usuario. Agregar una ruta nueva a la lista `PROTECTED_ROUTES` en ese archivo cuando se cree una página que requiera sesión.

Autorización a nivel de dato (multi-tenant): nunca se filtra manualmente por `cuenta_id` en el código de aplicación — **RLS lo hace en la base de datos**. Toda query a `empresa` (o futuras tablas con `cuenta_id`) devuelve automáticamente solo las filas del usuario autenticado. Si una query necesita ver datos de otra cuenta, eso es un bug de diseño, no un caso a resolver con lógica de aplicación.

### Estado de auth en componentes cliente

Este scaffold no incluye un `AuthContext` (no existía uno mock que refactorizar, a diferencia del template genérico de `/project-bootstrap`). Componentes cliente que necesiten el usuario actual deben llamar `createClient().auth.getUser()` o suscribirse a `onAuthStateChange` directamente. Si aparece la necesidad de compartir estado de auth entre múltiples componentes cliente, extraer un context en ese momento (YAGNI — no se creó preventivamente).

## Para QA / Testing

### Autenticación al probar manualmente

- Login vía la UI web (`/login`) — las cookies de sesión se setean automáticamente en el browser.
- Para inspeccionar: DevTools → Application → Cookies → buscar cookies `sb-*`.
- No hay flujo de API pública/Postman documentado en esta fase — todas las rutas son páginas Next.js (Server Components), no hay `route handlers` bajo `src/app/api/` todavía.

### Crear un usuario de prueba

No hay seed data de usuarios (ver `.context/backend-setup.md` § Próximos Pasos — `cuenta.id` es FK a `auth.users`, no se puede insertar por SQL sin pasar por Supabase Auth). Crear un usuario real vía `/login` → "Creá tu cuenta" (placeholder, pendiente de implementar) o, temporalmente, desde el Supabase Dashboard → Authentication → Add user.

## Consideraciones de Seguridad

- RLS habilitado y con políticas explícitas en `cuenta` y `empresa` (aislamiento por `cuenta_id = auth.uid()`).
- `SUPABASE_SECRET_KEY` nunca se importa en código de `src/` — solo lo usa el Supabase MCP server (`.mcp.json`) fuera del runtime de la aplicación.
- La función `handle_new_user()` (`SECURITY DEFINER`) tiene `EXECUTE` revocado para `anon`/`authenticated` — no es invocable vía PostgREST RPC, solo se dispara como trigger de `auth.users`.
