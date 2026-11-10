# 1376 Validations | Warn about accounts with movement not mapped to a line code

**Jira Key:** [TD-47](https://lk-tudeclaracion.atlassian.net/browse/TD-47)
**Epic:** [TD-37](https://lk-tudeclaracion.atlassian.net/browse/TD-37) (1376 Validations)
**Type:** Historia
**Status:** Tareas por hacer
**Priority:** Medium
**Story Points:** -

---

## Overview

## User story

As a contador (Rosana), I want the system to warn me if an account with movement in the TXT is not mapped to any 1376 line code, so that I do not file incomplete totals.

## Context

Unlike the 2181 - where an unmapped account is ignored silently - the 1376 must surface it, because a missing account means a wrong total.

## Scope

- After processing the TXT, detect accounts that have movement in the period but no row in the company's 1376 mapping.
- Show these accounts in a warning that is impossible to miss before the file can be downloaded.
- The warning lists the specific unmapped accounts.
- The contador can go back to the mapping, fix it, and reprocess.

## Out of scope

- Auto-mapping the missing accounts.
- The aggregation rule (M2.4).

## Acceptance criteria

```gherkin
Scenario: Everything mapped
  Given the TXT is processed
  And every account with movement is mapped
  Then no warning is shown
  And the download is available

Scenario: Some accounts unmapped
  Given the TXT is processed
  And one or more accounts with movement have no mapping
  Then a warning lists those specific accounts
  And it is shown before the download

Scenario: Warning must be dealt with
  Given the unmapped-accounts warning is shown
  Then the download does not proceed until it is acknowledged or the mapping is fixed

Scenario: Fixing and reprocessing clears it
  Given an unmapped-accounts warning
  When I add the missing mappings and reprocess the TXT
  Then the warning clears
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

- [TD-41](https://lk-tudeclaracion.atlassian.net/browse/TD-41): 1376 Generation | Calculate line totals from the monthly TXT _(Tareas por hacer)_

---

## Metadata

- **Created:** 8/30/2026
- **Updated:** 8/30/2026
- **Reporter:** Juan Leites
- **Assignee:** Juan Leites
- **Labels:** form-1376, mvp2

---

_Synced from Jira by sync-jira-issues_
