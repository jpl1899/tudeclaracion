# Automatic Interpretation | Process an uploaded file without manual edits

**Jira Key:** [TD-13](https://lk-tudeclaracion.atlassian.net/browse/TD-13)
**Epic:** [TD-10](https://lk-tudeclaracion.atlassian.net/browse/TD-10) (File Upload & Parsing)
**Type:** Historia
**Status:** Tareas por hacer
**Priority:** Medium
**Story Points:** -

---

## Overview

***Source spec******:*** FR-07

## User story

As Rosana Ferreira, I want the uploaded file to be automatically interpreted with zero manual edits, so that I save time compared to my current manual process.

## Status: BLOCKED — needs a real sample input file

> ***WARNING:**** `SRS/05-parser.md` states this file's status is ****"pendiente"****: **"No hay todavía un ejemplo confirmado del TXT de entrada (exportación mensual de asientos desde Memory). Lo que existe hasta ahora (**`c:\Users\DISCO\Downloads\2181.txt`**) es el *****TXT de salida**** (compatible con PADI), documentado en **`10-exporter.md`** — no confundir ambos formatos."**
The document lists explicitly what is still unconfirmed about the Memory input format: **"Delimitador y estructura de campos del TXT de entrada"**, **"Campos esperados (fecha, cuentas, concepto, RUT, IVA, importes — mencionados de forma genérica en **`business-model.md`**, sin spec exacta de columnas/orden)"**, **"Encoding, manejo de líneas inválidas/malformadas"**, and **"Volumen esperado (líneas por archivo mensual)"**.
It also instructs directly: **"No fabricar esta spec — pedir al usuario un ejemplo real del TXT de Memory antes de detallar este archivo."**
The PADI ***output**** format (the Exporter's responsibility, downstream of this story) is fully confirmed. The Memory ****input*** format this story depends on is not. This story cannot be estimated or built with confidence until a real Memory export sample is provided.

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
