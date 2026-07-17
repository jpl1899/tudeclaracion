# EPIC: Accountant Identity & Tenancy

**Jira Key:** [TD-2](https://lk-tudeclaracion.atlassian.net/browse/TD-2)
**Priority:** High
**Status:** Planificación
**Total Story Points:** 0

---

## Description

tuDeclaracion is a self-service platform for accountants managing DGI Uruguay tax declarations. This epic covers self-service account creation, login, and multi-company management for a single accountant identity — the identity and tenancy foundation the rest of the product depends on.

One human user maps to exactly one Cuenta. A Cuenta owns N Empresas (client companies), and every Empresa's data is strictly isolated from every other Empresa — enforced via row-level security scoped to `cuenta_id`, already implemented in the codebase.

This epic delivers the account and company-management flows an accountant needs before uploading a single declaration: signing up, signing in, and adding the client companies they manage.

---

## User Stories

| Key | Story | Points | Priority | Status |
| --- | ----- | ------ | -------- | ------ |
| [TD-4](https://lk-tudeclaracion.atlassian.net/browse/TD-4) | Signup | Create a self-service accountant account | - | Medium | Ready for QA-on QA |
| [TD-6](https://lk-tudeclaracion.atlassian.net/browse/TD-6) | Login | Sign in with account credentials | - | Medium | Finalizada |
| [TD-8](https://lk-tudeclaracion.atlassian.net/browse/TD-8) | Company Onboarding | Add a new client company under my account | - | Medium | Ready for QA-on QA |
| [TD-9](https://lk-tudeclaracion.atlassian.net/browse/TD-9) | Password Recovery | Reset a forgotten password | - | Medium | Ready for QA-on QA |

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
