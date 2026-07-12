# MVP Scope — tuDeclaracion.com

> Épicas derivadas del pipeline confirmado en `ADR-0001-modular-reusable-tax-platform.md` y de las decisiones de producto (multi-tenancy en MVP, carga self-service del plan de cuentas — revertido 2026-07-12, ver nota en EPIC-TD-02 — error + guía clara). Alcance funcional del MVP: **únicamente Declaración Jurada 2181** (`business-model.md`) — la reutilización a futuros formularios es una decisión de arquitectura, no de scope de este release.

## In Scope (Must Have)

### EPIC-TD-01 — Autenticación y Cuenta de Contador
- US 1.1: Como contador, quiero crear una cuenta para acceder a la plataforma.
- US 1.2: Como contador, quiero iniciar sesión con mis credenciales para acceder a mis empresas/clientes.
- US 1.3: Como contador, quiero dar de alta múltiples empresas/clientes bajo mi cuenta, para gestionar sus declaraciones desde un solo lugar.
- US 1.4: Como contador, quiero recuperar mi contraseña si la olvido. *(estándar de la industria, no mencionado explícitamente en el brief — propuesta razonable a validar)*

### EPIC-TD-02 — Configuración de Empresa
- US 2.1: Como contador, quiero seleccionar la empresa/cliente activa antes de subir un archivo, para asegurarme de que la declaración se genera para el RUT correcto.
- US 2.2: Como contador, quiero cargar el plan de cuentas de cada empresa yo mismo al dar de alta esa empresa (self-service, como parte del flujo de US 1.3), para que el sistema pueda mapear sus cuentas a conceptos fiscales. *(revertido 2026-07-12 — antes era "carga manual/asistida sin autoconfiguración"; ver `SRS/06-normalizer.md` y TD-7/TD-8)*

### EPIC-TD-03 — Carga y Procesamiento del Archivo TXT
- US 3.1: Como contador, quiero subir el TXT mensual exportado de Memory, para iniciar la generación de la declaración.
- US 3.2: Como contador, quiero que el sistema interprete automáticamente el archivo sin que yo tenga que editarlo manualmente.
- US 3.3: Como contador, quiero recibir una confirmación de que el archivo se cargó correctamente antes de que continúe el procesamiento.

### EPIC-TD-04 — Normalización y Validación
- US 4.1: Como contador, quiero que el sistema mapee automáticamente mis cuentas contables a conceptos fiscales usando el plan de cuentas configurado.
- US 4.2: Como contador, quiero que el sistema valide los RUTs y los importes antes de generar la declaración, para evitar errores en la presentación ante DGI.
- US 4.3: Como contador, quiero recibir un mensaje claro y con indicaciones de cómo resolverlo cuando algo falla en la validación, en vez de un error genérico. *(confirmado como requisito de MVP)*

### EPIC-TD-05 — Motor de Reglas Tributarias y Generación DJ 2181
- US 5.1: Como contador, quiero que el sistema aplique automáticamente las reglas tributarias vigentes para determinar en qué línea/código PADI corresponde cada concepto.
- US 5.2: Como contador, quiero que el sistema calcule el importe correcto (IVA o compra exenta) para cada línea de la declaración.
- US 5.3: Como responsable del producto, quiero que las reglas tributarias sean configurables (en base de datos, no hardcodeadas), para poder actualizarlas cuando cambie la normativa DGI sin modificar código.

### EPIC-TD-06 — Exportación del Archivo PADI
- US 6.1: Como contador, quiero descargar el archivo TXT generado, compatible con PADI, para importarlo directamente en el sistema de DGI.
- US 6.2: Como contador, quiero completar todo el proceso (desde la carga del TXT hasta la descarga del archivo PADI) en menos de 5 minutos.

### EPIC-TD-07 — Historial y Gestión de Declaraciones
> Promovida a Must-Have (2026-07-02): estaba como candidata sin confirmar, pero el mockup real de `dashboard.html` (`.context/designs/tudeclaracion/mvp-core-screens/`) ya la construye como parte del flujo principal (sección "Declaraciones generadas" + tabla de actividad reciente) — el usuario confirmó que se incluye en el MVP.
- US 7.1: Como contador, quiero ver un listado de declaraciones generadas por cliente/período, para encontrar rápidamente un archivo ya generado.
- US 7.2: Como contador, quiero ver el estado de cada declaración (validado / pendiente / generado), para saber qué necesita mi atención.

## Out of Scope (para v2+)

Detalle y motivación de cada uno en `future-roadmap.md`.

- Soporte a formularios DGI más allá del 2181 (la arquitectura ya lo contempla, `ADR-0001`, pero no se construye en el MVP).
- Remediación automática/asistida de errores de validación (autocorrección, wizard guiado).
- Roles múltiples dentro de una cuenta de contador.
- Niveles de suscripción / pricing diferenciado.

## Success Criteria

- Un contador puede pasar de TXT de Memory a archivo PADI válido en menos de 5 minutos.
- El archivo generado es aceptado por PADI sin errores para la DJ 2181.
- La interfaz es usable por alguien con conocimientos informáticos básicos, sin entrenamiento previo.
- Una cuenta de contador puede gestionar más de una empresa/cliente sin mezclar datos entre ellas.
- Todo error de validación llega al usuario acompañado de una guía clara de cómo resolverlo.
