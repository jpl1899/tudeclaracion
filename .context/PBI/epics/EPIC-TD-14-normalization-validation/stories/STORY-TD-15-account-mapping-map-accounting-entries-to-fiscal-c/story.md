# Account Mapping | Map accounting entries to fiscal concepts automatically

**Jira Key:** [TD-15](https://lk-tudeclaracion.atlassian.net/browse/TD-15)
**Epic:** [TD-14](https://lk-tudeclaracion.atlassian.net/browse/TD-14) (Normalization & Validation)
**Type:** Historia
**Status:** Tareas por hacer
**Priority:** Medium
**Story Points:** -

---

## Overview

***Source spec******:*** FR-09

## User story

As Rosana Ferreira, I want each accounting entry automatically mapped to its fiscal concept, so that I don't have to classify transactions manually.

## Status: BLOCKED

This story depends on two unresolved items:

1. `TD-7`*** "Chart of Accounts | Load the initial account-to-fiscal-concept mapping for a company"*** — the Normalizer needs a resolved chart-of-accounts mapping to consume, and TD-7's own loading mechanism is not yet defined (same gap, not re-invented here).
2. `06-normalizer.md`***'s mapping-rule mechanism itself***, which the file documents as pendiente:

> Estructura del plan de cuentas configurable (¿tabla cuenta → concepto fiscal? ¿jerárquico?).

Qué pasa si una cuenta no tiene mapeo definido (¿error, línea ignorada, cola de revisión manual? — ver también `07-validator.md` sobre mensajes de error con guía clara).

`06-normalizer.md` also states explicitly: "No fabricar esta spec — depende de decisiones de producto (PRD) y del formato de entrada aún no definido."

This story cannot be estimated or built until both TD-7 and the mapping-rule mechanism are resolved. It exists in the backlog as a placeholder so the gap stays visible and trackable.

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
