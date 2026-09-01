# Master Design Plan — tuDeclaracion.com

> Generado por `/design-system` (fase opcional de mapeo de pantallas), 2026-07-02. Fuente de las pantallas: `C:\Projects\Personal\Design\` (prototipo HTML/CSS hand-authored por el usuario, copiado a la drop zone de este repo). **No hay `BRIEF.md`** para este batch — las pantallas ya existían antes de esta sesión, no fueron generadas a partir de un brief de este flujo. Provenance: copia directa, ver §4.

## §0 — Engagement rule

Toda historia de usuario con interfaz debe citar su pantalla en el mapa §8 **antes** de codearse. Si una historia UI no tiene fila en §8, no se construye a ciegas — se corre la fase de screen-mapping para esa pantalla primero (`/sprint-development` input #10 gate).

## §1 — Scorecard

| Pantalla | Estado | Notas |
|---|---|---|
| Portada (landing) | mockup listo, sin código | — |
| Acceso (login) | mockup listo, sin código | link "Recuperar acceso" ahora tiene destino — ver §4.6 |
| Selección de empresa | mockup listo, sin código | card "Agregar nueva empresa" agregada; el flujo de alta (TD-8, ahora incluye TD-7) ya tiene mockup — ver §4.4, §4.7. Acción "Ver empresa" por card agregada (batch `company-detail-edit`, pre-backlog) — ver §4.4, §4.9 |
| Agregar nueva empresa (TD-8 + TD-7) | mockup recibido, build diverge del mockup (ver D4) | combina alta de empresa (RUT/nombre) + mapeo fijo de 5 cuentas contables (self-service, revertido 2026-07-12) — ver §4.7 |
| Detalle y edición de empresa (nueva) | mockup recibido, build diverge del mockup (ver D8) | pantalla nueva a la que redirige "Ver empresa" — edita RUT/nombre + tabla de códigos IVA + tabla de Compras Exentas de una empresa existente — ver §4.9. Historia TD-30 creada |
| Dashboard / Panel principal | mockup listo, requiere ajuste | el wizard real de "Iniciar nueva declaración" (US 3.x) NO está mockeado — el botón del prototipo solo dispara un `alert()`; falta agregar el indicador/link de empresa activa en el sidebar (ver §5, D2) |
| Crear cuenta (signup) | mockup listo, sin código | generado just-in-time para TD-4 vía brief (`references/screen-design-brief.md`), Open Design — ver §4.5 |
| Recuperar acceso (forgot/reset password) | mockup recibido, build diverge del mockup (ver D3) | generado just-in-time para TD-9; el mockup trae tokens y composición nuevos no coherentes con el resto del batch — build real usa el shell/tokens ya vivos, mockup solo aporta estados/copy — ver §4.6, §5 D3 |
| Detalle de declaración (TD-20) | mockup recibido, build diverge del mockup (ver D6) | generado just-in-time para TD-20; mismo patrón de divergencia que D3/D4 (tokens y chrome propios) — build real usa el sidebar de `/dashboard` ya vivo, mockup solo aporta los 3 estados + contenido del panel — ver §4.8 |

## §2 — Frozen design contract

La autoridad de tokens es `DESIGN.md` (raíz del repo) — este plan **no duplica valores**, solo referencia:

- Colores: `colors.primary` (#08569A), `colors.background`/`colors.surface`, semánticos `colors.success/warning/error` + sus variantes `*Bg`/`*Text` (ver hallazgo de accesibilidad en `DESIGN.md` §Colors).
- Tipografía: `typography.display/h1/h2/body/body-sm/label/mono` — familia Inter + JetBrains Mono para datos tabulares (RUT, importes).
- Spacing: escala `spacing.xs..2xl` (base 8px).
- Radios: `rounded.sm/md/lg/full`.
- Componentes: `button`/`buttonSecondary`/`buttonGhost`, `input`, `card`, `badge*`, `alert*`, `table`, `nav*`, `divider` — ver `DESIGN.md` §Components.

## §4 — Screen specs

### 4.1 — Portada (landing)

- **Slug**: `landing`
- **Ruta esperada**: `/` (pública, pre-login)
- **Propósito**: presentar el valor del producto y dirigir a login. Superficie de confianza, no de venta agresiva.
- **Provenance**: `.context/designs/tudeclaracion/mvp-core-screens/landing-2.html` (copiado de `C:\Projects\Personal\Design\landing-2.html`, sin `BRIEF.md` — prototipo pre-existente).
- **Historias de usuario**: TD-29 (epic TD-28 "General Features", 2026-08-01) — primera story que la cubre. Sigue siendo superficie de soporte fuera del MVP core (`mvp-scope.md` no tiene épica de "landing/marketing"), no bloquea ninguna US del motor tributario.
- **Contenido observado**: hero con propuesta de valor + CTA único ("Ingresar al sistema"), sección "Criterios de confianza" (3 cards: lectura inmediata, próximo paso obvio, escalable), disclaimer legal ("Herramienta de apoyo. No reemplaza asesoramiento contable ni legal.").
- **Checklist de fidelidad**:
  - [ ] Un solo CTA primario (a login) — no competir con otros botones.
  - [ ] Disclaimer legal visible en el footer.
  - [ ] Responsive: hero pasa a 1 columna bajo 720px (observado en el mockup).

### 4.2 — Acceso (login)

- **Slug**: `login`
- **Ruta esperada**: `/login`
- **Propósito**: autenticación simple, sin fricción, con soporte visible.
- **Provenance**: `.context/designs/tudeclaracion/mvp-core-screens/login.html`, copiado de la misma fuente. Sin `BRIEF.md`.
- **Historias de usuario**: US 1.2 (iniciar sesión) — primaria. US 1.4 (recuperar contraseña) — el link "Recuperar acceso" existe en el mockup, pero **no hay pantalla mockeada para ese flujo todavía** (gap, ver §1).
- **Contenido observado**: layout 2 columnas (panel de intro + formulario), validación inline (ambos campos obligatorios, mensaje de error visible), checkbox "mantener sesión iniciada", link a recuperación, link "¿Primera vez? Creá tu cuenta" (self-service, confirmado por el usuario — ver §5, D1 resuelto).
- **Checklist de fidelidad**:
  - [ ] Labels de formulario siempre visibles (nunca solo placeholder) — coherente con NFR-02/03.
  - [ ] Mensaje de error con guía clara si faltan campos (ya materializado en el mockup: "Revisá los datos ingresados. Ambos campos son obligatorios.").
  - [ ] Objetivos táctiles ≥48px (mockup usa 52px).

### 4.3 — Dashboard / Panel principal

- **Slug**: `dashboard`
- **Ruta esperada**: `/dashboard` (autenticado, empresa activa en contexto)
- **Propósito**: punto de entrada a la operación diaria — iniciar una declaración nueva y ver el estado de las existentes.
- **Provenance**: `.context/designs/tudeclaracion/mvp-core-screens/dashboard.html`, copiado de la misma fuente. Sin `BRIEF.md`.
- **Historias de usuario**: US 3.1 (subir TXT — vía el botón "Iniciar nueva declaración") — primaria pero **el wizard real no está mockeado** (el botón dispara un `alert()` placeholder). US 7.1 / US 7.2 (historial — épica promovida a Must-Have en esta sesión, ver `mvp-scope.md` EPIC-TD-07) — la tabla "Actividad reciente" y el resumen rápido ("Declaraciones en curso", "Pendientes de revisión") ya materializan esto.
- **Gap resuelto (2026-07-05, ver §5 D2)**: el dashboard queda scoped a la empresa activa, elegida en la pantalla "Selección de empresa" previa (post-login). Falta agregar al sidebar un indicador/link con el nombre de la empresa activa que, al clickearse, vuelve a esa pantalla para cambiar de empresa — hoy no está en el mockup, es ajuste pendiente antes de construir la historia.
- **Contenido observado**: sidebar fijo (Inicio / Declaraciones generadas / Ayuda), saludo personalizado ("Hola, Andrea."), card de acción principal (única, con badge "Acción principal"), panel de resumen rápido, tabla de actividad reciente con badges de estado (Validado/Pendiente/Generado). La tabla mezcla clientes distintos (Estudio Rivera, Comercial del Sur, Agro Litoral) sin scoping — a corregir para que muestre solo la empresa activa una vez agregado el selector.
- **Checklist de fidelidad**:
  - [ ] Una sola acción primaria por pantalla ("Crear declaración 2181").
  - [ ] Tabla usa tipografía `mono` para valores tabulares si se agregan RUTs/importes (el mockup actual no los muestra en esta tabla, pero SÍ debería aplicar cuando se agreguen — ver `DESIGN.md` Do's).
  - [ ] Responsive: sidebar colapsa bajo 1080px (observado).
  - [ ] Sidebar incluye indicador de empresa activa (nombre + link/entrada a "Selección de empresa") — pendiente de mockear.
  - [ ] Tabla "Actividad reciente" filtrada a la empresa activa únicamente — el mockup actual muestra multi-cliente sin filtro.

### 4.4 — Selección de empresa

- **Slug**: `company-select` (ruta) — archivo `companySelector.html`
- **Ruta esperada**: `/empresas` (autenticado, entre `login` y `dashboard`)
- **Propósito**: elegir la empresa/cliente activa antes de entrar al dashboard.
- **Provenance**: `.context/designs/tudeclaracion/mvp-core-screens/companySelector.html`, copiado de `C:\Projects\Personal\Design\` (misma fuente externa que el resto del batch), 2026-07-05. Sin `BRIEF.md`.
- **Historias de usuario**: US 2.1 (seleccionar empresa activa) — primaria, cubierta. US 1.3 (alta de empresas/clientes) — cubierta parcialmente, ver nota.
- **Flujo confirmado por el usuario**: tras el login, se muestra este listado de empresas del contador; al seleccionar una, redirige al `dashboard` scoped a esa empresa. Desde el `dashboard`, un indicador/link de empresa activa en el sidebar permite volver acá para cambiar de empresa sin cerrar sesión.
- **Contenido observado**: layout 2 columnas (lista + detalle), buscador por nombre/RUT con contador de resultados, cards de empresa con badge de estado (Operativa/Pendiente) + último movimiento + responsable, panel de detalle con datos de la empresa seleccionada, CTA único "Ingresar al dashboard" (deshabilitado si no hay selección), estado vacío para búsqueda sin resultados. Card final con borde punteado "Agregar nueva empresa" (agregada 2026-07-05 a pedido del usuario) — dispara un `alert()` placeholder, mismo patrón que el wizard de `dashboard.html`; el flujo de alta en sí todavía no está mockeado.
- **Nota**: la card "Agregar nueva empresa" solo abre la puerta a US 1.3 — no resuelve el formulario/flujo de alta, que sigue sin pantalla propia.
- **Actualización (2026-08-05, batch `company-detail-edit`)**: se agrega una acción **"Ver empresa"** por card, independiente de la selección/highlight existente — coexiste con el botón de selección sin reemplazarlo, navega al detalle/edición de esa empresa puntual (§4.9). Provenance: `.context/designs/tudeclaracion/company-detail-edit/empresas-listado-ver-empresa.html`, generado a partir de `.context/designs/tudeclaracion/company-detail-edit/BRIEF.md` (brief just-in-time, modo FOLLOW-UP). Sin historia de Jira todavía — ver §9.
- **Checklist de fidelidad**:
  - [ ] Objetivos táctiles ≥48px en cards de empresa y CTA (mockup usa 52px en botones, cards sin altura mínima explícita — revisar en implementación). **Gap conocido (TD-30, 2026-08-06)**: el link "Ver empresa" se implementó con `Button size="sm"` (32px de alto) — ninguna variante de tamaño existente en `button.tsx` llega a 48px (`sm`=32px, `default`=36px, `lg`=40px). El resto de los CTA de esta pantalla (búsqueda, "Ingresar al dashboard") sí usan `h-[52px]` explícito. Divergencia documentada, no bloqueante para el merge — evaluar si vale un ajuste de tamaño en un pase posterior.
  - [x] RUT en tipografía `mono` (ya materializado en el mockup).
  - [x] Responsive: layout pasa a 1 columna bajo 980px (observado).
  - [x] CTA primario deshabilitado hasta que haya una empresa seleccionada (ya materializado — accesibilidad de estado).
  - [x] "Ver empresa" visualmente distinguible de la acción de selección (implementado como pill separada — `Button variant="secondary"` — sibling del botón de selección, no lo reemplaza; TD-30 PR2, mergeado 2026-08-06).

### 4.5 — Crear cuenta (signup)

- **Slug**: `signup`
- **Ruta esperada**: `/signup` (pública, pre-login)
- **Propósito**: alta de cuenta self-service para un contador, sin intervención de administrador.
- **Provenance**: `.context/designs/tudeclaracion/signup-screen/signup-2.html`, generado en Open Design (mismo proyecto que login/dashboard/company-select) a partir de `.context/designs/tudeclaracion/signup-screen/BRIEF.md` (brief just-in-time, modo FOLLOW-UP, disparado por el gate de `/sprint-development` en TD-4).
- **Nota de nombre de archivo**: el `BRIEF.md` pedía el slug exacto `signup`; el archivo devuelto se llama `signup-2.html`. Se mapea igual — contenido corresponde a la pantalla pedida — pero queda registrado por si se necesita renombrar para consistencia con el resto del batch (`login.html`, `dashboard.html`).
- **Consistencia de tokens**: el mockup usa la misma paleta OKLCH (`--accent: oklch(45% 0.13 252)`, `--bg`, `--border`, etc.) ya establecida en `login.html` — sin tokens nuevos, coherente con el resto del batch.
- **Historias de usuario**: TD-4 / US 1.1 (crear cuenta) — primaria, ahora cubierta.
- **Contenido observado**: layout 2 columnas (panel de intro con contexto + formulario), selector de estado de demo (Vacío / Contraseña débil / Correo duplicado / Verificación pendiente), checklist de requisitos de contraseña con indicadores en vivo (longitud, mayúscula, minúscula, dígito), mensaje de error específico para correo duplicado, panel de éxito que bloquea el formulario y explica que el acceso queda pendiente de verificación por correo, link a login para quien ya tiene cuenta.
- **Checklist de fidelidad**:
  - [ ] Los 4 estados del AC están cubiertos: vacío, contraseña débil (con motivo explícito), correo duplicado (con mensaje específico, sin crear cuenta), verificación pendiente post-submit.
  - [ ] Objetivos táctiles ≥48px (mockup usa 52px, coherente con login/company-select).
  - [ ] Labels de formulario siempre visibles (coherente con NFR-02/03, mismo patrón que `login.html`).
  - [ ] Responsive: layout pasa a 1 columna bajo 860px (observado en el mockup).

### 4.6 — Recuperar acceso (forgot-password / reset-password)

- **Slugs**: `forgot-password`, `reset-password`
- **Rutas esperadas**: `/forgot-password` (pública, pre-login), `/reset-password` (pública, alcanzable solo vía el link del correo de recuperación)
- **Propósito**: recuperación de contraseña self-service vía Supabase Auth, sin intervención de administrador.
- **Provenance**: `.context/designs/tudeclaracion/password-recovery/{forgot-password,reset-password}.html`, generados en Open Design a partir de `.context/designs/tudeclaracion/password-recovery/BRIEF.md` (brief just-in-time, disparado por el gate de `/sprint-development` en TD-9). Ver §5 D3 — el build real diverge del mockup en tokens/composición, no en flujo/estados.
- **Historias de usuario**: TD-9 / US 1.4 (recuperar contraseña) — primaria, ahora cubierta.
- **Contenido tomado del mockup (estados/copy, no tokens)**:
  - `forgot-password`: formulario de un campo (correo) → panel de confirmación "Revisá tu correo" con lista de próximos pasos (estado enviado, acción siguiente, recordatorio de spam) y opción de volver a intentar con otro correo.
  - `reset-password`: formulario de contraseña nueva + confirmar contraseña, con el mismo checklist en vivo de `signup` (reutiliza `password-rules.ts`, no la regla del mockup) → panel de éxito ("Contraseña actualizada", link a login) → panel de error para link vencido/inválido ("Enlace inválido o vencido", CTA "Solicitar nuevo enlace" de vuelta a `forgot-password`).
- **Checklist de fidelidad**:
  - [ ] Construido con el shell de 2 columnas y componentes ya vivos (`Button`/`Input`/`Label`, mismo patrón que `login`/`signup`) — NO con los tokens del mockup (ver D3).
  - [ ] Checklist de contraseña en `reset-password` usa `password-rules.ts` (mínimo 10, incluye Ü) — nunca la regla de 8 caracteres del mockup.
  - [ ] Objetivos táctiles ≥48px, labels siempre visibles — mismo estándar que el resto del batch.
  - [ ] Los 3 escenarios del AC cubiertos: solicitud enviada, reset con token válido, token vencido/inválido con opción de reintentar.

### 4.7 — Agregar nueva empresa (TD-8 + TD-7)

- **Slug**: `company-onboarding`
- **Ruta esperada**: `/empresas/nueva` (autenticado, sin empresa activa todavía — se llega desde la card "Agregar nueva empresa" en `company-select`)
- **Propósito**: alta de una empresa cliente self-service (RUT + nombre) y, en el mismo flujo, carga del mapeo inicial de cuentas contables a conceptos fiscales (self-service, revertido 2026-07-12 — ver `SRS/06-normalizer.md`).
- **Provenance**: `.context/designs/tudeclaracion/company-onboarding/company-onboarding-2.html`, generado en Open Design a partir de `.context/designs/tudeclaracion/company-onboarding/BRIEF.md` (brief just-in-time, disparado por el gate de `/sprint-development` en TD-8/TD-7). Ver §5 D4 — el build real diverge del mockup en tokens/composición (chrome de sidebar tipo dashboard), no en flujo/estados/contenido.
- **Historias de usuario**: TD-8 / US 1.3 (alta de empresa) — primaria. TD-7 / US 2.2 (plan de cuentas) — plegada en el mismo flujo.
- **Contenido tomado del mockup (estados/copy/estructura, no tokens ni chrome)**:
  - Parte A — datos de empresa: RUT + nombre, validación de campos requeridos, error específico de RUT duplicado.
  - Parte B — mapa de cuentas: **catálogo fijo de 5 filas** (IVA Compras 10%/22%, IVA Ventas 10%/22%, Compra Exenta 0% — coincide con el catálogo `CODIGOIVA` confirmado en la sesión de dominio del parser), cada fila con tipo+tasa fijos como etiqueta y un solo campo editable (número de cuenta contable). Las 5 son requeridas.
  - Panel de éxito: confirma creación + resumen (mapa 5/5 completo, próximo paso sugerido).
- **Checklist de fidelidad**:
  - [ ] Construido con el shell ya vivo de `/empresas` (card centrada, sin sidebar) — NO con el chrome de sidebar tipo dashboard del mockup, que no existe todavía en esta parte del flujo (ver D4).
  - [ ] Tokens reales (`DESIGN.md`, `#08569A`), no la paleta del mockup.
  - [ ] Las 5 filas del mapa de cuentas son fijas (tipo/tasa/rubro PADI no editables) — solo el número de cuenta es input.
  - [ ] Los 3 escenarios de TD-8 cubiertos: alta exitosa, RUT duplicado, campos requeridos.

