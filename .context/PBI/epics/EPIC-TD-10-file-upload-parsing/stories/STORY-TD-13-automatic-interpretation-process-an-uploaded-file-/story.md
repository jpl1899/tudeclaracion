# Automatic Interpretation | Process an uploaded file without manual edits

**Jira Key:** [TD-13](https://lk-tudeclaracion.atlassian.net/browse/TD-13)
**Epic:** [TD-10](https://lk-tudeclaracion.atlassian.net/browse/TD-10) (File Upload & Parsing)
**Type:** Historia
**Status:** Ready for QA-on QA
**Priority:** Medium
**Story Points:** -

---

## Overview

***Source spec******:*** FR-07

## User story

As Rosana Ferreira, I want the uploaded file to be automatically interpreted with zero manual edits, so that I save time compared to my current manual process.

## Status: Unblocked — 2026-07-16

Resolved. `SRS/05-parser.md` now documents the confirmed input format (delimiter, all 12 fields, and the Debe/Haber account-code correction), validated against a real Memory export file (`ASIENTOS JUNIO 2026.TXT`) with the accountant on 2026-07-15. The malformed-line/invalid-data behavior was confirmed 2026-07-16 (see the Acceptance Criteria + Business Rules comment on this issue). Ready for development.

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

- [TD-31](https://lk-tudeclaracion.atlassian.net/browse/TD-31): TXT Layout | Declare special columns before uploading a non-standard file _(Deployed)_

---

## Metadata

- **Created:** 7/7/2026
- **Updated:** 7/8/2026
- **Reporter:** Juan Leites
- **Assignee:** Unassigned

---

_Synced from Jira by sync-jira-issues_
