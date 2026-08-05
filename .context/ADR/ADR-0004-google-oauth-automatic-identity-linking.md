# ADR-0004 — Login con Google vía Supabase Auth, con linking automático por email

- **Status:** Proposed
- **Date:** 2026-07-31
- **Deciders:** Usuario (product owner de tuDeclaracion.com)
- **Tags:** authentication, identity, cross-cutting-invariant
- **Supersedes:** —
- **Superseded by:** —

---

## Context

tuDeclaracion hoy solo soporta login vía email/password (Supabase Auth). Como parte del track de trabajo no-contable (páginas pendientes, landing, IA de navegación), el usuario pidió sumar login con Google en `/login` y `/signup`, siguiendo un patrón tipo GitHub — proveedor social y form de credenciales conviviendo en la misma pantalla, sin fricción extra al crear cuenta.

Antes de decidir el approach se investigó el modelo de datos real (no se asumió nada):

- Existe un trigger `handle_new_user()` sobre `auth.users` que inserta la fila correspondiente en `public.cuenta (id, email)` para **cualquier** proveedor de auth, sin distinción. El provisioning de cuenta no vive en el código de la app (no está atado al formulario de `/signup`).
- Se confirmó contra la documentación oficial de Supabase (vía Context7) que el comportamiento **default** de "Automatic linking" fusiona identidades que comparten el mismo email **verificado** en un único `auth.users` / `cuenta.id`. "Manual linking" es una feature aparte, deshabilitada por default, y no aplica a este caso.
- No existe hoy una ruta de callback OAuth. El único endpoint de exchange de sesión es `/auth/confirm`, exclusivo del flujo PKCE de OTP por email (signup, recovery — TD-4/TD-9).

## Decision

Se agrega Google como proveedor OAuth de Supabase Auth, apoyándose en el comportamiento default de linking automático por email verificado — **no** se habilita manual linking. El botón "Continuar con Google" aparece en `/login` y `/signup`, junto al form de email/password existente. Se agrega una ruta nueva `/auth/callback` para el exchange de código PKCE del flujo OAuth, separada de `/auth/confirm` (que queda exclusiva del flujo OTP de email).

**Invariante**: cualquier proveedor de auth que se sume a futuro debe apoyarse en el mismo trigger `handle_new_user()` para el provisioning de `cuenta`. No se debe duplicar lógica de creación de cuenta en el código de la aplicación por proveedor.

## Consequences

- **Positive:** cero código adicional de provisioning de cuenta (ya cubierto por el trigger existente); cero riesgo de cuentas duplicadas para un contador que ya tenía email/password y pasa a usar Google (linking automático, mismo `cuenta.id`, sus empresas no se pierden); reduce la fricción de alta que motivó el pedido original.
- **Negative / trade-offs:** nueva superficie de configuración externa a este repo (Google Cloud OAuth Client — el usuario debe generarla manualmente en Google Cloud Console) y nuevos secretos a gestionar (`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`) en `.env` y en la config de Supabase; el linking automático depende de que el email que entrega Google llegue verificado — si algún contador tiene un email de Google no verificado, Supabase no lo linkea automáticamente y queda como cuenta separada (edge case a validar en implementación, no bloquea esta decisión).
- **Neutral / follow-ups:** el banner de recomendación de activar verificación en 2 pasos en la cuenta de Google (mostrado en cada login vía Google, dismiss por sesión) es UX pura — no altera el modelo de auth, se resuelve en la implementación de la story, no ameritó ADR aparte.

## Alternatives considered

- **Manual linking habilitado** — rechazado: agrega un paso de confirmación extra sin necesidad real, dado que el caso de uso (mismo contador, mismo email) ya lo resuelve el linking automático por default.
- **Cuentas completamente separadas por proveedor (sin linking)** — rechazado: un contador que ya tiene empresas cargadas con su cuenta de email/password perdería la continuidad de sus datos si loguea con Google después con el mismo email.

## References

- `.context/design/master-design-plan.md` §4.1 (landing), §4.2 (login), §4.5 (signup).
- Supabase docs (vía Context7, `supabase/supabase`): Identity linking strategies — Automatic linking.
- Verificación directa contra la base (Supabase MCP): función/trigger `handle_new_user()` sobre `auth.users`, tabla `public.cuenta`.
