# Threat Model — tuDeclaracion

> Documento fundacional, vivo. No es una auditoría externa ni un pentest con explotación real — es una revisión whitebox del código actual (2026-09-22), con cada hallazgo anclado en evidencia (archivo:línea) o marcado explícitamente como "no verificable desde el repo". Se actualiza a medida que se cierran o aparecen ítems — no se reescribe desde cero.
>
> **Por qué existe**: la app procesa RUTs y datos tributarios (IVA, declaraciones DGI) de múltiples clientes por cuenta de contador — dato sensible/regulado, no público (`SRS/12-security.md`). El nivel de exposición a ataques automatizados es real y creciente; este documento prioriza qué atender primero, no todo a la vez.
>
> **Metodología**: revisión de código (rutas, RLS, middleware, parsing, config), `bun audit --prod`. NO incluye: pentest de la DB viva (MCP de Supabase sin token válido al momento de este documento — ver ítem 8), fuzzing, ni test de carga real. Cada "Cómo probarlo" es no-destructivo y pensado para correr contra staging o una cuenta de prueba, nunca contra datos reales de clientes.

## Cómo leer esto

Cada ítem tiene: **Escenario de ataque** (qué haría un atacante) → **Estado** (qué hay hoy, con evidencia) → **Severidad** → **Medida recomendada** → **Cómo probarlo**.

Severidad = impacto realista sobre este sistema puntual (multi-tenant, datos tributarios, sin backoffice público, sin datos de pago), no un CVSS genérico.

---

## 1. Dependencias con RCE crítico conocido (Next.js)

**Escenario de ataque**: un atacante no autenticado explota una vulnerabilidad pública ya parcheada para ejecutar código en el servidor, sin necesidad de credenciales.

**Estado**: `bun audit --prod` confirma Next.js `15.5.20` instalado (`package.json`, resuelto en `node_modules/next/package.json`), dentro del rango vulnerable a dos CVEs críticos con exploit público documentado:
- `GHSA-p293-qw3h-jr36` — RCE no autenticado en Server Actions, servidores Windows.
- `GHSA-2xp9-vwfh-vxw4` — RCE no autenticado en la API de Image Optimization vía archivos AVIF.

Fix disponible en `15.5.21`. Además, `bun audit --prod` reporta 20 vulnerabilidades en dependencias de producción (2 critical, 10 high, 8 moderate): `next`, `postcss` (path traversal / disclosure de `.map` files), `sharp` (CVEs de libvips/libheif heredadas), `nanoid` (integer overflow).

**Severidad**: **Crítica**. Es el único ítem de este documento con exploit público conocido contra código que corre hoy en producción.

**Medida recomendada**: actualizar `next` a `>=15.5.21` dentro del rango `^15` ya declarado en `package.json` (no es un salto de major). Revisar y actualizar `postcss`, `sharp`, `nanoid` en la misma pasada. Agregar `bun audit --prod` al pipeline de CI (falla el build si aparece un `critical` nuevo) para no depender de que alguien lo corra manualmente.

**Cómo probarlo**: `bun audit --prod` después de actualizar — confirmar que baja a 0 critical/high en deps de producción. No se recomienda intentar reproducir el RCE (exploit público, contra sistema propio no aporta nada que el CVE no confirme ya); la prueba es la versión instalada, no la explotación.

---

## 2. Open redirect post-autenticación en `/auth/callback` y `/auth/confirm`

**Escenario de ataque**: un atacante manda un link con apariencia 100% legítima (`https://tudeclaracion.com/auth/confirm?...&next=https://sitio-falso.com`). La víctima hace click, el dominio real de tuDeclaracion establece su sesión real (login/recovery/Google OAuth genuino), y **recién después** la redirige a un sitio atacante — que puede simular "tu sesión expiró, reingresá tu contraseña" con máxima credibilidad, porque el usuario acaba de pasar por el flujo real.

**Estado — confirmado y reproducible**:
- `src/app/auth/callback/route.ts:18,25` — `const next = searchParams.get('next') ?? '/empresas'` seguido de `redirect(next)` tras `exchangeCodeForSession`, sin validar que `next` sea una ruta relativa interna.
- `src/app/auth/confirm/route.ts:18,25` — mismo patrón exacto tras `verifyOtp`.

(Nota aparte, no explotable: `middleware.ts:45` agrega `?redirect=<pathname>` a la URL de `/login`, pero ese parámetro nunca se lee en `login-client.tsx` — código muerto, sin riesgo.)

**Severidad**: **Alta**. Bajo esfuerzo de explotación (es un query param), alto impacto de credibilidad (ocurre justo después de un flujo de auth legítimo).

