# 1376 Generation | Review the calculated totals before downloading

**Jira Key:** [TD-43](https://lk-tudeclaracion.atlassian.net/browse/TD-43)
**Epic:** [TD-35](https://lk-tudeclaracion.atlassian.net/browse/TD-35) (1376 Declaration Generation)
**Type:** Historia
**Status:** Tareas por hacer
**Priority:** Medium
**Story Points:** -

---

## Overview

## User story

As a contador (Rosana), I want to review the calculated totals (IVA ventas, IVA compras, anticipos, etc.) before downloading, so that I can catch a wrong number before it reaches PADI.

## Context

A review screen analogous to the 2181's declaration detail. It shows the engine result once the monthly TXT is processed. The engine numbers themselves come from M2.4 / M2.5; this story is about how the review screen behaves.

## Scope

- A result view listing the amount per 1376 line code that received movement in the period.
- The view states these totals are aggregated by account, with no RUT breakdown (unlike the 2181).
- When present, an unmissable warning listing accounts with movement in the TXT that are not mapped to any line code (see M2.10), shown before the download is available.
- A clear guided message if the calculation does not complete (same UX bar as the 2181).
- States: processing; result with no warnings; result with an unmapped-accounts warning; calculation error; no data yet.

## Out of scope

- The download action itself (M2.7).
- The aggregation rule (M2.4 / M2.5).

## Acceptance criteria

```gherkin
Scenario: Clean result
  Given the monthly TXT is processed
  And every account with movement is mapped to a line code
  Then I see the total per 1376 line code
  And no warning is shown
  And the download is available

Scenario: Result with unmapped accounts
  Given the monthly TXT is processed
  And some accounts with movement are not mapped
  Then I see a warning listing those accounts
  And I cannot reach the download without acknowledging it

Scenario: No data yet
  Given no TXT has been processed for this period
  Then I see an empty state explaining what to do

Scenario: Calculation error
  Given the 1376 calculation cannot complete
  Then I see a guided message
  And no totals and no download are shown

Scenario: Aggregation is stated
  Given I am on the totals review screen
  Then it states the totals are by account, without RUT
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

- **Created:** 30/8/2026
- **Updated:** 30/8/2026
- **Reporter:** Juan Leites
- **Assignee:** Juan Leites
- **Labels:** form-1376, mvp2

---

_Synced from Jira by sync-jira-issues_
