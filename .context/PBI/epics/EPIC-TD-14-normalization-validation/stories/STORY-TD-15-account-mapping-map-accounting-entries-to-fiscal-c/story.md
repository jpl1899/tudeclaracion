# Account Mapping | Map accounting entries to fiscal concepts automatically

**Jira Key:** [TD-15](https://lk-tudeclaracion.atlassian.net/browse/TD-15)
**Epic:** [TD-14](https://lk-tudeclaracion.atlassian.net/browse/TD-14) (Normalization & Validation)
**Type:** Historia
**Status:** En curso
**Priority:** Medium
**Story Points:** -

---

## Overview

***Source spec******:*** FR-09

## User story

As Rosana Ferreira, I want each accounting entry automatically mapped to its fiscal concept, so that I don't have to classify transactions manually.

## Status: Unblocked (2026-07-16)

Both original blockers are resolved:

1. `TD-7` (Chart of Accounts) — mapping mechanism implemented and merged (`plan_cuentas` table, PR #7); story status is `Ready for QA-on QA`.
2. `06-normalizer.md`'s mapping-rule mechanism — confirmed 2026-07-14/15, and this story's own scope boundary confirmed 2026-07-16 (see the Acceptance Criteria + Business Rules + technical plan comment on this ticket): the Normalizer resolves each accounting entry directly to a PADI code, using the existing `plan_cuentas` configuration — no separate "Nombre de Impuesto" intermediate.

Scope note carried forward: this resolution may make `TD-22` (Tax Line Mapping) and part of `TD-23` (Amount Calculation) redundant — flagged for a separate backlog review, not blocking this story.

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

- **Created:** 7/7/2026
- **Updated:** 16/7/2026
- **Reporter:** Juan Leites
- **Assignee:** Juan Leites

---

_Synced from Jira by sync-jira-issues_
