# Monthly Package | See both period declaraciones together with their status

**Jira Key:** [TD-46](https://lk-tudeclaracion.atlassian.net/browse/TD-46)
**Epic:** [TD-36](https://lk-tudeclaracion.atlassian.net/browse/TD-36) (Monthly Package - 1376 and 2181 Annex)
**Type:** Historia
**Status:** Tareas por hacer
**Priority:** Medium
**Story Points:** -

---

## Overview

## User story

As a contador (Rosana), I want to see both period declaraciones together in the history, with their status, so that I can tell at a glance whether the month's filing is complete.

## Scope

- In a company's history / period view, show the 2181 and the 1376 of a period together, each with its status (for example: in progress / generated / with errors).
- An incomplete period (one of the two missing) is visually distinct from a complete one.
- Open the detail of each declaracion and download its file when generated.
- The 2181 is labelled as the annex of the 1376.
- States: both generated; only one generated; none generated; one with errors.

## Out of scope

- Editing a declaracion from the history view.

## Acceptance criteria

```gherkin
Scenario: Complete period
  Given a period has both declaraciones generated
  Then both are listed with a generated status
  And the period reads as complete

Scenario: Incomplete period
  Given a period has only the 2181 generated
  Then the 1376 is shown as pending
  And the period reads as incomplete

Scenario: Period with an error
  Given one declaracion of a period is in an error state
  Then that declaracion shows the error state in the list

Scenario: Reach detail and download
  Given a period with a generated declaracion
  When I open it from the period view
  Then I can see its detail and download its file
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

### Historia (1)

- [TD-45](https://lk-tudeclaracion.atlassian.net/browse/TD-45): Monthly Package | Generate the 2181 and 1376 for a period as a linked pair _(Tareas por hacer)_

---

## Metadata

- **Created:** 8/30/2026
- **Updated:** 8/30/2026
- **Reporter:** Juan Leites
- **Assignee:** Juan Leites
- **Labels:** form-1376, mvp2

---

_Synced from Jira by sync-jira-issues_