**Medida recomendada**: validar `next` contra una whitelist de rutas relativas internas antes de redirigir (ej. `next.startsWith('/') && !next.startsWith('//')`, rechazando protocolo-relativo también). Aplicar el mismo chequeo en ambos archivos.

**Cómo probarlo**: en local/staging, iniciar sesión con un link manualmente armado `/auth/confirm?token_hash=<válido>&type=email&next=https://example.com` (o el equivalente de callback con un `code` válido) y confirmar que redirige fuera del dominio. Repetir después del fix y confirmar que rechaza o normaliza el destino.

**✅ Resuelto 2026-10-02**: las dos rutas pasan `next` por `safeInternalPath()` (`src/lib/validation/safe-redirect.ts`), que resuelve el valor contra un origen fijo y solo acepta rutas del mismo origen; si no, cae a `/empresas`. Cubre `https://…`, `//host`, `/\host`, `\\host`, caracteres de control que los navegadores eliminan (`/\t/host`), `javascript:` y rutas no absolutas. Hay 12 casos en `safe-redirect.test.ts`. Los `next` legítimos que usa la app (`/empresas`, `/reset-password`) se mantienen.

---

## 3. Ausencia total de headers de seguridad HTTP

**Escenario de ataque**: sin `X-Frame-Options`/`frame-ancestors`, el sitio es embebible en un `<iframe>` de un dominio atacante para clickjacking (ej. superponer un botón invisible sobre "Descargar declaración" o "Eliminar empresa"). Sin CSP, un XSS futuro (hoy no encontrado, ver ítem 11) tendría impacto máximo en vez de estar contenido.

**Estado**: `next.config.ts` solo define `reactStrictMode: true` — sin `headers()`. `vercel.json` solo `{"framework": "nextjs"}` — sin headers custom. Vercel no agrega estos headers por defecto. Ausencia total confirmada.

**Severidad**: **Media-Alta** (no es explotable por sí sola, pero es la red de contención que falta para cuando aparezca cualquier otra falla).

**Medida recomendada**: agregar `headers()` en `next.config.ts` con, como mínimo: `X-Frame-Options: DENY` (o `Content-Security-Policy: frame-ancestors 'none'`), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Strict-Transport-Security`. Un CSP completo puede iterarse después (requiere mapear todos los orígenes de script/estilo/conexión — Supabase, fonts, etc.) pero los headers simples son de bajo riesgo de romper algo y se pueden hacer ya.

**Cómo probarlo**: `curl -I https://<staging-url>` y verificar los headers presentes, o un scan en securityheaders.com contra staging (no contra producción con datos reales sin avisar).

---

## 4. RPCs sin límite de tamaño de payload (DoS)

**Escenario de ataque**: un usuario autenticado (basta una cuenta gratuita propia) llama directo al RPC de Supabase vía `supabase-js`/REST con un array `jsonb` gigante, sin pasar por el parser ni las validaciones de la UI, causando degradación o timeout en la DB compartida por todos los tenants.

**Estado**: `insertar_asientos` (`supabase/migrations/20260717171500_insertar_asientos_con_periodo.sql:12-48`) y `guardar_mapeo_1376` (`20260901121000_crear_mapeo_1376.sql:60-96`) reciben un array `jsonb` (`p_lineas`/`p_filas`) sin validación de tamaño en el propio RPC — dependen 100% de que el cliente (UI) mande algo razonable.

**Severidad**: **Media**. Requiere estar autenticado (no es anónimo), pero cualquier cuenta self-service alcanza.

**Medida recomendada**: agregar un chequeo `if jsonb_array_length(p_lineas) > <N> then raise exception` al inicio de cada RPC de escritura masiva. `<N>` puede ser generoso (ej. 10.000) — el objetivo es cortar el caso patológico, no restringir el uso normal.

**Cómo probarlo**: desde una cuenta de prueba en staging, llamar el RPC vía `supabase.rpc(...)` con un array de, por ejemplo, 50.000 elementos sintéticos y medir tiempo de respuesta / verificar que no tira la conexión para otros usuarios. No correr contra producción.

---

## 5. `cotizacion_bcu_cache` sin aislamiento por tenant

**Escenario de ataque**: cualquier usuario autenticado (cuenta propia, gratuita) inserta o actualiza una fila con una cotización BCU falsa, que después es consumida por **otros tenants** para calcular declaraciones en dólares — envenenamiento de caché cross-tenant, con impacto directo en el número final declarado ante DGI.

