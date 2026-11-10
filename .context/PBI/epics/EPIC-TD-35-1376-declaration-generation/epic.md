# EPIC: 1376 Declaration Generation

**Jira Key:** [TD-35](https://lk-tudeclaracion.atlassian.net/browse/TD-35)
**Priority:** Medium
**Status:** Tareas por hacer
**Total Story Points:** 0

---

## Description

## Epic goal

Process the monthly Memory TXT (the same file used for the 2181) through the 1376 engine: aggregate each account's balance for the period, match account to 1376 line code via the company mapping, total by line code with no RUT breakdown, and produce the plain-text file PADI imports.

## Pipeline position (ADR-0006)

Reuses the Parser unchanged; diverges after it. Does not reuse the 2181's plan-de-cuentas resolution, the RUT + PADI-code consolidation, or the 2181 exporter.

## Source

PRD/mvp-scope.md "MVP 2 - Track A", SRS/13-forms-1376.md, ADR-0006.

---

## User Stories

| Key | Story | Points | Priority | Status |
| --- | ----- | ------ | -------- | ------ |
| [TD-41](https://lk-tudeclaracion.atlassian.net/browse/TD-41) | 1376 Generation | Calculate line totals from the monthly TXT | - | Medium | Tareas por hacer |
| [TD-42](https://lk-tudeclaracion.atlassian.net/browse/TD-42) | 1376 Generation | Aggregate each account balance into its line code | - | Medium | Tareas por hacer |
| [TD-43](https://lk-tudeclaracion.atlassian.net/browse/TD-43) | 1376 Generation | Review the calculated totals before downloading | - | Medium | Tareas por hacer |
| [TD-44](https://lk-tudeclaracion.atlassian.net/browse/TD-44) | 1376 Generation | Download the code-and-amount file for PADI | - | Medium | Tareas por hacer |

---

## Planning

- [Feature Implementation Plan (Dev)](./feature-implementation-plan.md)
- [Feature Test Plan (QA)](./feature-test-plan.md)

---

## Metadata

- **Created:** 8/30/2026
- **Updated:** 8/30/2026
- **Reporter:** Juan Leites
- **Assignee:** Juan Leites

---

_Synced from Jira by sync-jira-issues_
