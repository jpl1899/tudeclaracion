# EPIC: Company Configuration

**Jira Key:** [TD-3](https://lk-tudeclaracion.atlassian.net/browse/TD-3)
**Priority:** High
**Status:** Planificación
**Total Story Points:** 0

---

## Description

## Overview

This epic covers the configuration surface an accountant (Rosana Ferreira persona) needs before any tax-declaration work can start for a given client company: choosing which of her managed companies is active, and keeping that company's chart-of-accounts-to-fiscal-concept mapping current — the same mapping the Normalizer module (`06-normalizer.md`) consumes to translate each accounting entry into a DGI fiscal concept.

## Why it matters

Every downstream step in the pipeline — parsing, normalizing, validating, and generating the DJ 2181 — depends on operating against the correct company context (FR-05) and a company-specific account mapping (FR-04). Without this configuration layer, the platform has no way to know which client's data it is processing or how to classify that client's accounts.

## Scope bridge

This epic sits between tenancy (EPIC 1 — accountant accounts that manage multiple companies) and the file-processing pipeline (EPIC 3 onward — upload, parse, normalize, validate, generate). It does not itself process any file; it establishes the configuration state those later steps rely on.

---

## User Stories

| Key | Story | Points | Priority | Status |
| --- | ----- | ------ | -------- | ------ |
| [TD-5](https://lk-tudeclaracion.atlassian.net/browse/TD-5) | Company Selection | Choose the active client company before uploading a file | - | Medium | Finalizada |
| [TD-7](https://lk-tudeclaracion.atlassian.net/browse/TD-7) | Chart of Accounts | Load the initial account-to-fiscal-concept mapping for a company | - | Medium | Ready for QA-on QA |
| [TD-24](https://lk-tudeclaracion.atlassian.net/browse/TD-24) | Chart of Accounts | Tag each account with its VAT code (Código de IVA) | - | Medium | Planificación |
| [TD-25](https://lk-tudeclaracion.atlassian.net/browse/TD-25) | Chart of Accounts | Support the full 7-code PADI catalog (552/553) | - | Medium | Tareas por hacer |

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
