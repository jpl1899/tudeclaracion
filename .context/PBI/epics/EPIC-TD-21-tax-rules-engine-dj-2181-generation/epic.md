# EPIC: Tax Rules Engine & DJ 2181 Generation

**Jira Key:** [TD-21](https://lk-tudeclaracion.atlassian.net/browse/TD-21)
**Priority:** High
**Status:** Planificación
**Total Story Points:** 0

---

## Description

This epic covers the Tax Rules Engine — the module positioned after the Validator and before the Form Builder in ADR-0001's pipeline (Upload Manager → Parser → Normalizer → Validator → Tax Rules Engine → Form Builder → Exporter). Given a validated, normalized fiscal concept, it determines the corresponding PADI line/code (FR-13) and calculates the declared amount for that line — IVA or total exempt purchase, depending on the code (FR-14). Per ADR-0001, the engine itself must be generic (multi-form capable); only the rules it loads from `tax-rules/2181/` are specific to this declaration.

This is the ADR-0001 differentiator: the explicit product decision is not to build "just the 2181," but a platform capable of supporting multiple DGI declarations, with the 2181 as the first implementation over a reusable architecture. NFR-06 and NFR-07 make this an architectural invariant, not an aspiration — the engine and generic modules must support future DGI forms without a redesign, and tax rules must be updatable (new DGI regulation) without a code deployment, because they live in `.context/tax-rules/`, separate from the engine.

***Status******:****** 0% domain content specified — the single biggest risk to the MVP timeline.*** `SRS/08-tax-engine.md` states plainly: "Estado: pendiente... todavía no tiene reglas concretas documentadas." `Tax-rules/2181/mapping.md` — "la regla de negocio central del tax engine... el contenido real de las reglas configurables" — is empty of rules, and `Tax-rules/2181/formulas.md` states "Ninguna fórmula de cálculo fue confirmada todavía." Both stories under this epic are created now, fully blocked, so the gap stays visible and trackable rather than hidden until later in the MVP timeline.

---

## User Stories

| Key | Story | Points | Priority | Status |
| --- | ----- | ------ | -------- | ------ |
| [TD-22](https://lk-tudeclaracion.atlassian.net/browse/TD-22) | Tax Line Mapping | Determine the correct PADI line/code for each fiscal concept | - | Medium | Tareas por hacer |
| [TD-23](https://lk-tudeclaracion.atlassian.net/browse/TD-23) | Amount Calculation | Calculate the declared amount for each PADI line | - | Medium | Tareas por hacer |

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
