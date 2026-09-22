# Monthly Package | Generate the 2181 and 1376 for a period as a linked pair

**Jira Key:** [TD-45](https://lk-tudeclaracion.atlassian.net/browse/TD-45)
**Epic:** [TD-36](https://lk-tudeclaracion.atlassian.net/browse/TD-36) (Monthly Package - 1376 and 2181 Annex)
**Type:** Historia
**Status:** Tareas por hacer
**Priority:** Medium
**Story Points:** -

---

## Overview

## User story

As a contador (Rosana), I want to generate the 2181 and the 1376 of the same client and period in a linked way, because the 2181 is the mandatory annex of the 1376.

## Context

The two declaraciones of a period belong together. A period's declaracion can carry the 2181, the 1376, or both.

## Scope

- From a company and a period, generate the 2181 and the 1376 tied to that period.
- The 2181 is presented as the annex of the 1376.
- Each can be generated independently, but the period tracks both.
- States: both generated; one generated and the other pending; neither generated; one with errors.

## Out of scope

- The data-model detail of how the pair links under a declaracion (that is /sprint-development work per ADR-0006).
- Changing the 2181 generation itself.

## Acceptance criteria

```gherkin
Scenario: Generate the 1376 for a period that already has a 2181
  Given a period already has a generated 2181
  When I generate the 1376 for that period
  Then both appear under the same period
  And the 2181 is marked as the annex of the 1376

Scenario: Only the 2181 generated
  Given a period has a generated 2181 and no 1376
  Then the period shows the 1376 as pending

Scenario: Neither generated
  Given a period has neither declaracion
  Then the period shows both as pending

Scenario: One of the two has an error
  Given the 1376 generation for a period fails
  Then the period reflects the error state on the 1376
```

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

### Historias (2)

- [TD-44](https://lk-tudeclaracion.atlassian.net/browse/TD-44): 1376 Generation | Download the code-and-amount file for PADI _(Tareas por hacer)_
- [TD-46](https://lk-tudeclaracion.atlassian.net/browse/TD-46): Monthly Package | See both period declaraciones together with their status _(Tareas por hacer)_

---

## Metadata

- **Created:** 8/30/2026
- **Updated:** 8/30/2026
- **Reporter:** Juan Leites
- **Assignee:** Juan Leites
- **Labels:** form-1376, mvp2

---

_Synced from Jira by sync-jira-issues_
