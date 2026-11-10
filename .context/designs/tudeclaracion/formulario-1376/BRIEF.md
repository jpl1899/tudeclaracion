# Design brief — tuDeclaracion / formulario-1376
Tool session: CONTINUE project "tuDeclaracion screens" — mode FOLLOW-UP

## Mission
Diseñá 3 pantallas para tuDeclaracion, un SaaS de generación de declaraciones juradas DGI para
contadores. Describimos QUÉ debe lograr cada pantalla; el CÓMO se ve es tu decisión — layout,
composición, jerarquía, elección de componentes y micro-interacciones quedan totalmente
delegados a vos. Tu único límite duro es el contrato de diseño de abajo: nunca inventes colores,
tipografías o spacing fuera de él.
Cuando termines, exportá y devolvé los archivos como se indica en "Export & return".

## Product context
_(FOLLOW-UP — omitido; el proyecto ya conoce el producto.)_

## Frozen design contract (non-negotiable)
Mismo sistema de diseño que las pantallas anteriores de este proyecto (landing, selector de
empresas, alta de empresa, detalle/edición de empresa, detalle de declaración, recuperación de
acceso) — mantené consistencia visual total con ellas. Los tokens ya establecidos en `DESIGN.md`
siguen gobernando. Sin tokens nuevos.

## Contexto de estas 3 pantallas (nuevo formulario)

Hoy el producto genera la **Declaración Jurada 2181** (informativa, línea por RUT). Se agrega un
**segundo formulario: la DJ 1376** — declaración mensual de IVA + anticipos de otros impuestos,
para contribuyentes grandes. Diferencias que importan para el diseño:

- La 1376 se arma **por cuenta contable agregada, sin apertura por RUT** (la 2181 sí es por RUT).
- El contador configura una **matriz de mapeo** (qué cuenta suma a qué "código de línea" del
  formulario) y el sistema totaliza. El archivo que se descarga es una lista de
  `código de línea; monto total`, un renglón por código.
- La 2181 es **anexo obligatorio** de la 1376: en el mes se presentan juntas.

Reutilizá lo que ya existe donde tenga sentido (shell con sidebar, patrón de tablas editables de
la pantalla de detalle/edición de empresa, patrón de estados de la pantalla de detalle de
declaración). Solo la matriz de mapeo del 1376 es una superficie realmente nueva.

## Screens requested

### 1. mapeo-1376-config — Configuración del mapeo 1376
- Route: nueva, en el contexto de una empresa existente (ej. dentro de `/empresas/[id]` o una ruta
  propia colgada de ahí — el lugar exacto lo decidís vos).
- Purpose: por empresa, el contador define cómo se agregan sus cuentas contables hacia los códigos
  de línea del formulario 1376, para que el sistema totalice automáticamente.
- User stories: EPIC-M2-01 (US M2.1, M2.2, M2.3).
- El usuario debe poder:
  - Ver y editar una matriz de filas. Cada fila vincula tres cosas: una **cuenta contable** de la
    empresa, si el movimiento de esa cuenta se toma **por el Debe o por el Haber**, y a qué
    **código de línea del formulario 1376** se suma el saldo de esa cuenta.
  - Agregar, editar y quitar filas.
  - Distinguir con total claridad que esta configuración es **distinta y separada** del plan de
    cuentas que la empresa ya usa para la 2181 (aquel mapea cuenta → código PADI; este mapea
    cuenta + Debe/Haber → código de línea 1376). El contador no debe confundir ambas.
  - Guardar los cambios.
  - Volver sin guardar si se arrepiente.
  - Recibir confirmación de guardado, o un mensaje claro con guía si algo falla (fila incompleta,
    dato inválido).
  - (a validar) Partir de un conjunto de filas sugerido en vez de armar la matriz desde cero.
- States that the ACs demand: empresa sin mapeo configurado todavía; matriz existente precargada;
  edición en curso; guardado exitoso; error de validación (fila incompleta / dato inválido).
- Viewport: desktop-first, responsive deseable.

