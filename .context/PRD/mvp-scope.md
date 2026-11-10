# MVP Scope — tuDeclaracion.com

> Épicas derivadas del pipeline confirmado en `ADR-0001-modular-reusable-tax-platform.md` y de las decisiones de producto (multi-tenancy en MVP, carga self-service del plan de cuentas — revertido 2026-07-12, ver nota en EPIC-TD-02 — error + guía clara). Alcance funcional del MVP: **únicamente Declaración Jurada 2181** (`business-model.md`) — la reutilización a futuros formularios es una decisión de arquitectura, no de scope de este release.
>
> **MVP 2 (desde 2026-08-27)**: la sección `## MVP 2 — Track A: Formulario 1376` al final de este documento agrega el segundo formulario DGI. MVP 1 (todo lo de abajo hasta "Success Criteria") queda tal cual — se construyó y está en staging.

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

---

# MVP 2 — Track A: Formulario 1376

> Agregado 2026-08-27. Segundo formulario DGI, primera concreción del ítem "nuevos formularios más allá del 2181" de `future-roadmap.md`. Alcance de esta pasada: **únicamente la DJ 1376 + su vínculo con la 2181 ya existente**. Los formularios de retenciones 1146 (IRPF) y 1246 (IRNR) quedan explícitamente fuera y diferidos. Track B de MVP 2 (13 mejoras UI/lógica + página de Ayuda del 2181) NO está acá — va directo a `/product-management`.
>
> Fuente: 2 páginas DGI sobre el 1376, `DJ 1376.xlsx` (marco teórico + diseño del motor, del usuario), y un archivo PADI de ejemplo real (`CODIGO;MONTO`, solo totales). Detalle consolidado en el brief de la sesión de foundation.

## Qué es la DJ 1376

Declaración jurada **mensual** de contribuyentes **CEDE y Grandes Contribuyentes** (períodos ≥ 10/2021). Declara las obligaciones del mes de **IVA** (impuesto 545) y los **anticipos** de IRAE, IPAT (Patrimonio), ICOSA e IRPF por retiro de utilidades (entidades unipersonales). Reemplazó al formulario 2176. Se confecciona en la aplicación PADI, y la **2181 es su anexo obligatorio** de compras y ventas.

## Diferencia con la 2181 (define el diseño del motor)

| | 2181 (MVP 1) | 1376 (MVP 2 Track A) |
|---|---|---|
| Unidad de la línea | por RUT (cada línea lleva RUT + total) | por **cuenta contable** — sin apertura de RUT |
| Naturaleza | informativa | liquidación (obligaciones del mes) |
| Motor | mapeo concepto → casilla + consolidación por RUT+código | **agregación**: saldo por cuenta (Debe − Haber) → GROUP BY código de línea → totales |
| Entrada | TXT mensual de Memory | **el mismo TXT** de Memory (sin fuente nueva) |
| Salida | archivo PADI de líneas por RUT | archivo de texto `CODIGO;MONTO`, un renglón por código, montos enteros, solo totales |

## In Scope (Must Have)

### EPIC-M2-01 — Configuración del mapeo 1376 (matriz cuenta → código de línea)
- US M2.1: Como contador, quiero definir por empresa qué cuenta contable corresponde a cada código de línea del 1376 y si se toma por el Debe o por el Haber, para que el motor totalice automáticamente.
- US M2.2: Como contador, quiero mantener ese mapeo (editarlo) cuando cambie el plan de cuentas de la empresa.
- US M2.3: Como contador, quiero partir de un mapeo base sugerido en vez de armarlo de cero. *(a validar — depende de tener un catálogo de líneas 1376 confirmado)*

### EPIC-M2-02 — Generación de la DJ 1376
- US M2.4: Como contador, quiero subir el TXT mensual de Memory (el mismo que uso para la 2181) y que el sistema calcule los totales por código de línea del 1376.
- US M2.5: Como contador, quiero que el sistema agregue el saldo de cada cuenta (Debe − Haber) y lo lleve al código de línea 1376 que configuré.
- US M2.6: Como contador, quiero revisar los totales calculados (IVA ventas, IVA compras, anticipos, etc.) antes de descargar.
- US M2.7: Como contador, quiero descargar el archivo `CODIGO;MONTO` listo para importar en PADI.

### EPIC-M2-03 — Paquete mensual: 1376 + anexo 2181
- US M2.8: Como contador, quiero generar la 2181 y la 1376 de un mismo cliente y período de forma vinculada, porque la 2181 es anexo obligatorio de la 1376.
- US M2.9: Como contador, quiero ver en el historial ambas declaraciones del período juntas, con su estado.

### EPIC-M2-04 — Validaciones propias del 1376
- US M2.10: Como contador, quiero que el sistema me avise si una cuenta con movimiento en el TXT no está mapeada a ningún código de línea del 1376, para no presentar totales incompletos.
- US M2.11: Como contador, quiero un mensaje claro con guía cuando algo del 1376 no cierra (mismo criterio de UX que la 2181).

## Out of Scope (MVP 2 Track A)

- **Formulario 1146** (retenciones de IRPF – responsables por rentas Cat. I y trabajadores independientes) — diferido 2026-08-27.
- **Formulario 1246** (retenciones de IRNR – responsables; corre en Sigma, no PADI) — diferido 2026-08-27.
- Otros formularios conexos del grupo CEDE/GC (1144, 2183, 1050, 3107, 1474, 1379).
- Track B de MVP 2 (13 mejoras + página de Ayuda del 2181) — va por `/product-management`, no por foundation.

## Pendiente de confirmar (no fabricar — `[PLACEHOLDER]` en SRS y `open-questions.md`)

- **Catálogo real de líneas del 1376 por rubro** — DGI lo publica en imágenes; los códigos del ejemplo (101/201/301/302/501/502/510/601) son del diseño del usuario, sin validar contra DGI. La contadora aportará ejemplos reales procesados en PADI.
- **¿El motor determina la liquidación / el impuesto a pagar (líneas 322/970/971/972, boleto 2908), o solo entrega totales por código de línea?** Hoy el ejemplo es solo totales — confirmar si el alcance llega a la determinación.
- **Dato de ventas/compras acumuladas del ejercicio** que pide el Panel 1 — el TXT mensual no lo trae. Fuente sin definir.
- **Selección de código "según tipo de contribuyente/sector"** (IRAE 108/126/128, IPAT 328/320/323, Sobretasa 335/330/333) — regla desconocida.
- **Casos especiales** — DJ sin movimiento, giro agropecuario (líneas 33/36/54), IVA en Suspenso, chatarra/residuos: ¿entran en MVP 2 o no?
- Fixtures de prueba: TXT reales ya procesados en PADI para la 1376 → resultado esperado (pendiente contadora).

## Success Criteria (MVP 2 Track A)

- Un contador puede generar el archivo `CODIGO;MONTO` de la 1376 de un cliente a partir del mismo TXT de Memory que usa para la 2181, sin totalizar cuentas a mano.
- El sistema avisa toda cuenta con movimiento que quedó fuera del mapeo antes de permitir la descarga.
- La 2181 y la 1376 de un mismo período quedan vinculadas y visibles juntas en el historial.
- Mismo pilar de UX que MVP 1: todo error llega con guía clara de cómo resolverlo.
