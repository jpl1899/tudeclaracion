# Error Guidance | Receive a clear, actionable message when validation fails

**Jira Key:** [TD-18](https://lk-tudeclaracion.atlassian.net/browse/TD-18)
**Epic:** [TD-14](https://lk-tudeclaracion.atlassian.net/browse/TD-14) (Normalization & Validation)
**Type:** Historia
**Status:** Tareas por hacer
**Priority:** Medium
**Story Points:** -

---

## Overview

***Source spec******:*** FR-12

## User story

As Rosana Ferreira, I want a clear, actionable message when something in my file fails validation, so that I know exactly what to fix before resubmitting.

## Open question: all-at-once vs. one-at-a-time

Whether the system should show every validation error in the file at once, or one at a time, is still an open question — not assumed here. `PRD/business-flow.md` states:

> Cómo se comunica al usuario el resultado de la validación cuando hay múltiples errores en el mismo archivo (¿lista completa, uno por vez?) — ver `user-journeys.md`.

`PRD/user-journeys.md` (Journey 2) repeats the same open point:

> ¿Qué pasa si hay más de un error en el mismo archivo? Pendiente de confirmar: ¿se muestran todos juntos o de a uno? (abierto en `PRD/business-flow.md`).

Whether an invalid record blocks the whole file or excludes only that line (partial-report) is also pendiente per `07-validator.md`. This story covers the single-error case as confirmed by FR-12; the multiple-error UX is called out explicitly as open, not picked silently.

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
