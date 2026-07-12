# ADR-0002 — Auth email delivery via Supabase Send Email Hook + Resend

- **Status:** Accepted
- **Date:** 2026-07-12
- **Deciders:** Usuario (product owner de tuDeclaracion.com)
- **Tags:** authentication, email, cross-cutting-invariant, infrastructure
- **Supersedes:** —
- **Superseded by:** —

---

## Context

TD-4 (signup) y TD-9 (password recovery) dependen de que Supabase Auth envíe correos transaccionales (verificación de cuenta, reset de contraseña). El mailer por defecto de Supabase está pensado solo para pruebas — rate-limited y no apto para producción (confirmado vía la documentación oficial de Supabase). El usuario ya usa Resend como proveedor de email transaccional en otro proyecto propio (el curso de Testing con IA, UPEX) y pidió replicar ese mismo patrón acá en lugar de conformarse con SMTP genérico.

El usuario tiene cuenta en Resend (`jplmontevideo@gmail.com`) pero **todavía no tiene un dominio propio verificado** — hoy solo puede enviar en modo sandbox, restringido al correo de su propia cuenta. Esto no bloquea construir la integración, pero sí limita las pruebas end-to-end a esa única casilla hasta que se verifique un dominio (`tuDeclaracion.com`, ya declarado en `.agents/project.yaml`).

## Decision

Los correos de Auth (confirmación de signup, recuperación de contraseña, y cualquier otro que Supabase Auth dispare a futuro) se envían vía un **Supabase Auth "Send Email" Hook** que invoca una **Supabase Edge Function** (`supabase/functions/send-email/`), la cual renderiza el contenido y lo entrega a través de la **API de Resend** (`resend.emails.send()`), no vía SMTP genérico ni el mailer por defecto de Supabase.

**Invariante**: ningún flujo de Auth debe volver a depender del mailer por defecto de Supabase una vez este hook esté activo — toda plantilla de correo vive en la Edge Function, no en el Dashboard de Supabase (los templates del Dashboard dejan de usarse para el *contenido*, pero sus URLs de `{{ .SiteURL }}/auth/confirm?...` documentadas en TD-4/TD-9 siguen siendo la fuente de los links, pasadas como `token_hash`/`type`/`redirect_to` al hook).

**Secretos requeridos**: `RESEND_API_KEY` (ya placeholder en `.env.example`) y `SEND_EMAIL_HOOK_SECRET` (generado por Supabase al activar el hook) — ambos se configuran como Edge Function secrets (`supabase secrets set`), nunca en el código.

## Consequences

- **Positive:** control total sobre el contenido/branding del correo (no atado a los templates limitados del Dashboard de Supabase); mismo patrón que el usuario ya usa y entiende de otro proyecto; desbloquea envío en volumen real una vez haya dominio verificado.
- **Negative / trade-offs:** introduce una superficie de despliegue nueva (Supabase Edge Functions, CLI de Supabase) que no existía en el repo hasta ahora; un secreto más para gestionar (`SEND_EMAIL_HOOK_SECRET`); hasta que exista un dominio verificado en Resend, las pruebas reales quedan limitadas al correo de la cuenta del usuario.
- **Neutral / follow-ups:** verificar un dominio en Resend (`tuDeclaracion.com`) es trabajo pendiente fuera de este repo, sin fecha comprometida — no bloquea el desarrollo de la función, sí bloquea probar el flujo con destinatarios reales de contadores externos.

## Alternatives considered

- **SMTP personalizado de Resend en el Dashboard de Supabase (sin Edge Function)** — más simple (config pura, cero código), pero mantiene el contenido de los correos atado a los templates del Dashboard de Supabase, con menos control de branding. Rechazado porque el usuario pidió explícitamente el mismo patrón que usa en el otro proyecto (Auth Hook + Edge Function).
- **Mailer por defecto de Supabase** — rechazado: no apto para producción por rate limits, ya documentado como Risk 3 en el plan de TD-4.

## References

- `.context/PBI/epics/EPIC-TD-2-accountant-identity-tenancy/stories/STORY-TD-4-signup-create-a-self-service-accountant-account/comments.md` — Dependencies (config de email templates de Supabase, ahora superseded en contenido por este ADR, vigente en URLs).
- `.context/PBI/epics/EPIC-TD-2-accountant-identity-tenancy/stories/STORY-TD-9-password-recovery-reset-a-forgotten-password/` — mismo dependency, flujo de recovery.
- Supabase docs (vía Context7, `supabase/supabase`): Auth Send Email Hook + Resend Edge Function recipe.
