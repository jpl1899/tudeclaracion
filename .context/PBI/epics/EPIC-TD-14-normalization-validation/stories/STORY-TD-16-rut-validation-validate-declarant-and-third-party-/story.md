# RUT Validation | Validate declarant and third-party RUT format

**Jira Key:** [TD-16](https://lk-tudeclaracion.atlassian.net/browse/TD-16)
**Epic:** [TD-14](https://lk-tudeclaracion.atlassian.net/browse/TD-14) (Normalization & Validation)
**Type:** Historia
**Status:** Tareas por hacer
**Priority:** Medium
**Story Points:** -

---

## Overview

***Source spec******:*** FR-10

## User story

As Rosana Ferreira, I want the system to validate that RUTs in my file are correctly formatted, so that I catch data errors before submission.

## What's confirmed vs. open

`Tax-rules/common/rut.md` confirms the RUT format as ***12 digits***. It does NOT confirm the Uruguayan verifier-digit algorithm:

> Algoritmo de dígito verificador del RUT uruguayo — (especulativo / conocimiento general, no verificado): es común que el RUT uruguayo incluya un dígito verificador calculado con un algoritmo específico (similar en espíritu al de la Cédula de Identidad), pero el algoritmo exacto no está confirmado acá y no debe asumirse sin verificarlo.

This story is scoped to the confirmed 12-digit length/format check only. Verifier-digit validation is moved to Out of Scope below — deferred, not silently dropped.

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
