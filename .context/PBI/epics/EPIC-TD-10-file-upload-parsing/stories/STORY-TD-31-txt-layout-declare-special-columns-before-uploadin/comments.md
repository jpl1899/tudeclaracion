# Comments for TD-31

[View in Jira](https://lk-tudeclaracion.atlassian.net/browse/TD-31)

---

### Juan Leites - 7/8/2026, 16:22:11

## Acceptance Criteria

```gherkin
Scenario: Standard file uploads without any extra configuration
  Given Rosana has a monthly TXT file with the standard column layout
  When she selects the file to upload
  Then the upload proceeds immediately, with no configuration screen shown
```

```gherkin
Scenario: Non-standard file requires declaring its extra columns before uploading
  Given Rosana selects a monthly TXT file whose column count does not match the standard layout
  When the system detects the mismatch
  Then Rosana sees a configuration screen listing every additional column type the system recognizes
  And the upload action stays disabled until she selects which additional columns her file includes
```

```gherkin
Scenario: A correctly configured non-standard file is interpreted correctly
  Given Rosana has declared which additional columns her file includes
  When she completes the upload
  Then every line of the file is interpreted using the columns she declared
  And the resulting declaration data is correct, regardless of which lines actually contain a value for each additional column
```

```gherkin
Scenario: A file line doesn't match the declared column configuration
  Given Rosana has declared a specific set of additional columns for her file
  When a line in the file has a different number of columns than what she declared
  Then the upload is rejected in full
  And Rosana sees a clear message identifying the mismatched line
```

---

### Juan Leites - 7/8/2026, 16:22:12

## Scope

- Archivos con la cantidad estándar de columnas siguen subiendo y procesándose exactamente igual que hoy, sin ningún paso adicional.
- Cuando la cantidad de columnas de un archivo no coincide con el formato estándar, se muestra una pantalla de configuración con todos los tipos de columna adicional que el sistema reconoce.
- La acción de subir el archivo queda deshabilitada hasta que Rosana complete esa configuración.
- El sistema interpreta correctamente cada línea del archivo según las columnas que Rosana declaró, tratando una columna reconocida pero no marcada como directamente ausente.
- Una línea cuya cantidad de columnas no coincide con lo configurado se reporta con un mensaje claro, sin generar resultados parciales.

---

### Juan Leites - 7/8/2026, 16:22:13

## Out Of Scope

- Detección automática de qué columnas adicionales trae un archivo, sin que Rosana las declare.
- Declarar una configuración distinta para líneas o secciones distintas dentro del mismo archivo — la configuración aplica al archivo completo.
- Ampliar el tope de dígitos de Debe/Haber, agregar un tope de importe a Total/IVA, ofrecer una tabla de monedas configurable, o ampliar los valores aceptados del campo Tipo — decidido explícitamente fuera de alcance (ADR-0005).

---

### Juan Leites - 7/8/2026, 16:22:14

## Business Rules Specification

- El orden relativo en que pueden aparecer las columnas adicionales reconocidas respecto de las columnas obligatorias es fijo — Rosana solo elige cuáles están presentes en su archivo, nunca en qué posición van.
- La configuración declarada aplica al archivo completo, nunca a líneas individuales dentro del mismo archivo.
- Una columna adicional declarada como presente pero sin dato aplicable en una línea puntual se trata como valor vacío en esa línea, no como columna ausente.

---

### Juan Leites - 8/8/2026, 9:38:01

## Spec Implementation Plan (Dev)

# Implementation Plan: STORY-TD-31 - TXT Layout | Declare special columns before uploading a non-standard file

## Overview

Implementa ADR-0005: reemplaza el fix ad-hoc del 13er campo (FMSSRL) por un mecanismo general de layout configurable. El parser (`parse-asientos.ts`) pasa de asumir 12/13 campos fijos a derivar la posición de cada campo desde una configuración explícita que Rosana declara antes de subir un archivo no estándar. Sin tabla nueva en Supabase — configuración efímera, vive solo mientras el diálogo de importación está abierto (decisión tomada en esta sesión de planning: no hay evidencia de que un mismo proveedor cambie de layout mes a mes, y persistir agrega superficie — schema, RLS, UI de edición — sin AC que lo pida).

***Acceptance Criteria a cumplir*** (4 escenarios Gherkin, ver `comments.md`):
- Archivo estándar sube sin configuración adicional.
- Archivo no estándar (cantidad de campos ≠ 11/12) bloquea el botón "Importar" hasta declarar las columnas especiales presentes.
- Archivo correctamente configurado se interpreta bien línea por línea, incluso con campos especiales vacíos en líneas puntuales.
- Línea con cantidad de campos distinta a la declarada rechaza el archivo completo con mensaje claro.

---

## Technical Approach

***Chosen approach:*** Tabla de orden canónico (20 posiciones: 12 obligatorias + 9 especiales, orden fijo por `SRS/05-parser.md` §"Aceptado 2026-08-07") + función que deriva el layout efectivo a partir de un `Set<CampoEspecial>` de habilitados. `parseAsientosTxt` recibe ese Set como tercer parámetro (default vacío, compatibilidad con el modelo clásico). La UI (`ImportarAsientoDialog`) detecta la cantidad de campos de la primera línea de datos del archivo apenas se selecciona, y si no matchea 11/12 muestra el checklist de las 9 columnas especiales, habilitando "Importar" solo cuando `12 + seleccionadas.size === camposDetectados`.

***Alternatives considered:***
- Detección automática por cantidad de campos — descartada en el ADR (ambigua, múltiples combinaciones dan el mismo total).
- Persistencia por empresa (tabla Supabase + RPC + RLS) — evaluada en este planning; descartada por decisión del usuario (efímera, sin AC que pida recordarla, menor superficie).
- Nueva pantalla/ruta dedicada para la configuración — descartada; se extiende `ImportarAsientoDialog` (mismo patrón que D5/D7, spec-only ratificado como D9 en `master-design-plan.md`).

***Why this approach:***
- ✅ Generaliza el fix FMSSRL sin casos especiales por proveedor.
- ✅ Cero cambios de schema — reduce blast radius y tiempo de review.
- ✅ Reutiliza el componente de diálogo ya vivo, sin nueva superficie de navegación.
- ❌ Trade-off: Rosana re-declara la configuración cada vez que sube un archivo no estándar (aceptado explícitamente — ver arriba).

---

## UI/UX Design

***Pantalla:*** extiende `ImportarAsientoDialog` (`src/components/importar-asiento-dialog.tsx`) con un paso condicional nuevo, entre la selección de archivo y el botón "Importar". Ver §5 D9 y §8 (TD-31) de `.context/design/master-design-plan.md` — spec-only, ratificado 2026-08-08.

***Cuándo aparece:*** solo cuando el archivo seleccionado tiene una cantidad de campos en su primera línea de datos distinta de 11 o 12.

***Contenido del paso:***
- Aviso: "Este archivo no tiene el formato estándar (se detectaron {N} campos por línea)."
- Checklist de las 9 columnas especiales conocidas (C.Costos, Comprobante, Número, Emisión, Vencimiento, Número Documento, Serie Documento, Serie, Número Asiento) — checkboxes, todas deshabilitadas/sin marcar por defecto.
- Contador en vivo: "Columnas configuradas: 12 + {seleccionadas} = {total} de {N} detectados."
- El botón "Importar" permanece deshabilitado hasta que `total === N`.

***Componentes:*** `Checkbox` (shadcn, primer uso en este componente — ya está en `src/components/ui/`, confirmar antes de asumir que falta) + `Button`/`Card` ya vivos. Sin componentes nuevos fuera del propio diálogo.

***Estados:*** reutiliza el patrón de estados mutuamente excluyentes que ya tiene el diálogo (`archivo → [configEspecial?] → confirmarReemplazo? → confirmacion`).

---

## Implementation Steps

### Step 1: Tabla de orden canónico + derivación de layout

***File:*** `src/modules/parser/parse-asientos.ts`

***Task:*** Agregar la tabla de 20 posiciones (orden fijo, `SRS/05-parser.md` §"Aceptado 2026-08-07") y una función `derivarLayout(habilitados: Set<CampoEspecial>): string[]` que filtra las posiciones especiales no habilitadas y devuelve las keys en orden. Exportar el tipo `CampoEspecial` (union de las 9 keys) para que la UI lo consuma.

***Testing:*** unitario — `derivarLayout` con Set vacío devuelve las 12 keys obligatorias en orden; con 1-2 especiales habilitados devuelve el orden intercalado correcto (ej. solo `numeroAsiento` habilitado reproduce exactamente el caso FMSSRL: 13 campos, extra al final).

***Estimated time:*** 30 min

---

### Step 2: Reescribir `parseLine` / `parseAsientosTxt` para usar el layout derivado

***File:*** `src/modules/parser/parse-asientos.ts`

***Task:*** `parseAsientosTxt` recibe un tercer parámetro `camposEspecialesHabilitados: Set<CampoEspecial> = new Set()`. Calcula el ancho esperado (`12 + habilitados.size`, con la excepción ya existente de 11 campos = Tipo omitido por posición, tratado como vacío — leniencia que se mantiene SOLO para el modelo clásico, no se generaliza a layouts con especiales). `parseLine` arma un lookup posición→valor a partir del layout derivado en vez de destructuring fijo, y lee cada campo obligatorio por su key en vez de por índice literal. Los campos especiales se leen y se descartan (nunca se validan ni se usan, por diseño del ADR).

***Edge cases handled:***
- Línea con cantidad de campos distinta al ancho esperado → mismo mensaje que hoy, pero calculado dinámicamente ("Se esperaban {ancho}, se encontraron {N}").
- Campo especial habilitado sin dato en una línea puntual → valor vacío en su posición, no se trata como campo ausente (ya es el comportamiento natural de `splitFields` sobre una celda vacía entre comas).
- Caso FMSSRL (regresión): con solo `numeroAsiento` habilitado, el comportamiento debe ser idéntico al fix ad-hoc actual — cubrir con el mismo archivo de fixture que originó el fix 2026-08-04.

***Testing:*** unitario — reescribir los tests existentes de 12/13 campos para pasar `new Set()` / `new Set(['numeroAsiento'])` explícito; agregar casos con 2-3 especiales combinados en distintas posiciones del orden canónico (ej. `costos` + `emision`, que quedan a ambos lados de `concepto`).

***Estimated time:*** 1.5 h

---

### Step 3: Helper de detección de campos para la UI

***File:*** `src/modules/parser/parse-asientos.ts`

***Task:*** Exportar `contarCamposPrimeraLineaDeDatos(content: string): number` — reutiliza `splitFields` + `isHeaderLine` (ya existentes) para devolver la cantidad de campos de la primera línea real de datos, sin repetir la lógica de parseo CSV quote-aware. Único punto de reuso entre parser y UI — no justifica moverlo a `shared/` (ver CLAUDE.md §10, DRY).

***Testing:*** unitario — archivo con encabezado, archivo sin encabezado, archivo con 13 campos.

***Estimated time:*** 20 min

---

### Step 4: Paso de configuración en `ImportarAsientoDialog`

***File:*** `src/components/importar-asiento-dialog.tsx`

***Task:*** Al seleccionar archivo (`seleccionarArchivo`), leer `file.text()` y calcular `camposDetectados` con el helper del Step 3. Nuevo estado `camposEspecialesSeleccionados: Set<CampoEspecial>`. Nuevo bloque condicional (mismo patrón que `confirmarReemplazo`/`confirmacion`) que se muestra cuando `camposDetectados !== null && camposDetectados !== 11 && camposDetectados !== 12`: checklist de 9 checkboxes + contador en vivo. `puedeImportar` se extiende: si el archivo no es del modelo clásico, además requiere `12 + camposEspecialesSeleccionados.size === camposDetectados`.

***Edge cases handled:***
- Cambiar de archivo con el paso de configuración abierto → `resetEstado` debe limpiar también `camposEspecialesSeleccionados`.
- Archivo estándar (11/12 campos) → el paso ni se muestra, comportamiento idéntico al actual.

***Testing:*** sin test de componente (el proyecto no tiene `@testing-library/react` configurado — confirmado en `package.json`, ningún otro diálogo tiene tests de componente). Cubrir con validación en vivo (Playwright) contra un archivo real no estándar en staging, Stage 3.

***Estimated time:*** 1.5 h

---

### Step 5: Propagar la selección hasta el parser

***File:*** `src/app/dashboard/dashboard-client.tsx`

***Task:*** Extender `ImportarAsientoOpciones` (en `importar-asiento-dialog.tsx`) con `camposEspecialesHabilitados: Set<CampoEspecial>`. `handleImportar` pasa ese Set como tercer argumento a `parseAsientosTxt`.

***Testing:*** cubierto por el smoke E2E de Stage 3 (subida real con archivo no estándar).

***Estimated time:*** 20 min

---

### Step 6: Actualizar `SRS/05-parser.md`

***Task:*** La sección "Aceptado 2026-08-07" ya documenta la regla — actualizar su encabezado de "Pendiente de implementación" a reflejar que el código ya la implementa, con referencia a esta story.

***Estimated time:*** 10 min

---

## Technical Decisions (Story-specific)

### Decision 1: Configuración efímera, sin tabla nueva en Supabase

***Chosen:*** El Set de columnas especiales habilitadas vive solo como estado de React dentro de `ImportarAsientoDialog`, se descarta al cerrar el diálogo.

***Reasoning:***
- ✅ Cero cambios de schema/RLS — reduce superficie y tiempo de review (ticket ya es grande solo con el parser).
- ✅ Ningún AC pide recordar la configuración entre cargas.
- ❌ Trade-off: si un proveedor contable exporta siempre el mismo layout no estándar, Rosana re-declara la config cada mes. Aceptado explícitamente por el usuario — revisar si se vuelve fricción real antes de construir persistencia (evidencia real, no especulativa, per el mismo criterio que descartó la config por línea en el ADR).

### Decision 2: Leniencia de 11 campos (Tipo omitido) se mantiene solo para el modelo clásico

***Chosen:*** Cuando el archivo no tiene especiales habilitados y trae 11 campos (Tipo ausente por completo, sin coma final), se trata igual que 12 campos con Tipo vacío — comportamiento heredado del código actual. Esta leniencia NO se generaliza a layouts con especiales habilitados (ahí el ancho debe matchear exacto: `12 + especiales`).

***Reasoning:***
- ✅ Preserva el comportamiento actual documentado en `SRS/05-parser.md` (11 o 12 campos = modelo clásico) sin inventar una regla nueva.
- ❌ Trade-off: asimetría entre el caso clásico y el caso configurado — documentada acá para que no se lea como inconsistencia en code review.

---

## Dependencies

***Pre-requisitos técnicos:***
- [x] ADR-0005 Accepted (ya mergeado a `staging`).
- [x] D9 ratificado en `master-design-plan.md` (spec-only, esta sesión).
- [ ] Confirmar que `Checkbox` de shadcn ya está instalado en `src/components/ui/` (si no, agregarlo vía shadcn MCP antes del Step 4).

---

## Risks & Mitigations

***Risk 1:*** Regresión del caso real FMSSRL (fix ad-hoc 2026-08-04) al generalizar el parser.
- ***Impact:*** High — es el único caso con archivo real de un proveedor en producción.
- ***Mitigation:*** Step 2 incluye ese fixture como test de regresión explícito antes de tocar `parseLine`.

***Risk 2:*** El helper de detección de campos (Step 3) y `parseLine` (Step 2) podrían divergir en cómo cuentan campos (ej. ante líneas vacías o BOM) y dar falsos "no estándar".
- ***Impact:*** Medium.
- ***Mitigation:*** Ambos reusan la misma función `splitFields` — no hay dos implementaciones de parseo CSV.

---

## Estimated Effort

| Step | Time |
| --- | --- |
| 1. Tabla de orden canónico + derivación | 30 min |
| 2. Reescribir parseLine/parseAsientosTxt | 1.5 h |
| 3. Helper de detección de campos | 20 min |
| 4. Paso de configuración en el diálogo | 1.5 h |
| 5. Propagar selección hasta el parser | 20 min |
| 6. Actualizar SRS | 10 min |
| ***Total**** | ****~4.5 h*** |

---

## Definition of Done Checklist

- [ ] Código implementado según este plan
- [ ] Los 4 escenarios de Acceptance Criteria cubiertos
- [ ] Regresión FMSSRL cubierta con fixture real
- [ ] Tests unitarios del parser (estándar, con especiales, línea inconsistente) — `bun run test`
- [ ] Live-UI validation (Playwright) del paso de configuración contra un archivo no estándar real en staging
- [ ] Code review aprobado
- [ ] `SRS/05-parser.md` actualizado
- [ ] Sin errores de linting/TypeScript
- [ ] Deployed to staging

---

## Review Workload Forecast

Estimated: ~230 additions + ~90 deletions = ~320 total lines (+20% buffer ≈ 384)
400-line budget risk: Medium
Chain strategy: single-pr
Decision needed before apply: No


---


_Synced from Jira by sync-jira-issues_
