# 12 — Security

> Estado: **modelo de auth/autorización confirmado**. Cifrado, retención y regulatorio siguen pendientes (no bloquean bootstrap).

## Confirmado

- **Multi-tenant, dentro del MVP** (no es un "a futuro"): una cuenta de contador gestiona **múltiples clientes/empresas**. Cada empresa tiene su propio RUT, plan de cuentas y declaraciones — ver `04-domain-model.md` (entidad "Empresa/Cliente" bajo una cuenta de contador).
- Esto exige **aislamiento de datos entre empresas/clientes** dentro de una misma cuenta desde el MVP — no es un requisito diferible.
- El sistema procesa **RUTs** y **datos tributarios** (importes de IVA, declaraciones ante DGI) — datos sensibles/regulados, no datos públicos.

### Modelo de autenticación y autorización (confirmado 2026-07-05)

- **Alta de cuenta**: self-service, email + contraseña (ver `PRD/mvp-scope.md` US 1.1, `design/master-design-plan.md` D1). No hay alta por invitación de un admin.
- **Un usuario humano = una cuenta de contador**. Roles múltiples / usuarios adicionales dentro de una misma cuenta están **explícitamente fuera del MVP** (ver `PRD/mvp-scope.md`, `PRD/future-roadmap.md`) — no hay modelo de permisos granular que diseñar ahora.
- **Autorización = aislamiento por tenant**, no por rol: un usuario autenticado solo puede leer/escribir Empresas cuyo `cuenta_id` sea el suyo (relación 1 Cuenta → N Empresas, `04-domain-model.md`). No existe otro nivel de permisos en el MVP.
- **Sesión**: soporta "mantener sesión iniciada" (ver mockup `login.html`) — mecanismo exacto (cookie de sesión vs. JWT + refresh token, tiempo de expiración) se decide en `/project-bootstrap` junto con el framework/DB elegidos, no es una decisión de arquitectura de negocio.
- **Recuperación de contraseña**: US 1.4, flujo confirmado en el PRD, pantalla todavía sin mockear.

## Pendiente de confirmar (no bloquea bootstrap)

- Requisitos regulatorios específicos de Uruguay para el manejo de estos datos (si existen, más allá de DGI/PADI).
- Política de retención de los TXT de entrada/salida.
- Cifrado en tránsito/reposo — a definir junto con la elección de stack (ej. si el proveedor de DB ya lo garantiza por defecto).

No fabricar requisitos de seguridad — se completan con el usuario y la elección de stack.
