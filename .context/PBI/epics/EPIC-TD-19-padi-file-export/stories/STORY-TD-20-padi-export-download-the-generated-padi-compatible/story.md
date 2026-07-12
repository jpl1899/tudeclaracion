# PADI Export | Download the generated PADI-compatible file

**Jira Key:** [TD-20](https://lk-tudeclaracion.atlassian.net/browse/TD-20)
**Epic:** [TD-19](https://lk-tudeclaracion.atlassian.net/browse/TD-19) (PADI File Export)
**Type:** Historia
**Status:** Tareas por hacer
**Priority:** Medium
**Story Points:** -

---

## Overview

***Source spec******:*** FR-16, FR-15

## User story

As Rosana Ferreira (contadora), quiero descargar el archivo PADI generado una vez que mi declaración fue procesada, para poder presentarlo ante DGI.

## Definition of done

- El archivo TXT generado respeta exactamente la estructura de 7 campos confirmada en `SRS/10-exporter.md` (delimitador `;`, sin encabezado, una línea por registro).
- El botón/acción de descarga solo está habilitado cuando el procesamiento de la declaración terminó sin errores.
- El nombre del archivo descargado sigue una convención identificable (DJ, período, cliente) — a definir su formato exacto en el plan de implementación.
- El archivo se descarga correctamente en un navegador estándar sin pasos manuales adicionales.

## Note (not a blocker)

`SRS/10-exporter.md` deja pendiente un único punto: si el campo 7 (importe) lleva decimales implícitos. Esto afecta la precisión de los criterios de aceptación sobre el contenido exacto del archivo, pero no la viabilidad de esta historia — el formato de 7 campos, delimitador y estructura general ya están confirmados contra un ejemplo real.

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

## Metadata

- **Created:** 7/7/2026
- **Updated:** 7/7/2026
- **Reporter:** Juan Leites
- **Assignee:** Juan Leites

---

_Synced from Jira by sync-jira-issues_
