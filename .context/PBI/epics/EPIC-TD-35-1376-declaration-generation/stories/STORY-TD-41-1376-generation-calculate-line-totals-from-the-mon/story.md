# 1376 Generation | Calculate line totals from the monthly TXT

**Jira Key:** [TD-41](https://lk-tudeclaracion.atlassian.net/browse/TD-41)
**Epic:** [TD-35](https://lk-tudeclaracion.atlassian.net/browse/TD-35) (1376 Declaration Generation)
**Type:** Historia
**Status:** Tareas por hacer
**Priority:** Medium
**Story Points:** -

---

## Overview

## User story

As a contador (Rosana), I want to upload the monthly Memory TXT (the same one I use for the 2181) and have the system calculate the totals per 1376 line code.

## Status

***BLOCKED - needs contadora input.*** The rule for computing an account's balance from the 2181 TXT format is undefined. In that format the Debe / Haber fields are account codes, not amounts; amounts live in the Total / IVA fields. Undefined: which amount column feeds the balance, and whether it depends on the destination line code (analogous to the 2181's two Caminos). See .context/open-questions.md §1376 and SRS/13-forms-1376.md.

This story is created so the backbone is traceable. It is NOT ready for development. No acceptance criteria are written yet because the behavior is undefined.

## Provisional scope (to confirm)

- Reuse the existing Parser for the TXT (no change to its contract).
- Run the 1376 aggregation engine over the parsed movements.
- Produce one total per 1376 line code that has at least one mapped account with movement in the period.
- No RUT breakdown.

## Out of scope

- The review screen (M2.6) and the download (M2.7).
- Determining the liquidation / amount to pay (open question - the real example is totals only).

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

### Historias (4)

- [TD-38](https://lk-tudeclaracion.atlassian.net/browse/TD-38): 1376 Mapping | Define the account-to-line matrix for a company _(Tareas por hacer)_
- [TD-43](https://lk-tudeclaracion.atlassian.net/browse/TD-43): 1376 Generation | Review the calculated totals before downloading _(Tareas por hacer)_
- [TD-44](https://lk-tudeclaracion.atlassian.net/browse/TD-44): 1376 Generation | Download the code-and-amount file for PADI _(Tareas por hacer)_
- [TD-47](https://lk-tudeclaracion.atlassian.net/browse/TD-47): 1376 Validations | Warn about accounts with movement not mapped to a line code _(Tareas por hacer)_

---

## Metadata

- **Created:** 30/8/2026
- **Updated:** 30/8/2026
- **Reporter:** Juan Leites
- **Assignee:** Juan Leites
- **Labels:** blocked, form-1376, mvp2, tax-engine

---

_Synced from Jira by sync-jira-issues_