### 4.8 — Detalle de declaración y descarga (TD-20)

- **Slug**: `declaracion-detalle`
- **Ruta esperada**: `/dashboard/declaraciones/[periodo]` (autenticado, alcanzada desde una fila de la tabla "Actividad reciente" en `dashboard`)
- **Propósito**: seguimiento del estado de una declaración 2181 (procesando / generada / con errores) y descarga del archivo PADI cuando está listo.
- **Provenance**: `.context/designs/tudeclaracion/declaracion-detalle/declaracion-detalle-2.html`, generado en Open Design a partir de `.context/designs/tudeclaracion/declaracion-detalle/BRIEF.md` (brief just-in-time, disparado por el gate de `/sprint-development` en TD-20). Ver §5 D6 — el build real diverge del mockup en tokens/chrome, no en flujo/estados/contenido.
- **Historias de usuario**: TD-20 / US 6.1 (descargar archivo PADI) — primaria.
- **Contenido tomado del mockup (estados/copy/estructura, no tokens ni chrome)**:
  - Franja de metadatos: empresa, RUT declarante, tipo de declaración (2181), período.
  - Panel de resultado del procesamiento con 3 estados: **procesando** (badge/hero de advertencia, acción de descarga ausente/deshabilitada), **generada** (badge/hero de éxito, acción de descarga habilitada), **con errores** (hero + alert de error, acción de descarga ausente/deshabilitada, mensaje orientando a corregir el origen y reprocesar).
  - Tarjeta de archivo: nombre siguiendo la convención confirmada (`2181_<RUT>_<período>.txt`), botón "Descargar archivo PADI" (deshabilitado salvo en estado generada), nota aclarando que la presentación ante DGI es un paso manual fuera del sistema.
  - El selector de estados (Procesando/Generada/Con errores) del mockup es solo un artefacto de demo para revisar los 3 estados en un archivo — el build real deriva el estado del backend, no de un toggle.
