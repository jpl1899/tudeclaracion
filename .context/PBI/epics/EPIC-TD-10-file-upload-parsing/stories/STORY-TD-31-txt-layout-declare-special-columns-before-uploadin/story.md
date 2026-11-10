# TXT Layout | Declare special columns before uploading a non-standard file

**Jira Key:** [TD-31](https://lk-tudeclaracion.atlassian.net/browse/TD-31)
**Epic:** [TD-10](https://lk-tudeclaracion.atlassian.net/browse/TD-10) (File Upload & Parsing)
**Type:** Historia
**Status:** Deployed
**Priority:** Medium
**Story Points:** -

---

## Overview

## User story

***As a*** Rosana Ferreira (Contadora, gestiona la DJ 2181 de varios estudios/clientes)
***I want to*** declarar qué columnas adicionales trae el TXT mensual de mi software contable antes de subirlo, cuando ese archivo no tiene el formato estándar
***So that*** el sistema interprete correctamente el archivo aunque mi proveedor contable agregue columnas que el formato estándar no contempla

## Definition of done

- [ ] Código implementado y funcionando
- [ ] Tests unitarios del parser cubriendo archivo estándar, archivo con columnas especiales, y línea con cantidad de campos inconsistente
- [ ] Code review aprobado
- [ ] Documentación actualizada (`SRS/05-parser.md` ya refleja la decisión aceptada — verificar que el código implementado coincide)
- [ ] Desplegado a staging
- [ ] Criterios de aceptación validados

## Technical notes

Implementa la decisión ya aceptada en `ADR-0005-configurable-txt-field-layout-2181.md` y documentada en `SRS/05-parser.md` §"Aceptado 2026-08-07 — layout configurable de campos". Generaliza y reemplaza el fix puntual del 2026-08-04 (proveedor FMSSRL, campo 13 fijo después de Tipo).

### Impact Analysis

- Parser (`src/modules/parser/parse-asientos.ts`): pasa de asumir 12/13 campos fijos a derivar el layout desde una configuración explícita.
- Probable tabla nueva en Supabase para persistir la configuración de campos por archivo/empresa — detalle a definir en el implementation plan de `/sprint-development`.
- Pantalla nueva de configuración pre-subida (bloquea el botón de subir sin configuración, cuando el archivo no matchea el modelo clásico de 11/12 campos).

---

## Fields

> Each rich-text field is a separate file in this folder.

- [Acceptance Criteria](./acceptance-criteria.md)
- [Business Rules](./business-rules.md)
- [Scope](./scope.md)
- [Out Of Scope](./out-of-scope.md)
- [Workflow](./workflow.md)
- [Mockup](./mockup.md)
- [Implementation Plan (Dev)](./implementation-plan.md)
- [Acceptance Test Plan (QA)](./acceptance-test-plan.md)
- [Acceptance Test Results (QA)](./acceptance-test-results.md)

---

## Traceability

### Historia (1)

- [TD-13](https://lk-tudeclaracion.atlassian.net/browse/TD-13): Automatic Interpretation | Process an uploaded file without manual edits _(Ready for QA-on QA)_

---

## Metadata

- **Created:** 7/8/2026
- **Updated:** 8/8/2026
- **Reporter:** Juan Leites
- **Assignee:** Juan Leites
- **Labels:** parser, tax-engine

---

_Synced from Jira by sync-jira-issues_
