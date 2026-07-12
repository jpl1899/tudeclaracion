# Chart of Accounts | Load the initial account-to-fiscal-concept mapping for a company

**Jira Key:** [TD-7](https://lk-tudeclaracion.atlassian.net/browse/TD-7)
**Epic:** [TD-3](https://lk-tudeclaracion.atlassian.net/browse/TD-3) (Company Configuration)
**Type:** Historia
**Status:** Tareas por hacer
**Priority:** Medium
**Story Points:** -

---

## Overview

***Source spec******:*** FR-04

## User story

As Rosana Ferreira, I want to load my client's chart of accounts and map it to fiscal concepts, so that the system can automatically classify transactions.

## Status: BLOCKED — needs product decision

`06-normalizer.md` documents this module's status explicitly as ***"pendiente"*** and lists as unresolved (`## Qué falta confirmar`):

> Cómo se carga el plan de cuentas de una empresa en el MVP, si no hay UI de autoconfiguración (¿carga manual del equipo, import de un archivo, planilla?).

Estructura del plan de cuentas configurable (¿tabla cuenta → concepto fiscal? ¿jerárquico?).

Qué pasa si una cuenta no tiene mapeo definido (¿error, línea ignorada, cola de revisión manual? — ver también `07-validator.md` sobre mensajes de error con guía clara).

The same file also states the self-service autoconfiguration UI is confirmed out of MVP scope, with the initial load mechanism explicitly still undefined:

> La UI de autoconfiguración del plan de cuentas (que el propio contador cargue/edite el mapeo desde la app) queda fuera del alcance del MVP. [...] en el MVP la carga inicial pueda resolverse de forma manual/asistida (mecanismo exacto aún sin definir).

This story cannot be estimated or built until that decision is made. It exists in the backlog as a placeholder so the gap stays visible and trackable.

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
- **Assignee:** mathias Kantor

---

_Synced from Jira by sync-jira-issues_