- **Checklist de fidelidad**:
  - [ ] Construido dentro del shell ya vivo de `/dashboard` (sidebar + indicador de empresa activa) — NO con el topbar independiente del mockup, que no existe en ningún otro punto del flujo autenticado (ver D6).
  - [ ] Tokens reales (`DESIGN.md`, `#08569A` + `success`/`warning`/`error` y sus `*Bg`/`*Text`), no la paleta `oklch` propia del mockup.
  - [ ] Los 3 estados del AC cubiertos: descarga exitosa tras procesar, descarga ausente/deshabilitada mientras procesa o si falló, nombre de archivo con la convención confirmada.
  - [ ] El estado "con errores" no reutiliza el mismo tono visual que "procesando" salvo que sea una decisión consciente — el mockup los diferencia con el hero (`warning` vs `error`) y un alert adicional, no con el badge superior (ambos quedaron `warning`); replicar esa distinción con los tokens reales.

### 4.9 — Detalle y edición de empresa

- **Slug**: `empresa-detalle-edicion`
- **Ruta esperada**: `/empresas/[id]` (autenticado, alcanzada desde el botón "Ver empresa" en `company-select`, §4.4)
- **Propósito**: consultar y editar los datos de una empresa cliente ya existente — nombre, RUT y la parametrización contable de códigos de IVA y Compras Exentas usada para generar declaraciones. No crea una empresa nueva (eso sigue siendo `company-onboarding`, §4.7).
- **Provenance**: `.context/designs/tudeclaracion/company-detail-edit/empresa-detalle-edicion.html`, generado a partir de `.context/designs/tudeclaracion/company-detail-edit/BRIEF.md` (brief just-in-time, modo FOLLOW-UP — mismo proyecto de herramienta de diseño que el resto del batch). Slug del archivo coincide exactamente con el pedido en el brief, sin rename.
- **Historias de usuario**: sin historia de Jira todavía (pre-backlog) — ver nota en §9. Cubre funcionalmente la edición de los mismos datos que TD-8/US 1.3 crea (§4.7).
- **Contenido observado**:
  - Datos generales: "Nombre de empresa" y "RUT (12 dígitos, `mono`)", ambos precargados con el valor de la empresa.
  - Tabla "Códigos de formato rápido de IVA": columnas Código IVA (0–9), Cuenta contable, Línea PADI (`mono`); filas agregables/quitables, precargadas con la configuración vigente de la empresa.
  - Tabla "Compras Exentas": columna Cuenta contable + badge fijo "Línea 504"; filas agregables/quitables. El mockup no cubre el estado vacío de esta tabla cuando una empresa no tiene filas cargadas — gap a decidir en la construcción.
  - Botones: "Guardar cambios" (primario) y "Volver sin guardar" (vuelve al listado sin persistir).
  - Señales de "empresa existente, no nueva": eyebrow "Edición de empresa existente", lead explícito ("Esta pantalla no crea una empresa nueva..."), badge "Empresa existente" junto a "Datos generales", campos siempre precargados (nunca vacíos).
  - Estados: edición en curso (limpia banners al tipear), error de validación ("Revisá los datos antes de guardar." — RUT inválido o filas de IVA/exentas incompletas), guardado exitoso ("Cambios guardados correctamente."), error de guardado por RUT duplicado ("Ya existe otra empresa en esta cuenta con el RUT {rut}.").
