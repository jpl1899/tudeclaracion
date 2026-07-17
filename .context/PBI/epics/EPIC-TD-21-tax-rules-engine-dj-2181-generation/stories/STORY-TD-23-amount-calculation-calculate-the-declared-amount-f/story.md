# Amount Calculation | Calculate the declared amount for each PADI line

**Jira Key:** [TD-23](https://lk-tudeclaracion.atlassian.net/browse/TD-23)
**Epic:** [TD-21](https://lk-tudeclaracion.atlassian.net/browse/TD-21) (Tax Rules Engine & DJ 2181 Generation)
**Type:** Historia
**Status:** Planificación
**Priority:** Medium
**Story Points:** -

---

## Overview

***Source spec******:*** FR-14

## User story

As Rosana Ferreira, I want the declared amount for each PADI line calculated automatically, so that I don't have to compute IVA/totals by hand.

## Status: UNBLOCKED — domain rules confirmed (2026-07-14)

`Tax-rules/2181/formulas.md` previously confirmed no calculation rule existed. That gap is now closed: the contador confirmed the amount rule per asiento — `Código IVA > 0` reads the ***IVA**** column ("formato rápido"), `Código IVA = 0` reads the ****Total*** column ("asiento abierto", already resolved from Debe/Haber) — plus RUT-based grouping (repeated RUTs consolidate into one declared line, summing IVA) and a priority override when the optional `Tipo` field equals `504` (compra exenta, RUT + Total, no other lookup needed). Full rule set in this story's 2026-07-14 comment; written spec in `SRS/08-tax-engine.md`, `SRS/05-parser.md`.

This story can now be estimated and built.

> ***INFO:*** Still open (does not block this story): mínimos DGI, valid amount range (¿acepta cero/negativos?), and rounding before export — tracked in `SRS/07-validator.md`, not yet contador-confirmed.

## Definition of done (includes configurability enabler)

Per NFR-06 and NFR-07, and per ADR-0001's confirmed decision that the engine must be configurable (rules in DB, not hardcoded), the definition of done for this story requires that the amount-calculation formulas be implemented as ***configurable data*** — stored and updatable independently of application code — not hardcoded arithmetic in the Tax Rules Engine module.

This DoD requirement absorbs the same `mvp-scope.md` US 5.3 configurability requirement folded into the sibling story (Tax Line Mapping, FR-13) — it is not duplicated as a separate story here; both stories share one configurability enabler applied to their respective rule type (mapping rules vs. calculation formulas).

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
- **Updated:** 16/7/2026
- **Reporter:** Juan Leites
- **Assignee:** Juan Leites

---

_Synced from Jira by sync-jira-issues_
