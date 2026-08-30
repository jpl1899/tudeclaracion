# EPIC: 1376 Account Mapping

**Jira Key:** [TD-34](https://lk-tudeclaracion.atlassian.net/browse/TD-34)
**Priority:** Medium
**Status:** Tareas por hacer
**Total Story Points:** 0

---

## Description

## Epic goal

Per-company configuration matrix that maps each accounting account to a 1376 form line code and a Debe / Haber side, so the generation engine can total the declaration automatically.

## Why it is separate

This matrix is distinct from the 2181's plan de cuentas: different semantics (Debe / Haber, net balance, no RUT breakdown). A company keeps the two configurations separately.

## Invariant (ADR-0006)

1376 processing is by aggregated accounting account, never by tercero / RUT. No story under this epic may introduce a RUT breakdown or reuse the 2181's plan-de-cuentas resolution.

## Source

PRD/mvp-scope.md "MVP 2 - Track A", SRS/13-forms-1376.md, ADR-0006.

---

## User Stories

| Key | Story | Points | Priority | Status |
| --- | ----- | ------ | -------- | ------ |
| [TD-38](https://lk-tudeclaracion.atlassian.net/browse/TD-38) | 1376 Mapping | Define the account-to-line matrix for a company | - | Medium | Tareas por hacer |
| [TD-39](https://lk-tudeclaracion.atlassian.net/browse/TD-39) | 1376 Mapping | Edit the mapping when the chart of accounts changes | - | Medium | Tareas por hacer |
| [TD-40](https://lk-tudeclaracion.atlassian.net/browse/TD-40) | 1376 Mapping | Start from a suggested base mapping | - | Medium | Tareas por hacer |

---

## Planning

- [Feature Implementation Plan (Dev)](./feature-implementation-plan.md)
- [Feature Test Plan (QA)](./feature-test-plan.md)

---

## Metadata

- **Created:** 30/8/2026
- **Updated:** 30/8/2026
- **Reporter:** Juan Leites
- **Assignee:** Juan Leites

---

_Synced from Jira by sync-jira-issues_