- **Nota dev-side**: hoy no existe RPC de edición — solo `crear_empresa_con_plan_cuentas` (creación). Se necesita un RPC nuevo (o extender el existente) antes de implementar esta historia.
- **Checklist de fidelidad**:
  - [x] Construido con el shell/chrome ya vivo de `/empresas` — NO con el topbar independiente del mockup (mismo patrón que D4/D6, ver D8). Confirmado: `empresa-detalle-client.tsx` reutiliza el layout de card centrada ya vivo, sin topbar propio.
  - [x] Tokens reales (`DESIGN.md`, `#08569A` + semánticos `success/warning/error`), no la paleta `oklch` propia del mockup (ver D8). Confirmado en el código (`bg-success-bg`/`text-error-text`/etc.).
  - [x] Badge "Empresa existente" usa un tono neutral/informativo en el build real — implementado como `Badge variant="outline"` (no existe una variante `info` dedicada en `badge.tsx`; `outline` es la más cercana sin connotación de advertencia — decisión documentada en el plan de implementación de TD-30, no `warning` como el mockup).
  - [x] Los 4 escenarios cubiertos: precarga de datos existentes, error de validación, guardado exitoso, RUT duplicado. Verificados en vivo (Playwright) contra la DB de staging, TD-30 PR1 (mergeado 2026-08-06).
  - [x] Estado vacío de la tabla "Compras Exentas" (y también IVA) definido: copy "Todavía no hay ... cargados para esta empresa." — verificado en vivo con una empresa de 0 filas.

