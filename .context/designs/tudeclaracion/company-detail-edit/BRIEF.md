# Design brief — tuDeclaracion / company-detail-edit
Tool session: CONTINUE project "tuDeclaracion screens" — mode FOLLOW-UP

## Mission
Design 2 screens for tuDeclaracion, un SaaS de generación de declaraciones juradas DGI para
contadores. Describimos QUÉ debe lograr cada pantalla; el CÓMO se ve es tu decisión — layout,
composición, jerarquía, elección de componentes y micro-interacciones quedan totalmente
delegados a vos. Tu único límite duro es el contrato de diseño de abajo: nunca inventes colores,
tipografías o spacing fuera de él.
Cuando termines, exportá y devolvé los archivos como se indica en "Export & return".

## Product context
_(FOLLOW-UP — omitido; el proyecto ya conoce el producto.)_

## Frozen design contract (non-negotiable)
Mismo sistema de diseño que las pantallas anteriores de este proyecto (landing, selector de
empresas, alta de empresa) — mantené consistencia visual total con ellas. Los tokens ya
establecidos en `DESIGN.md` siguen gobernando.

## Screens requested

### 1. empresas-listado-ver-empresa — Listado de empresas (agregar acción "Ver empresa")
- Route: `/empresas`
- Purpose: pantalla existente donde el contador elige la empresa activa antes de entrar al
  dashboard. Se agrega una acción nueva por card, independiente de la selección.
- User stories: sin historia de Jira todavía (pre-backlog) — intención funcional descripta abajo.
- El usuario debe poder:
  - Seguir seleccionando una empresa de la lista para "Ingresar al dashboard" (comportamiento
    existente, no se modifica).
  - Además, por cada empresa listada, acceder a su detalle sin necesidad de seleccionarla como
    activa ni entrar al dashboard. El texto del botón/acción es **"Ver empresa"**.
  - Al usar "Ver empresa", navegar a la pantalla de detalle/edición de esa empresa puntual.
  - Distinguir claramente esta acción ("ver detalle") de la acción de selección ("entrar con esta
    empresa") — son dos intenciones distintas y no deberían confundirse.
- States the ACs demand: mismo listado ya soportado hoy — vacío (sin empresas), filtrado sin
  resultados, N empresas. No hay estados nuevos; solo se agrega la acción "Ver empresa" a cada
  card existente.
- Viewport: desktop-first (contexto actual es desktop), responsive deseable.

### 2. empresa-detalle-edicion — Detalle y edición de empresa
- Route: nueva, ej. `/empresas/[id]`
- Purpose: pantalla a la que redirige "Ver empresa" — permite ver y editar los datos de una
  empresa que ya existe (no crea una nueva).
- User stories: sin historia de Jira todavía (pre-backlog) — intención funcional descripta abajo.
- El usuario debe poder:
  - Ver los datos actuales de la empresa: RUT (12 dígitos), nombre.
  - Ver y editar la tabla de "Códigos de formato rápido de IVA" — cada fila vincula un código de
    IVA (0 a 9) con una cuenta contable y un código de línea PADI; el usuario puede agregar,
    editar y quitar filas.
  - Ver y editar la tabla de "Compras Exentas" — cada fila es una cuenta contable que se declara
    en la línea PADI 504; el usuario puede agregar, editar y quitar filas.
  - Guardar los cambios hechos a la empresa.
  - Volver al listado de empresas sin guardar, si se arrepiente.
  - Recibir confirmación de que los cambios se guardaron correctamente, o un mensaje claro si algo
    falló (por ejemplo, un RUT duplicado con otra empresa de la misma cuenta).
- States the ACs demand: carga inicial (datos existentes precargados), edición en curso, guardado
  exitoso, error de validación (RUT faltante/con formato inválido, filas de IVA o exentas
  incompletas), error de guardado (ej. RUT duplicado).
- Viewport: desktop-first, responsive deseable.

## Hard constraints
- Nombrá cada archivo/frame de pantalla exactamente con su `{screen-slug}`
  (`empresas-listado-ver-empresa`, `empresa-detalle-edicion`) — el repo mapea archivos por slug.
- Sin tokens nuevos. Un valor que no esté en el contrato congelado es un defecto, no una decisión
  creativa.
- La pantalla de edición debe dejar clarísimo que se está editando una empresa **existente**, no
  creando una nueva (evitar que el usuario confunda esta pantalla con "Agregar nueva empresa").

## Export & return
**Claude Design** (`claude.ai/design`): pegá este brief completo como tu primer mensaje en el chat
del proyecto ya existente. Iterá hasta estar conforme. Después Exportar (arriba a la derecha) →
**Save as folder** → colocá el contenido del bundle en
`.context/designs/tudeclaracion/company-detail-edit/` en el repo.
(Si usás "Send to local coding agent", indicale al agente ese mismo path de destino.)

**Open Design** (app local): dentro del mismo proyecto, pegá este brief en el formulario de
Discover / campo de brief. Iterá, después copiá los artefactos finales de
`./.od/artifacts/<timestamp>-<slug>/` a `.context/designs/tudeclaracion/company-detail-edit/`.

**Cualquier otra herramienta**: producí HTML/CSS (preferido) o imágenes de alta fidelidad, un
archivo por pantalla nombrado con su `{screen-slug}`, en la misma carpeta de destino.

Cuando los archivos estén en su lugar, volvé a la sesión del agente y confirmá — la fase de
mapeo de pantallas retoma automáticamente (el checkpoint de sesión queda esperando).
