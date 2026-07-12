# Deploy Alternativo — Render + Supabase

> Hand-maintained, no regenerado por ningún skill. Vive aparte de la config default (Vercel) para poder alternar entre una opción y otra sin pisar nada.

## Por qué existe esta carpeta

El curso que el usuario sigue en paralelo propone configurar Supabase vía la integración nativa Vercel↔Supabase. La cuenta de Vercel del usuario quedó bloqueada (en proceso de recuperación), así que esta carpeta documenta **Render + Supabase** como plan B, sin tocar nada de lo que ya asume Vercel en el resto del repo (`.agents/project.yaml`, skill `/vercel-cli`, etapas 9/12 de `/sprint-development`).

**Ninguna de esas piezas fue modificada.** Esto es documentación paralela — el día que se decida cuál de las dos opciones es la definitiva, ahí sí se actualiza `.agents/project.yaml` y se ajustan los skills.

## Tipo de servicio en Render

- **Web Service** (no Static Site, no Background Worker) — Next.js necesita un proceso Node corriendo (API routes + SSR/ISR).
- **Runtime**: `node` (nativo) — **confirmado (2026-07-07) que todos los native runtimes de Render incluyen el toolkit de Bun**. Render detecta Bun automáticamente si el repo tiene `bun.lock`/`bun.lockb` en la raíz (este repo ya lo tiene). No hace falta el fallback a Docker/`oven/bun` que se dejaba como incierto antes — solo usarlo si en el futuro Render deja de detectar el lockfile correctamente. Versión de Bun fijable con la env var `BUN_VERSION` o un archivo `.bun-version` (default actual: 1.1.0).
- **Build command**: `bun install && bun run build`
- **Start command**: `bun run start`
- **Blueprint**: `render.yaml` en la raíz del repo permite crear el servicio con un click desde el dashboard ("New → Blueprint") en vez de configurar cada campo a mano.
- **Plan**: el free tier de Render "duerme" el servicio tras ~15 min de inactividad → cold start de ~30-60s en el primer request después de dormir. Para demos del curso puede ser aceptable; para uso real conviene plan pago.

## Variables de entorno — configurar a mano en el dashboard de Render

Render **no tiene integración automática con Supabase** (a diferencia de Vercel). Hay que copiar los valores manualmente desde Supabase Dashboard → Settings → API:

| Variable                     | Origen                                              | Cambia vs Vercel? |
| ----------------------------- | ---------------------------------------------------- | ------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`    | Supabase Dashboard → Settings → API                  | No — mismo valor  |
| `SUPABASE_PUBLISHABLE_KEY`    | Supabase Dashboard → Settings → API                  | No — mismo valor  |
| `SUPABASE_SECRET_KEY`         | Supabase Dashboard → Settings → API                  | No — mismo valor  |
| `SUPABASE_JWT_SECRET`         | Supabase Dashboard → Settings → API                  | No — mismo valor  |
| `NEXT_PUBLIC_APP_URL`         | URL pública que Render asigna al servicio             | **Sí** — pasa de `*.vercel.app` a `*.onrender.com` |
| `ATLASSIAN_*`, `TAVILY_API_KEY`, etc. | Iguales que en `.env` local                    | No                 |

`SUPABASE_ACCESS_TOKEN` NO se sube a Render — es solo para el MCP local (control plane de gestión del proyecto), nunca para el runtime de la app.

## Diferencias clave vs el camino Vercel (default del repo)

| Aspecto                        | Vercel                                    | Render                                             |
| ------------------------------- | ------------------------------------------ | --------------------------------------------------- |
| Integración Supabase            | Automática (auto-inyecta env vars)         | Manual (copiar/pegar keys en el dashboard)          |
| Edge Network                    | Global (CDN + Edge Functions)               | Sin edge — el Middleware corre en la única región del servicio |
| ISR (revalidate)                | Soportado, con cache en el edge             | Soportado (Next self-hosted lo maneja), sin cache edge — solo en la instancia |
| Cold starts                     | Prácticamente nulos (serverless warm)      | Free tier: sí, tras inactividad (~30-60s)           |
| Preview deployments por PR      | Incluidos en el plan gratuito              | Requiere plan pago (Preview Environments)           |

## Estado actual

Deploy confirmado en `https://tudeclaracion-staging.onrender.com` (verificado 2026-07-08 — `/login` responde 200 con el HTML renderizado). Registrado como `environments.staging` en `.agents/project.yaml`.

## Volver a Vercel cuando se recupere la cuenta

Supabase es independiente del hosting del frontend — no hay migración de datos. Alcanza con: (1) reconectar el repo en Vercel, (2) recrear las env vars ahí (o restaurar la integración automática), (3) actualizar `NEXT_PUBLIC_APP_URL`. Esta carpeta queda como referencia si en algún momento hay que volver a usar Render.
