# 1376 Mapping | Define the account-to-line matrix for a company

**Jira Key:** [TD-38](https://lk-tudeclaracion.atlassian.net/browse/TD-38)
**Epic:** [TD-34](https://lk-tudeclaracion.atlassian.net/browse/TD-34) (1376 Account Mapping)
**Type:** Historia
**Status:** Tareas por hacer
**Priority:** Medium
**Story Points:** -

---

## Overview

## User story

As a contador (Rosana), I want to define, per company, which accounting account maps to each 1376 form line code and whether it is taken from the Debe or the Haber, so that the engine can total the declaration automatically.

## Context

A new configuration surface: one matrix per company. Each row links an accounting account, a Debe / Haber side, and a 1376 line code. The line code is entered by the contador (their own value from the form design) - it is not picked from a system catalog, so this story does not depend on the DGI line catalog.

## Scope

- A per-company screen to view and build the mapping matrix.
- Add a row: pick an accounting account, choose Debe or Haber, enter the 1376 line code the account's balance feeds.
- Save the matrix; leave without saving and keep the previous state.
- Confirmation on save; a clear guided message when a row is incomplete or invalid.
- The screen makes it unmistakable that this configuration is separate from the company's plan de cuentas used for the 2181.

## Out of scope

- The suggested base mapping (US M2.3).
- Editing an existing saved matrix as its own flow (US M2.2).
- Running the engine or producing totals (EPIC-M2-02).
- Version history of the mapping.

## Acceptance criteria

```gherkin
Scenario: Company with no mapping yet
  Given I open the 1376 mapping screen for a company that has no mapping
  Then I see an empty matrix
  And I can add a first row

Scenario: Add a complete row and save
  Given I am building a company's 1376 mapping
  When I add a row with an accounting account, a Debe or Haber side, and a 1376 line code
  And I save
  Then I see a save confirmation
  And the row is still there when I reopen the screen

Scenario: Save with an incomplete row
  Given I have a row missing the account, the side, or the line code
  When I try to save
  Then the save is blocked
  And the message names which field is missing
  And nothing is persisted

Scenario: Leave without saving
  Given I have added or changed rows
  When I leave the screen without saving
  Then none of my changes are persisted

Scenario: Distinct from the 2181 plan de cuentas
  Given I am on the 1376 mapping screen
  Then it is clearly labelled as separate from the plan de cuentas used for the 2181
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

- [TD-41](https://lk-tudeclaracion.atlassian.net/browse/TD-41): 1376 Generation | Calculate line totals from the monthly TXT _(Tareas por hacer)_
- [TD-42](https://lk-tudeclaracion.atlassian.net/browse/TD-42): 1376 Generation | Aggregate each account balance into its line code _(Tareas por hacer)_

---

## Metadata

- **Created:** 30/8/2026
- **Updated:** 30/8/2026
- **Reporter:** Juan Leites
- **Assignee:** Juan Leites
- **Labels:** form-1376, mvp2

---

_Synced from Jira by sync-jira-issues_
