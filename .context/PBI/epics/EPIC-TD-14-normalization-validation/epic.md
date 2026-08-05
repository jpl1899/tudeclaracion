# EPIC: Normalization & Validation

**Jira Key:** [TD-14](https://lk-tudeclaracion.atlassian.net/browse/TD-14)
**Priority:** High
**Status:** Planificación
**Total Story Points:** 0

---

## Description

This epic covers two adjacent pipeline modules from ADR-0001's pipeline (Upload Manager → Parser → Normalizer → Validator → Tax Rules Engine → Form Builder → Exporter): the ***Normalizer****, which maps each accounting entry to its fiscal concept using a company's chart of accounts (FR-09), and the ****Validator***, which checks structural correctness — RUT format and declared amounts — before any DGI tax rule is applied (FR-10, FR-11). Per ADR-0001, the Validator runs immediately before the Tax Rules Engine and must stay generic, not coupled to 2181-specific rules.

Together these modules form the quality gate between raw parsed data (produced by the Parser, out of scope for this epic) and tax-rule application. When validation fails, the system must surface a clear, actionable message identifying the specific problem (FR-12) — a confirmed MVP requirement, not deferrable.

Two of the four stories in this epic are currently blocked pending product/spec decisions: Account Mapping depends on the Chart-of-Accounts loading mechanism (TD-7, still undefined) and on `06-normalizer.md`'s own mapping-rule mechanism (also undefined). Amount Validation depends on DGI's minimum/range rules for the 2181 form, which are pendiente in both `07-validator.md` and `Tax-rules/2181/validations.md`. RUT Validation and Error Guidance are real, buildable work.

---

## User Stories

| Key | Story | Points | Priority | Status |
| --- | ----- | ------ | -------- | ------ |
| [TD-15](https://lk-tudeclaracion.atlassian.net/browse/TD-15) | Account Mapping | Map accounting entries to fiscal concepts automatically | - | Medium | Ready for QA-on QA |
| [TD-16](https://lk-tudeclaracion.atlassian.net/browse/TD-16) | RUT Validation | Validate declarant and third-party RUT format | - | Medium | Deployed |
| [TD-17](https://lk-tudeclaracion.atlassian.net/browse/TD-17) | Amount Validation | Validate declared amounts against DGI structural rules | - | Medium | Deployed |
| [TD-18](https://lk-tudeclaracion.atlassian.net/browse/TD-18) | Error Guidance | Receive a clear, actionable message when validation fails | - | Medium | Deployed |

---

## Planning

- [Feature Implementation Plan (Dev)](./feature-implementation-plan.md)
- [Feature Test Plan (QA)](./feature-test-plan.md)

---

## Metadata

- **Created:** 7/7/2026
- **Updated:** 7/7/2026
- **Reporter:** Juan Leites
- **Assignee:** Juan Leites
- **Labels:** mvp

---

_Synced from Jira by sync-jira-issues_