**Estado**: `supabase/migrations/20260724090000_crear_cotizacion_bcu_cache.sql:15-22` — políticas de SELECT/INSERT/UPDATE con `to authenticated using (true)`, sin scoping por `cuenta_id`. Es la única tabla de negocio sin aislamiento por tenant (las otras 7 sí lo tienen, ver ítem 8).

**Severidad**: **Media** (impacto alto si se explota — afecta el número declarado de otro tenant — pero requiere que el atacante entienda el mecanismo de caché, no es un ataque trivial de oportunidad).

**Medida recomendada**: si el diseño intencional es "caché compartido de un dato público" (la cotización BCU es pública, no un secreto), la mitigación correcta no es aislar por tenant sino **restringir la escritura**: solo el propio backend/cron debería poder insertar/actualizar (vía `security definer` con validación, o directamente sacar el INSERT/UPDATE de las políticas de usuarios y hacerlo solo desde un job server-side con service role). El usuario final solo necesita SELECT.

**Cómo probarlo**: con dos cuentas de prueba distintas, desde la cuenta A hacer `supabase.from('cotizacion_bcu_cache').update(...)` sobre una fila existente, y confirmar desde la cuenta B que el valor cambiado se refleja en sus cálculos.

**✅ Resuelto 2026-10-02** (opción "solo escribe el servidor"): la migración `20261002120000_restringir_escritura_cotizacion_bcu_cache.sql` elimina las políticas de INSERT/UPDATE y los usuarios quedan solo con SELECT. La app escribe el caché con `createAdminClient()` (`src/infrastructure/supabase/admin.ts`, clave secreta, solo en servidor), que únicamente usan los 4 call sites del caché BCU. Las Server Actions de `src/modules/cotizacion/actions.ts` ahora chequean la sesión por su cuenta, porque RLS ya no frena a un llamador anónimo. Orden de despliegue: primero `SUPABASE_SECRET_KEY` en Render y el deploy de la app, recién después la migración.

---

## 6. Disclosure de errores crudos de Postgres/Supabase al cliente

**Escenario de ataque**: no es explotación directa, pero cada mensaje de error con nombre de constraint/tabla/columna es información gratis para mapear el schema real y afinar otros ataques (ej. qué RPC probar, qué nombre de tabla usar).

**Estado**: `error.message` se propaga sin sanitizar en al menos 9 archivos (`grep -r "error\.message" src/`), confirmado en `src/app/empresas/[id]/mapeo-1376/mapeo-1376-client.tsx:90` — errores de Postgres no capturados explícitamente (ej. violación de constraint único `23505`) llegan tal cual a la UI, incluyendo nombres internos de constraint/tabla.

**Severidad**: **Media** (disclosure de información, no acceso directo a datos).

**Medida recomendada**: un wrapper único para llamadas a Supabase que mapee códigos de error Postgres conocidos (`23505`, `23503`, etc.) a mensajes de usuario genéricos, y loguee el error crudo solo server-side (o a un servicio de logging), nunca lo mande al cliente tal cual.

**Cómo probarlo**: forzar deliberadamente una violación de constraint único (ej. guardar el mismo mapeo dos veces) y revisar en la Network tab / UI qué texto exacto llega al front.

---

## 7. Sin rate limiting en capa de aplicación

**Escenario de ataque**: fuerza bruta o credential stuffing contra `/login`, o abuso de `/signup`/`/forgot-password` para spam de emails o enumeración de cuentas existentes (si el mensaje de error difiere entre "email no existe" y "contraseña incorrecta").

**Estado**: confirmado sin rate limiting a nivel de `middleware.ts`, `next.config.ts` ni `vercel.json` (grep sin resultados). Depende 100% de los límites internos de Supabase Auth, que no son verificables ni configurables desde este repo.

**Severidad**: **Media** (mitigado parcialmente por lo que sea que haga Supabase Auth por default, pero no verificado ni bajo control del proyecto).

**Medida recomendada**: verificar en el dashboard de Supabase (Authentication → Rate Limits) qué límites hay configurados hoy y si son suficientes para este caso de uso. Si se necesita algo más agresivo o específico (ej. por IP en `/forgot-password` para evitar spam de emails), agregar rate limiting en el middleware (ej. con Upstash Redis o similar, dado que Vercel no persiste estado entre invocaciones serverless).

**Cómo probarlo**: contra una cuenta de prueba en staging, intentar N logins fallidos seguidos y observar si en algún punto Supabase empieza a devolver un error de throttling. Hacerlo con moderación — no contra producción ni de forma repetida, para no gastar cuota de Auth innecesariamente.

---

