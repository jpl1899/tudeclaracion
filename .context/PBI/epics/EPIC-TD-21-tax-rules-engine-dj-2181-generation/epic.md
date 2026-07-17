# EPIC: Tax Rules Engine & DJ 2181 Generation

**Jira Key:** [TD-21](https://lk-tudeclaracion.atlassian.net/browse/TD-21)
**Priority:** High
**Status:** Planificación
**Total Story Points:** 0

---

## Description

This epic covers the Tax Rules Engine — the module positioned after the Validator and before the Form Builder in ADR-0001's pipeline (Upload Manager → Parser → Normalizer → Validator → Tax Rules Engine → Form Builder → Exporter). Given a validated, normalized fiscal concept, it determines the corresponding PADI line/code (FR-13) and calculates the declared amount for that line — IVA or total exempt purchase, depending on the code (FR-14). Per ADR-0001, the engine itself must be generic (multi-form capable); only the rules it loads from tax-rules/2181/ are specific to this declaration.

This is the ADR-0001 differentiator: the explicit product decision is not to build "just the 2181," but a platform capable of supporting multiple DGI declarations, with the 2181 as the first implementation over a reusable architecture. NFR-06 and NFR-07 make this an architectural invariant, not an aspiration — the engine and generic modules must support future DGI forms without a redesign, and tax rules must be updatable (new DGI regulation) without a code deployment, because they live in `.context/tax-rules/`, separate from the engine.

## Status: UNBLOCKED — core domain rules confirmed (2026-07-14)

The domain gap that made this epic "0% domain content specified" is closed. In an in-person session with the accountant, the full resolution chain was confirmed: PADI line/code mapping (TD-22) and declared-amount calculation (TD-23). Full rule detail lives in the 2026-07-14 comments on TD-22 and TD-23; written spec in `SRS/05-parser.md`, `SRS/06-normalizer.md`, `SRS/08-tax-engine.md`, `SRS/09-forms.md`.

***Confirmed 2026-07-15***: the optional `Tipo` field (12th column) is scoped to the numeric value `504` only. The alphabetic values (`CIE`, `RES`, `DIF`, `APE`) are definitively out of scope for this engine — not a pending item to revisit, a closed exclusion.

***Still open*** (does not block TD-22/TD-23, tracked for a follow-up session with the accountant):

- Real example line from the source TXT, encoding, malformed-line handling, expected file volume (`SRS/05-parser.md`).
- DGI minimums, valid amount range, period validation, block-vs-exclude-line mechanics, error-guide content (`SRS/07-validator.md`).

***Related risk*** (tracked separately, not on this epic): TD-7 (Chart of Accounts) was found to have a schema/business-rule mismatch against the accountant's confirmed rules — see TD-7/TD-24 for the resolution.

---

## User Stories

| Key | Story | Points | Priority | Status |
| --- | ----- | ------ | -------- | ------ |
| [TD-22](https://lk-tudeclaracion.atlassian.net/browse/TD-22) | Tax Line Mapping | Determine the correct PADI line/code for each fiscal concept | - | Medium | Finalizada |
| [TD-23](https://lk-tudeclaracion.atlassian.net/browse/TD-23) | Amount Calculation | Calculate the declared amount for each PADI line | - | Medium | Planificación |

---

## Planning

- [Feature Implementation Plan (Dev)](./feature-implementation-plan.md)
- [Feature Test Plan (QA)](./feature-test-plan.md)

---

## Metadata

- **Created:** 7/7/2026
- **Updated:** 15/7/2026
- **Reporter:** Juan Leites
- **Assignee:** Juan Leites
- **Labels:** mvp

---

_Synced from Jira by sync-jira-issues_