| # | Pantalla | Divergencia | Ratificada por | Razón |
|---|---|---|---|---|
| D1 | Login | Nota original "¿Primera vez? Contactá al administrador del estudio" sugería que el alta de cuenta (US 1.1) podría NO ser self-service | **Ratificado 2026-07-05** | Usuario confirmó que el alta de cuenta ES self-service, tal como asume `mvp-scope.md`. El mockup estaba desactualizado — corregido a "¿Primera vez? Creá tu cuenta". No requiere cambios en PRD/SRS. |
| D2 | Dashboard | No hay selector/alta de empresa visible (US 1.3, US 2.1) | **Ratificado 2026-07-05** | Usuario definió el flujo: tras el login se muestra un listado de empresas (pantalla nueva, `company-select`, §4.4); al elegir una, redirige al `dashboard` scoped a esa empresa. El dashboard suma un indicador/link de empresa activa en el sidebar para volver al listado y cambiar de empresa. Falta mockear `company-select` y ajustar `dashboard.html` (ver checklist §4.3). |
| D3 | Recuperar acceso (forgot/reset password) | El mockup recibido para TD-9 trae tokens propios (`--primary: #1E40AF` vs. el `#08569A` congelado en `DESIGN.md`) y una composición nueva (panel de "trust" con badge eyebrow + 3 tarjetas con ícono) ausente en el resto del batch. Además, las reglas de fortaleza de contraseña del demo JS del mockup (mínimo 8 caracteres, sin Ü) no coinciden con `src/lib/validation/password-rules.ts` (mínimo 10, con Ü), ya construido y testeado para `signup`. | **Ratificado 2026-07-12** | Usuario confirmó construir con Live-UI-First: reutilizar el shell de 2 columnas y los componentes ya vivos (`login`/`signup`), tomando del mockup solo los estados/flujo/copy (panel "revisá tu correo" con próximos pasos, panel de link vencido con CTA de reenvío, campo de confirmar contraseña) — nunca los tokens ni la regla de contraseña del mockup, que sigue siempre `password-rules.ts`. |
| D4 | Agregar nueva empresa (TD-8 + TD-7) | El mockup recibido trae, otra vez, tokens propios (`--primary: #1E40AF`) distintos del `#08569A` congelado, y además un chrome completo de sidebar tipo dashboard (nav Inicio/Empresas/Declaraciones/Ayuda, header con usuario) que no existe todavía en `/empresas` (hoy es una card centrada sin sidebar) ni coincide 1:1 con el sidebar ya construido en `src/app/dashboard/page.tsx` (paleta e iconografía distintas). | **Ratificado 2026-07-12 (mismo patrón que D3)** | Build real usa el shell simple ya vivo de `/empresas` (sin sidebar) — introducir el chrome del mockup sería construir un patrón de navegación nuevo, no establecido, en un punto del flujo (pre-selección de empresa) donde todavía no aplica un "sidebar de dashboard". Se toma del mockup solo el contenido del formulario (Parte A + Parte B) y los estados (éxito, RUT duplicado, campos requeridos). |
| D5 | Dashboard — modal "Importar asiento" (TD-11) | El wizard de carga del TXT (US 3.x) nunca tuvo mockup — hoy el botón "Iniciar nueva declaración" dispara un placeholder de texto (`dashboard/page.tsx`). No hay diseño de referencia para el modal de import. | **Ratificado 2026-07-14** | Usuario confirmó build spec-only sin mockup: modal con dos vías equivalentes para aportar el archivo — explorador de archivos (input nativo) o arrastrar y soltar sobre el área del modal. Reutiliza los tokens/componentes ya vivos (Button, Card, bordes) vía el primitivo `dialog` de shadcn (primer uso en el repo). No cubre la carga real al backend (TD-12/TD-13, fuera de alcance de esta historia). |
| D7 | Dashboard — confirmación de carga (TD-12) | El estado de confirmación post-carga (nombre de archivo + timestamp, distinto visualmente del estado de error) nunca tuvo mockup — es una extensión del mismo modal "Importar asiento" que D5 ya dejó spec-only. | **Ratificado 2026-07-17 (mismo patrón que D5)** | Usuario confirmó build spec-only: agrega un estado de confirmación dentro del mismo `ImportarAsientoDialog`, reutilizando sus tokens/componentes (Card, badge de éxito). No requiere pantalla ni mockup propio — es contenido nuevo sobre un shell ya ratificado. |
| D6 | Detalle de declaración (TD-20) | El mockup recibido trae, otra vez, una paleta propia (variables `oklch` custom — `--accent: oklch(45% 0.13 252)`, `--success`/`--warning`/`--error` propios) en vez del `#08569A` congelado y los tokens semánticos de `DESIGN.md`, y un topbar independiente (marca + link "Volver") en vez del sidebar ya vivo de `/dashboard` (con indicador de empresa activa) — no existe ningún otro punto del flujo autenticado con ese chrome de topbar suelto. | **Ratificado 2026-07-17 (mismo patrón que D3/D4)** | Build real usa el shell de `/dashboard` ya vivo (sidebar + empresa activa) como chrome envolvente — el mockup solo aporta el contenido del panel de estado/descarga (3 estados, tarjeta de archivo, copy) y los tokens reales de `DESIGN.md`. El selector de estados del mockup (Procesando/Generada/Con errores) es un artefacto de demo, no un control de producción — el estado real viene del backend. |
| D8 | Ver empresa (§4.4) + Detalle y edición de empresa (§4.9) | Los dos mockups del batch `company-detail-edit` traen, otra vez, la misma paleta propia `oklch` (`--accent: oklch(45% 0.13 252)`, `--bg`/`--surface`/`--fg`/`--muted`/`--border` custom, `--success`/`--warning`/`--error` mezclados con `color-mix()`) en vez de los tokens `DESIGN.md`, y un topbar independiente (marca + link) en vez del shell real de `/empresas`. Radio (`12px`) y sombras sí coinciden con la escala congelada. | **Ratificado 2026-08-05 (mismo patrón que D3/D4/D6)** | Build real usa los tokens y el shell/chrome ya vivos de `/empresas` — el mockup solo aporta estructura, copy y estados (validación, guardado exitoso, RUT duplicado). Badge "Empresa existente" del mockup usa `warning`; en el build real conviene un tono neutral/informativo. |
| D9 | Configuración de columnas especiales pre-subida (TD-31, ADR-0005) | La pantalla de checklist de columnas especiales (12 obligatorias siempre habilitadas + 9 especiales opcionales) nunca tuvo mockup — no existía cuando se mockeó el batch `dashboard`/`ImportarAsientoDialog` (D5/D7). | **Ratificado 2026-08-08 (mismo patrón que D5/D7)** | Usuario confirmó build spec-only: extiende `ImportarAsientoDialog` (mismo componente que D5/D7) con un paso de configuración condicional — se muestra solo cuando la cantidad de campos del archivo no matchea el modelo clásico (11/12), bloqueando el botón de subir hasta completarlo. Reutiliza tokens/componentes ya vivos (Checkbox, Button, Card) vía el primitivo `dialog` de shadcn ya en uso desde D5. No requiere pantalla ni mockup propio. |
| D10 | Mapeo 1376 — matriz cuenta ↔ código de línea (TD-38) | La pantalla `mapeo-1376-config` tiene `BRIEF.md` pero nunca se llevó a Claude Design — no hay bundle de mockup. Además, la contadora (Rosana) redefinió el modelo en la sesión del 2026-09-01: filas fijas manejadas por el catálogo de códigos de línea (el contador engancha una cuenta a cada código, biyectivo), en vez del modelo del BRIEF de "agregar una fila por cuenta". | **Ratificado 2026-09-01 (mismo patrón que D5/D7/D9)** | Build spec-only sin mockup: reutiliza el patrón de tabla editable ya vivo de `empresa-detalle-client.tsx` (TD-30) — `selectClassName`, `Input`/`Button`/`Label`/`Badge`, 3 banners de guardado, tokens `DESIGN.md`. Nueva ruta `/empresas/[id]/mapeo-1376`. El catálogo de líneas es una tabla de datos configurable (`codigo_linea_1376`), sembrada provisoriamente con 10 códigos del diseño del usuario hasta que llegue el catálogo real de DGI. |