## 8. Tabla `empresa` fuera del historial de migraciones — RLS no verificable desde el repo

**Escenario de ataque**: si `empresa` (la tabla de la que depende el 100% del aislamiento multi-tenant vía `cuenta_id = auth.uid()` en las otras 7 tablas) tuviera RLS mal configurada o deshabilitada, cualquier usuario autenticado podría leer/escribir empresas de otros contadores.

**Estado**: confirmado que `empresa` **no fue creada en ninguna migración trackeada** — la migración más antigua (`20260712205056`) ya la asume existente, y otra (`20260719073000_validar_formato_rut_empresa.sql`) solo le agrega un constraint. Fue creada fuera del historial versionado. Las otras 8 tablas de negocio sí tienen RLS confirmada línea por línea en migraciones. Esta es la única donde **no se puede confirmar desde el código**, solo desde la DB viva.

**Severidad**: **Alta si está mal configurada, Info si está bien** — es un gap de verificación, no una vulnerabilidad confirmada. Máxima prioridad para cerrar apenas vuelva el acceso al MCP de Supabase.

**Medida recomendada**: (1) apenas se renueve `SUPABASE_ACCESS_TOKEN`, correr contra la DB viva `select rowsecurity from pg_tables where tablename = 'empresa'` y `select * from pg_policies where tablename = 'empresa'`, comparar contra el patrón de las otras 7 tablas. (2) Escribir una migración que documente el estado actual de `empresa` (aunque sea un `-- ya existe, ver migración inicial fuera de tracking` con las políticas actuales) para que quede versionado y no dependa de memoria institucional.

**Cómo probarlo**: el chequeo de arriba es directamente la prueba — no requiere reproducir un ataque, solo leer el catálogo de Postgres.

**✅ Verificado 2026-10-02 contra la DB viva** (proyecto `tudeclaracion`, catálogo `pg_class` + `pg_policies`, solo lectura):

- `empresa`: `relrowsecurity = true`, 4 políticas (`empresa_select_own`, `empresa_insert_own`, `empresa_update_own`, `empresa_delete_own`), todas `cuenta_id = (select auth.uid())`; el UPDATE tiene `USING` + `WITH CHECK` (no se puede reasignar una empresa a otra cuenta). `cuenta_id` es `NOT NULL`. Severidad → **Info**: la medida (1) queda cerrada.
- Hallazgos colaterales del mismo chequeo:
  - `cuenta` tampoco está en ninguna migración trackeada. RLS ok (`select`/`update` solo sobre `id = auth.uid()`, sin INSERT/DELETE para usuarios).
  - Existe 1 función `security definer`: `public.handle_new_user()` (trigger que inserta en `cuenta` al registrarse un usuario), fuera de migraciones. Riesgo bajo: es función de trigger (no invocable vía RPC), cuerpo fijo, `search_path = public` fijado. Mejora opcional: `search_path = ''` para alinearla con el resto (✅ aplicada en `20261002120200_handle_new_user_search_path_vacio.sql`). Corrige lo afirmado en el ítem 11.
  - `data_fields`, `declaration_required_fields`, `declarations`: tablas legacy fuera de migraciones, RLS habilitada sin políticas (deny-all para `anon`/`authenticated`), 0 filas. Sin riesgo; candidatas a borrarse.
  - `cotizacion_bcu_cache` confirmado tal como describe el ítem 5 (INSERT/UPDATE abiertos a cualquier `authenticated`).

**✅ Medida (2) cerrada 2026-10-02**: `supabase/migrations/20260712000000_baseline_cuenta_empresa.sql` versiona `cuenta`, `empresa`, `set_updated_at`, `handle_new_user` y sus triggers tal como existen en la DB viva. Cada sentencia está protegida (no-op en la DB viva, validado con `begin … rollback`). La versión se registró en `supabase_migrations.schema_migrations` sin ejecutar el SQL. Las 3 tablas legacy quedan fuera.

---

## 9. Cookies de sesión de Supabase sin configuración explícita

**Escenario de ataque**: si las cookies `sb-*` no tuvieran `httpOnly`/`secure`/`sameSite` correctos, serían robables vía XSS (mitigado hoy, ver ítem 11) o vulnerables a CSRF/interceptación en tránsito.

**Estado**: la única cookie custom de la app (`empresa_activa_id`, `src/app/empresas/actions.ts:15-21`) sí fija explícito `httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production'`. Las cookies de sesión de Supabase Auth en sí (`sb-*`) no se customizan en ningún lado del código — quedan en manos del default de la librería `@supabase/ssr`. No verificado independientemente contra un navegador real.

