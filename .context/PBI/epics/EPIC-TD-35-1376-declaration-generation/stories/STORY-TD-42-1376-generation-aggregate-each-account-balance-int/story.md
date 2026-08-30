# 1376 Generation | Aggregate each account balance into its line code

**Jira Key:** [TD-42](https://lk-tudeclaracion.atlassian.net/browse/TD-42)
**Epic:** [TD-35](https://lk-tudeclaracion.atlassian.net/browse/TD-35) (1376 Declaration Generation)
**Type:** Historia
**Status:** Tareas por hacer
**Priority:** Medium
**Story Points:** -

---

## Overview

## User story

As a contador (Rosana), I want the system to aggregate each account's balance (Debe minus Haber) and carry it to the 1376 line code I configured, so that I do not total accounts by hand.

## Status

***BLOCKED - needs contadora input.*** Same open question as M2.4: how an account's balance is computed from the TXT, where Debe / Haber are account codes rather than amounts. The 'Debe minus Haber' phrasing comes from the theoretical design (DJ 1376.xlsx); the concrete mapping to the TXT amount columns is unconfirmed.

This story is created so the backbone is traceable. It is NOT ready for development. No acceptance criteria are written yet because the behavior is undefined.

## Provisional scope (to confirm)

- For each account with movement, compute its period balance per its mapping side.
- Sum the balances by 1376 line code.

## Out of scope

- The Parser (reused as-is) and the file download.

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

- [TD-38](https://lk-tudeclaracion.atlassian.net/browse/TD-38): 1376 Mapping | Define the account-to-line matrix for a company _(Tareas por hacer)_

---

## Metadata

- **Created:** 30/8/2026
- **Updated:** 30/8/2026
- **Reporter:** Juan Leites
- **Assignee:** Juan Leites
- **Labels:** blocked, form-1376, mvp2, tax-engine

---

_Synced from Jira by sync-jira-issues_
