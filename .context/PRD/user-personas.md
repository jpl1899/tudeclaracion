# User Personas — tuDeclaracion.com

> Los datos demográficos específicos (nombre, edad exacta, ciudad) son **ilustrativos** — no provienen de investigación de usuarios real, son una composición razonable a partir de lo confirmado en `business-model.md` (rango etario 22-65, contador que gestiona múltiples clientes, conocimientos informáticos básicos). Goals, pain points y tech savviness sí están anclados en hechos del brief/conversación. Validar con el usuario antes de tratar esta persona como definitiva.

## Persona 1 — Contador (principal)

**Nombre ficticio**: Rosana Ferreira
**Descripción para imagen**: mujer de unos 45 años, contadora pública, trabajando en un escritorio con dos monitores — uno con una planilla de cálculo, en una oficina de estudio contable pequeño en Uruguay.

### Demographics
- **Edad**: dentro del rango 22-65 confirmado en el brief (ilustrativo: ~45 años)
- **Ocupación**: Contadora Pública, gestiona la DJ 2181 de varios estudios/empresas cliente desde una sola cuenta (multi-tenant, confirmado)
- **Ubicación**: Uruguay (ciudad no especificada en el brief)
- **Nivel educativo**: universitario (Contador Público) — inferido de la ocupación, no un dato explícito del brief

### Goals
1. Presentar la DJ 2181 de cada uno de sus clientes en tiempo y forma ante DGI.
2. Minimizar el tiempo operativo dedicado a tareas mecánicas (armado manual del archivo) para dedicarlo a asesoría de mayor valor.
3. Evitar errores en la presentación que puedan generar observaciones de DGI.
4. Gestionar varios clientes/empresas sin mezclar datos entre ellos.

### Pain Points
1. El armado manual del archivo compatible con PADI es repetitivo y consume tiempo por cada cliente.
2. El proceso manual es propenso a errores humanos en una tarea con implicancia regulatoria.
3. Cuantos más clientes atiende, más tiempo absoluto insume la tarea — no escala.
4. Las herramientas actuales (planillas, procesos ad hoc) no fueron pensadas específicamente para este flujo.

### Tech Savviness
- **Nivel**: Mainstream / básico — el brief especifica explícitamente "conocimientos informáticos básicos" como criterio de diseño de la interfaz, dentro de un público de 22-65 años con "niveles de alfabetización digital heterogéneos".
- Usa el software contable Memory y herramientas ofimáticas estándar (planillas de cálculo). No se puede asumir familiaridad con herramientas técnicas.

### Quote representativa
> "Necesito que esto sea rápido y simple — no tengo tiempo para aprender una herramienta complicada solo para armar un archivo que ya sé cómo tiene que quedar."

---

## Persona 2 — Usuario sin contador (secundario)

> **Persona thin** — el brief solo menciona este segmento como "personas que necesiten generar declaraciones juradas conforme a los requisitos de DGI, sin pasar necesariamente por un contador". No hay datos demográficos, goals ni pain points específicos más allá de eso. No fabricar detalle adicional — completar cuando el usuario lo confirme.

### Lo único confirmado
- Genera su propia DJ 2181 sin intermediario profesional.
- Presumiblemente comparte el mismo requisito de "conocimientos informáticos básicos" del segmento principal, pero esto no está confirmado explícitamente para este segundo segmento.

### Pendiente de confirmar
- Demographics, goals, pain points, tech savviness.
- Si accede a las mismas features que el contador (ej. multi-tenancy no aplicaría — es una sola persona gestionando su propia declaración) o a un subconjunto distinto.