### 2. declaracion-1376-totales — Revisión de totales de la 1376
- Route: nueva, análoga a la pantalla de detalle de una declaración (el lugar exacto lo decidís vos).
- Purpose: después de procesar el TXT mensual de asientos, el contador revisa los totales
  calculados por código de línea del 1376 antes de descargar el archivo para PADI.
- User stories: EPIC-M2-02 (US M2.4, M2.5, M2.6, M2.7); EPIC-M2-04 (US M2.10, M2.11).
- El usuario debe poder:
  - Ver el resultado del procesamiento: un **monto total por cada código de línea** del 1376 al
    que se mapeó al menos una cuenta con movimiento en el período.
  - Ver, cuando las haya, una **advertencia que liste las cuentas con movimiento en el TXT que
    quedaron sin mapear** a ningún código de línea — tiene que ser imposible de pasar por alto
    antes de descargar (presentar totales incompletos es un riesgo real).
  - Entender que estos totales son **agregados por cuenta, sin RUT** (a diferencia de la 2181).
  - **Descargar** el archivo de la 1376 listo para importar en PADI.
  - Ver un mensaje claro con guía si algo del cálculo no cierra (mismo criterio de UX que la 2181).
- States that the ACs demand: procesando; resultado sin advertencias (todo mapeado); resultado
  con advertencia de cuentas sin mapear; error del cálculo; todavía sin datos (TXT no procesado).
- Viewport: desktop-first.

### 3. paquete-mensual-2181-1376 — Paquete mensual del período
- Route: vista de un período de una empresa (evolución del historial / detalle de declaración).
- Purpose: para un cliente y un período, el contador ve las declaraciones que componen la
  presentación mensual ante DGI: la 2181 (anexo) y la 1376.
- User stories: EPIC-M2-03 (US M2.8, M2.9).
- El usuario debe poder:
  - Ver, para un período de una empresa, la **2181 y la 1376 juntas**, con el **estado de cada
    una** (ej. en curso / generada / con errores).
  - Entender que la **2181 es anexo de la 1376** — van juntas en la presentación del mes.
  - Acceder al detalle de cada una y **descargar** el archivo de cada una cuando esté generada.
  - Distinguir a simple vista un período incompleto (falta generar una de las dos) de uno completo.
- States that the ACs demand: período con ambas generadas; período con una sola generada / la otra
  pendiente; período sin ninguna generada; período con errores en alguna.
- Viewport: desktop-first.

## Hard constraints
- Nombrá cada archivo/frame de pantalla exactamente con su `{screen-slug}`
  (`mapeo-1376-config`, `declaracion-1376-totales`, `paquete-mensual-2181-1376`) — el repo mapea
  archivos por slug.
- Sin tokens nuevos. Un valor que no esté en el contrato congelado es un defecto, no una decisión
  creativa.
- Mantené consistencia visual total con las pantallas ya diseñadas en este proyecto.
- `mapeo-1376-config` debe dejar clarísimo que es una configuración **separada** del plan de
  cuentas del 2181.
- En `declaracion-1376-totales`, la advertencia de cuentas sin mapear no puede pasar
  desapercibida antes de la descarga.

## Export & return
**Claude Design** (`claude.ai/design`): pegá este brief completo como un mensaje nuevo en el chat
del proyecto ya existente **"tuDeclaracion screens"**. Iterá hasta estar conforme. Después
Exportar (arriba a la derecha) → **Save as folder** → colocá el contenido del bundle en
`.context/designs/tudeclaracion/formulario-1376/` en el repo.
(Si usás "Send to local coding agent", indicale al agente ese mismo path de destino.)

**Cualquier otra herramienta**: producí HTML/CSS (preferido) o imágenes de alta fidelidad, un
archivo por pantalla nombrado con su `{screen-slug}`, en la misma carpeta de destino.

Cuando los archivos estén en su lugar, volvé a la sesión del agente y confirmá — la fase de
mapeo de pantallas retoma automáticamente (el checkpoint de sesión queda esperando).