**Severidad**: **Baja/Informativo** — `@supabase/ssr` tiene defaults razonables conocidos, pero no está confirmado en este proyecto específico.

**Medida recomendada**: ninguna acción de código necesaria a priori; solo verificar.

**Cómo probarlo**: iniciar sesión en staging, abrir DevTools → Application → Cookies, e inspeccionar los flags (`HttpOnly`, `Secure`, `SameSite`) de las cookies `sb-*`.

---

## 10. Backoffice futuro sin modelo de roles

**Escenario de ataque**: cuando se implemente el backoffice interno (Juan/Matías), si reutiliza el patrón actual de auth (cualquier usuario autenticado = acceso a sus propios datos), sin un gate adicional, **cualquier contador que se registre self-service accedería a rutas de admin**.

**Estado**: `Glob src/app/backoffice/**/*` → 0 archivos, es spec-only (`docs/superpowers/specs/2026-09-16-backoffice-mvp1-design.md`). `SRS/12-security.md:14-15` confirma explícito: "roles múltiples... explícitamente fuera del MVP" — no hay modelo de permisos granular hoy.

**Severidad**: **Informativo hoy** (no hay código, no hay riesgo actual) — pasa a **Crítico** el día que se implemente sin un gate propio.

**Medida recomendada**: cuando se aborde la implementación del backoffice, el gate de acceso no puede ser "usuario autenticado" — necesita algo explícito (ej. una tabla `admin_users` chequeada en middleware, o un claim custom en el JWT). Dejar esto anotado acá para que no se pierda quedando implícito en el spec.

**Cómo probarlo**: N/A hasta que exista código — este ítem es un recordatorio de diseño, no algo testeable hoy.

---

## 11. Controles ya confirmados (para no tocar sin querer)

Documentado para que quede explícito qué SÍ está bien y no hay que "arreglar" por error:

- **RLS habilitada en las 8 tablas trackeadas**, sin gaps — patrón `USING/WITH CHECK` vía join a `cuenta_id = auth.uid()` consistente en todas.
- **Cero RPCs `security definer`** (la única función definer es el trigger `handle_new_user`, ver ítem 8) — todos los RPCs (`crear_empresa_con_plan_cuentas`, `insertar_asientos`, `editar_empresa_con_plan_cuentas`, `guardar_mapeo_1376`) son `security invoker` con `set search_path = ''` — RLS nunca se bypasea vía RPC, y no hay superficie de search-path hijacking.
- **Clave secreta acotada a un solo uso**: desde 2026-10-02 (ítem 5) `SUPABASE_SECRET_KEY` se lee únicamente en `src/infrastructure/supabase/admin.ts`, y solo se usa para el caché público de cotizaciones BCU. Todo acceso a datos de tenants sigue pasando por el cliente RLS-scoped. Nuevo uso de `createAdminClient()` = revisión de seguridad.
- **Cero secrets filtrados vía `NEXT_PUBLIC_`** — solo URL y publishable key son públicas, confirmado y documentado en el propio código (`src/infrastructure/supabase/env.ts`).
- **Sin XSS vía HTML crudo** — cero `dangerouslySetInnerHTML`, `eval`, o `new Function` en todo `src/`.
- **Sin SSRF ni inyección en el fetch de cotización BCU** — endpoint hardcodeado, sin input de usuario en la URL ni en el XML/SOAP.
- **Sin ReDoS en el parser de TXT** — regexes lineales, sin backtracking catastrófico; y el parseo es 100% client-side, así que un TXT malicioso afecta solo al navegador de quien lo sube, no al servidor.
- **Parámetro `redirect` de `middleware.ts` es código muerto** — se agrega a la URL de `/login` pero nunca se lee, sin riesgo real pese a la apariencia.

---

## Próximos pasos sugeridos (orden de prioridad)

1. Actualizar Next.js + deps críticas (ítem 1) — es lo único con exploit público conocido.
2. ~~Fix del open redirect (ítem 2)~~ — ✅ 2026-10-02.
3. ~~Verificar RLS de `empresa` contra la DB viva (ítem 8)~~ — ✅ verificado y versionado 2026-10-02.
4. Headers de seguridad básicos (ítem 3) — bajo riesgo de romper algo, cierra una categoría entera de ataques de un saque.
5. El resto (4, 5, 6, 7, 9) se pueden ir tomando de a uno en sesiones siguientes — ninguno es urgente hoy, pero todos son reales.

Este documento se actualiza in-place a medida que se cierran ítems (marcarlos como resueltos con fecha, no borrarlos — sirve como historial de qué se atendió y cuándo).
