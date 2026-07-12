# Amount Validation | Validate declared amounts against DGI structural rules

**Jira Key:** [TD-17](https://lk-tudeclaracion.atlassian.net/browse/TD-17)
**Epic:** [TD-14](https://lk-tudeclaracion.atlassian.net/browse/TD-14) (Normalization & Validation)
**Type:** Historia
**Status:** Tareas por hacer
**Priority:** Medium
**Story Points:** -

---

## Overview

***Source spec******:*** FR-11

## User story

As Rosana Ferreira, I want declared amounts validated against DGI's structural rules, so that I catch invalid values before generating the declaration.

## Status: BLOCKED

`07-validator.md` lists the exact amount rules as pendiente:

> Mínimos DGI (montos por debajo de los cuales una línea no se declara, si existen para el 2181).

Rango/formato válido de importes (¿acepta cero? ¿negativos?).

`Tax-rules/2181/validations.md` confirms the same gap from the tax-rules side:

> Mínimos DGI: ¿existe un importe mínimo por debajo del cual una línea no se declara para el 2181?

Both files close with the same instruction: "No fabricar reglas de negocio — son decisiones tributarias que debe confirmar el usuario." This story cannot be estimated or built until DGI's actual minimum/range rules for the 2181 are confirmed. It exists in the backlog as a placeholder so the gap stays visible and trackable.

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
