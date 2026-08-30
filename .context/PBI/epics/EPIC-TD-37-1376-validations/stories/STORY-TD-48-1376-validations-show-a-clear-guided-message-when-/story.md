# 1376 Validations | Show a clear guided message when the 1376 does not add up

**Jira Key:** [TD-48](https://lk-tudeclaracion.atlassian.net/browse/TD-48)
**Epic:** [TD-37](https://lk-tudeclaracion.atlassian.net/browse/TD-37) (1376 Validations)
**Type:** Historia
**Status:** Tareas por hacer
**Priority:** Medium
**Story Points:** -

---

## Overview

## User story

As a contador (Rosana), I want a clear message with guidance when something in the 1376 does not add up, with the same UX bar as the 2181.

## Context

Same principle as MVP 1: every error reaches the user with clear guidance on how to resolve it.

## Scope

- When the 1376 calculation cannot complete or produces an inconsistent result, show a message that states what is wrong and what to do about it.
- Consistent in tone and structure with the 2181's error messages.
- Covers at least: a TXT the Parser rejects; a mapping that references an account not present in the movements; an empty result (no mapped account had movement).

## Out of scope

- The specific catalog of tax-level consistency checks (depends on the confirmed line catalog and formulas).

## Acceptance criteria

```gherkin
Scenario: TXT cannot be parsed
  Given I upload a TXT the Parser rejects
  Then I see a guided message naming the problem
  And no totals are produced

Scenario: Empty result
  Given no mapped account had movement in the period
  Then I see a message that explains the empty result and what to check

Scenario: Consistent with the 2181
  Given any 1376 error message
  Then it follows the same structure as the 2181's: what happened, and how to fix it
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

- **Created:** 30/8/2026
- **Updated:** 30/8/2026
- **Reporter:** Juan Leites
- **Assignee:** Juan Leites
- **Labels:** form-1376, mvp2

---

_Synced from Jira by sync-jira-issues_
