# Company Onboarding | Add a new client company under my account

**Jira Key:** [TD-8](https://lk-tudeclaracion.atlassian.net/browse/TD-8)
**Epic:** [TD-2](https://lk-tudeclaracion.atlassian.net/browse/TD-2) (Accountant Identity & Tenancy)
**Type:** Historia
**Status:** Ready for QA-on QA
**Priority:** Medium
**Story Points:** -

---

## Overview

***Source spec******:*** FR-02, FR-03

## User story

As Rosana Ferreira, I want to add a new client company to my account, so that I can start managing its tax declarations.

## Definition of done

- New company created and associated with the authenticated accountant's account
- New company appears immediately in the company list
- Duplicate RUT is rejected with a clear message
- Required fields are validated before the company is created

> ***WARNING:*** The company selection screen (`companySelector.html`) already has a placeholder "+ Agregar nueva empresa" card, but there is no real form or flow behind it yet. This story builds that missing piece.

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
- **Updated:** 12/7/2026
- **Reporter:** Juan Leites
- **Assignee:** mathias Kantor

---

_Synced from Jira by sync-jira-issues_
