# EPIC: General Features

**Jira Key:** [TD-28](https://lk-tudeclaracion.atlassian.net/browse/TD-28)
**Priority:** Medium
**Status:** Planificación
**Total Story Points:** 0

---

## Description

This epic is a container for supporting and platform functionality that sits outside the tax-rules engine — the sequence of epics that carries a company's accounting file from upload through PADI export (Accountant Identity & Tenancy, Company Configuration, File Upload & Parsing, Normalization & Validation, PADI File Export, Tax Rules Engine & DJ 2181 Generation). Where those epics model the DJ 2181 processing pipeline itself, this epic holds everything around it: the marketing landing page, the cotizaciones (exchange-rate) UI, dashboard navigation, and similar cross-cutting or supporting surfaces that a user touches without those touchpoints being part of the declaration pipeline.

This epic is intentionally open-ended. It is not meant to be decomposed into a fixed set of stories up front — it is expected to grow incrementally as new non-engine tickets surface over the life of the product, each added as its own story under this epic rather than triggering a new epic per supporting feature.

---

## User Stories

| Key | Story | Points | Priority | Status |
| --- | ----- | ------ | -------- | ------ |
| [TD-29](https://lk-tudeclaracion.atlassian.net/browse/TD-29) | Landing | Present the product to prospective accountants before signup | - | Medium | En curso |
| [TD-30](https://lk-tudeclaracion.atlassian.net/browse/TD-30) | Company | View and edit an existing company's profile | - | Medium | Tareas por hacer |

---

## Planning

- [Feature Implementation Plan (Dev)](./feature-implementation-plan.md)
- [Feature Test Plan (QA)](./feature-test-plan.md)

---

## Metadata

- **Created:** 1/8/2026
- **Updated:** 1/8/2026
- **Reporter:** Juan Leites
- **Assignee:** Juan Leites
- **Labels:** post-mvp

---

_Synced from Jira by sync-jira-issues_
