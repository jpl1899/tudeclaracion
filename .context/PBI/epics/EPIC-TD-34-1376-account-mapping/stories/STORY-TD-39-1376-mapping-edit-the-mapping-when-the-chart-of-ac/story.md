# 1376 Mapping | Edit the mapping when the chart of accounts changes

**Jira Key:** [TD-39](https://lk-tudeclaracion.atlassian.net/browse/TD-39)
**Epic:** [TD-34](https://lk-tudeclaracion.atlassian.net/browse/TD-34) (1376 Account Mapping)
**Type:** Historia
**Status:** Finalizada
**Priority:** Medium
**Story Points:** -

---

## Overview

## User story

As a contador (Rosana), I want to edit an existing 1376 mapping matrix when the company's chart of accounts changes, so that the totals stay correct.

## Context

Follows M2.1. Same matrix, same validation and confirmation rules; this story is the maintenance flow over an existing configuration.

## Scope

- Open a company's existing 1376 matrix with its rows preloaded.
- Edit a row's account, side, or line code.
- Add rows and remove rows.
- Save the changes; cancel and leave the matrix unchanged.
- Same validation and save confirmation as M2.1.

## Out of scope

- Version history / audit of the mapping (open question).
- The suggested base mapping (US M2.3).

## Acceptance criteria

```gherkin
Scenario: Open an existing matrix
  Given a company has a saved 1376 mapping
  When I open the mapping screen
  Then its rows are preloaded

Scenario: Change a row and save
  Given I am editing a saved 1376 mapping
  When I change a row's line code and save
  Then the new value persists

Scenario: Remove a row and save
  Given I am editing a saved 1376 mapping
  When I remove a row and save
  Then that row is gone when I reopen the screen

Scenario: Cancel after edits
  Given I have changed rows
  When I cancel
  Then the matrix is unchanged

Scenario: Make a row incomplete and save
  Given I clear a required field on a row
  When I try to save
  Then the save is blocked with guidance on the missing field
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

## Metadata

- **Created:** 8/30/2026
- **Updated:** 9/17/2026
- **Reporter:** Juan Leites
- **Assignee:** Juan Leites
- **Labels:** form-1376, mvp2

---

_Synced from Jira by sync-jira-issues_
