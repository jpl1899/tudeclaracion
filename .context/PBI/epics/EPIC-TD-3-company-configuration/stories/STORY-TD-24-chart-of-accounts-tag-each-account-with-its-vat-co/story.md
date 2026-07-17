# Chart of Accounts | Tag each account with its VAT code (Código de IVA)

**Jira Key:** [TD-24](https://lk-tudeclaracion.atlassian.net/browse/TD-24)
**Epic:** [TD-3](https://lk-tudeclaracion.atlassian.net/browse/TD-3) (Company Configuration)
**Type:** Historia
**Status:** Finalizada
**Priority:** Medium
**Story Points:** -

---

## Overview

***Source spec******:*** FR-04

## User story

As Rosana Ferreira, I want to tag each account in my client's chart of accounts with its Código de IVA, so that the Tax Rules Engine can automatically resolve the correct PADI code for the transactions posted to that account.

## Status: Ready to build — domain rule confirmed (2026-07-14)

The contador confirmed the resolution chain for the Tax Rules Engine (see TD-22/TD-23): each accounting entry's `Código IVA` field is matched against a per-company configuration that already maps ***Nombre de Impuesto ↔ Número de Cuenta**** (delivered in TD-7/TD-8, now in QA). That configuration is currently a two-column table and is missing the third column needed to close the loop: ****Código de IVA***.

This story adds that missing column to the existing chart-of-accounts table, so each account row can be tagged with its Código de IVA value alongside its Nombre de Impuesto and Número de Cuenta. Full rule set: `SRS/06-normalizer.md`, `SRS/08-tax-engine.md`.

> ***INFO:**** "Compras exentas" is a confirmed exception: it can span ****several*** account rows (different exempt goods, e.g. gasoil, leche, carne — each its own account) that all share the same Nombre de Impuesto. The table must allow repeating Nombre de Impuesto across rows, not enforce 1:1.

## Definition of done

- New editable field/column "Código de IVA" added to the chart-of-accounts table already shipped in TD-7/TD-8, following the same visual/interaction pattern as the existing columns (Nombre de Impuesto, Número de Cuenta).
- Consistent with the live UI already in production for this table (Rule 14 live-UI-first) — no new screen, an addition to the existing one.

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

- **Created:** 14/7/2026
- **Updated:** 16/7/2026
- **Reporter:** Juan Leites
- **Assignee:** Juan Leites
- **Labels:** mvp

---

_Synced from Jira by sync-jira-issues_