## §8 — US → Screen map

| Historia | Pantalla primaria | Notas |
|---|---|---|
| US 1.1 — crear cuenta | `signup` | Mockup listo — ver §4.5 |
| US 1.2 — iniciar sesión | `login` | — |
| US 1.3 — alta de empresas/clientes | `company-onboarding` | Mockup listo — ver §4.7 |
| US 1.4 — recuperar contraseña | `forgot-password` / `reset-password` | Mockup recibido, build diverge en tokens (ratificado) — ver §4.6, §5 D3 |
| US 2.1 — seleccionar empresa activa | `company-select` | Mockup listo — ver §4.4 |
| US 2.2 — plan de cuentas cargado | `company-onboarding` | **Revertido 2026-07-12** — ahora self-service, plegado en el flujo de alta de empresa (TD-8) — ver §4.7 |
| US 3.1 — subir TXT | `dashboard` | Modal "Importar asiento" (TD-11) — spec-only build ratificado, ver §5 D5 |
| US 3.2 — interpretación automática | — | Sin superficie propia (proceso transparente) |
| US 3.3 — confirmación de carga | `dashboard` | Modal "Importar asiento" (TD-12) — spec-only build ratificado, ver §5 D7 |
| US 4.1 — normalización automática | — | Sin superficie propia (proceso transparente) |
| US 4.2 — validación de RUTs/importes | — | Sin mockup del estado de error en contexto real (existe el patrón `alert.error` en `design-system.html`, no una pantalla completa) |
| US 4.3 — guía clara ante error | — | Mismo caso que US 4.2 |
| US 5.1 / US 5.2 / US 5.3 — motor tributario | — | Proceso transparente, sin superficie propia |
| US 6.1 — descargar archivo PADI | `declaracion-detalle` | Mockup recibido, build diverge en tokens/chrome (ratificado) — ver §4.8, §5 D6 |
| US 6.2 — flujo completo <5 min | — | Cross-cutting, no una pantalla |
| US 7.1 — listado de declaraciones | `dashboard` | Tabla "Actividad reciente" |
| US 7.2 — estado de cada declaración | `dashboard` | Badges de estado en la misma tabla |
| TD-29 — landing pública | `landing` | Mockup listo — ver §4.1. Épica TD-28 "General Features" (fuera del backbone de motor tributario) |
| TD-30 — ver y editar empresa existente | `company-select` (entrada "Ver empresa") / `empresa-detalle-edicion` (pantalla) | Mockup listo — ver §4.4, §4.9. Épica TD-28 "General Features" |
| TD-31 — declarar columnas especiales del TXT antes de subir | `dashboard` | Paso condicional dentro de `ImportarAsientoDialog` (TD-11/TD-12) — spec-only build ratificado, ver §5 D9 |
| TD-38 — definir la matriz cuenta ↔ código de línea del 1376 | `mapeo-1376-config` (nueva ruta `/empresas/[id]/mapeo-1376`) | Spec-only build ratificado, sin bundle de mockup — reutiliza el patrón de tabla editable de `empresa-detalle-client` (TD-30), ver §5 D10. Épica TD-34 "1376 Account Mapping" (MVP 2 Track A) |

