# EPIC: File Upload & Parsing

**Jira Key:** [TD-10](https://lk-tudeclaracion.atlassian.net/browse/TD-10)
**Priority:** High
**Status:** Planificación
**Total Story Points:** 0

---

## Description

The monthly Memory export is the entry point of the entire tuDeclaracion pipeline: an accountant cannot generate a DJ 2181 until the accounting-software TXT for the active company has been uploaded and turned into structured data the rest of the system can work with. This epic covers that entry point — uploading the file, confirming the upload succeeded, and interpreting its contents into the platform's internal data model.

Per the Parser invariant established in `ADR-0001` (modular pipeline architecture), this epic's scope is ***purely structural****: turning a TXT file into internal objects. It applies ****zero tax-rule logic*** — no fiscal-concept mapping, no validation of RUTs or amounts, no DGI rule evaluation. Those responsibilities belong to later pipeline stages (Normalizer, Validator, Tax Rules Engine) and are explicitly out of scope here, so that regulatory changes never force a rewrite of the upload/parsing layer.

One story in this epic is currently blocked: automatic interpretation of the uploaded file cannot be estimated or built with confidence until a real sample of the Memory export's TXT format (delimiter, field order, encoding) is provided — see `SRS/05-parser.md`.

---

## User Stories

| Key | Story | Points | Priority | Status |
| --- | ----- | ------ | -------- | ------ |
| [TD-11](https://lk-tudeclaracion.atlassian.net/browse/TD-11) | File Upload | Upload the monthly Memory export | - | Medium | Deployed |
| [TD-12](https://lk-tudeclaracion.atlassian.net/browse/TD-12) | File Upload | Confirm successful upload before processing starts | - | Medium | Ready for QA-on QA |
| [TD-13](https://lk-tudeclaracion.atlassian.net/browse/TD-13) | Automatic Interpretation | Process an uploaded file without manual edits | - | Medium | Ready for QA-on QA |
| [TD-31](https://lk-tudeclaracion.atlassian.net/browse/TD-31) | TXT Layout | Declare special columns before uploading a non-standard file | - | Medium | Tareas por hacer |

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
