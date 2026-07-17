# File Upload | Upload the monthly Memory export

**Jira Key:** [TD-11](https://lk-tudeclaracion.atlassian.net/browse/TD-11)
**Epic:** [TD-10](https://lk-tudeclaracion.atlassian.net/browse/TD-10) (File Upload & Parsing)
**Type:** Historia
**Status:** Deployed
**Priority:** Medium
**Story Points:** -

---

## Overview

***Source spec******:*** FR-06

## User story

As Rosana Ferreira, I want to upload the monthly Memory export file for a selected company, so that the system can start processing it.

## Entry point (confirmed 2026-07-14)

Accessed from `/dashboard`, after pressing "Iniciar nueva declaración" — opens an import window ("Importar asiento") offering two equivalent ways to provide the file:

- Browse the file system (native file picker), or
- Drag and drop the file onto the window's drop area.

## Definition of done

- File selection and upload available for the active company, via either the native file picker or drag-and-drop onto the import window.
- Only the expected file type is accepted.
- Upload is rejected when no company is selected.

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
- **Updated:** 14/7/2026
- **Reporter:** Juan Leites
- **Assignee:** Juan Leites

---

_Synced from Jira by sync-jira-issues_