## §9 — Maintenance

- **Historia creada (2026-08-05)**: TD-30 cubre §4.4 (actualización "Ver empresa") y §4.9 (Detalle y edición de empresa) — ver fila en §8.
- **Historia creada (2026-08-08)**: TD-31 cubre D9 (paso de configuración de columnas especiales, extiende `ImportarAsientoDialog`) — ver fila en §8.
- **Historia en curso (2026-09-01)**: TD-38 (MVP 2 Track A, épica TD-34) cubre D10 (`mapeo-1376-config`, spec-only, reutiliza el patrón de tabla editable de TD-30) — ver fila en §8. Spec redefinido con la contadora la misma sesión: catálogo `codigo_linea_1376` maneja las filas, mapeo biyectivo cuenta ↔ código, columna de importe `Total`/`IVA` por fila.
- **Re-run incremental**: cuando se diseñe el wizard de carga (US 3.x), el flujo de error (US 4.2/4.3), la pantalla de recuperación de contraseña (US 1.4) o el selector/alta de empresa (US 1.3/2.1), correr de nuevo esta fase — genera un `BRIEF.md` nuevo por batch si no hay mockup, o mapea directamente si el usuario ya lo tiene (como en esta sesión).
- **UPSERT, nunca wipe**: agregar filas a §4/§8 y entradas a §5 — no reescribir desde cero.
- **No mapeadas intencionalmente**: `design-system.html` (consumido íntegramente en `DESIGN.md`, no es una pantalla de producto), `index.html` y `tudeclaracion-sistema-base.html` (páginas de resumen/pitch del prototipo, contenido idéntico entre ambas, no son rutas reales de la app — quedan en la drop zone como referencia pero sin fila propia acá).
- **Link roto detectado en la fuente**: `index.html`/`tudeclaracion-sistema-base.html` linkean a `landing-page.html`, pero el archivo real es `landing-2.html` — no corregido (la fuente vive fuera de este repo, en `C:\Projects\Personal\Design\`).
