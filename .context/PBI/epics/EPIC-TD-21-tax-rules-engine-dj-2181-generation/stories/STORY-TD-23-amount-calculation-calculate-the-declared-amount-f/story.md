# Amount Calculation | Calculate the declared amount for each PADI line

**Jira Key:** [TD-23](https://lk-tudeclaracion.atlassian.net/browse/TD-23)
**Epic:** [TD-21](https://lk-tudeclaracion.atlassian.net/browse/TD-21) (Tax Rules Engine & DJ 2181 Generation)
**Type:** Historia
**Status:** Tareas por hacer
**Priority:** Medium
**Story Points:** -

---

## Overview

***Source spec******:*** FR-14

## User story

As Rosana Ferreira, I want the declared amount for each PADI line calculated automatically, so that I don't have to compute IVA/totals by hand.

## Status: BLOCKED — 0% domain content specified

`Tax-rules/2181/formulas.md` confirms no calculation rule exists yet: "Estado: pendiente. Ninguna fórmula de cálculo fue confirmada todavía." Its open questions include how each casilla's amount is derived from normalized accounting entries (e.g. direct sum of discriminated IVA for the period's entries for that concept? does a percentage/rate apply?), which IVA rate (básica, mínima, exenta) determines routing to a given casilla, and how the final amount is rounded before export. It closes with: "No fabricar fórmulas — este archivo se completa a medida que el usuario las provea."

`Tax-rules/common/iva.md` does not confirm the rates either — it is explicitly "pendiente de confirmación por el usuario" and states the general-knowledge content about Uruguay having a tasa básica, tasa mínima, and exempt operations is "especulativo / conocimiento general, no verificado contra fuente oficial actual... no asumir un porcentaje sin verificarlo con el usuario o fuente oficial de DGI." The one confirmed fact is structural, not a rate: field 7 of the 2181 output represents "IVA o total de compra exenta" — i.e., the casilla determines whether the amount is a discriminated IVA figure or an exempt-purchase total, not which percentage applies.

This story cannot be estimated or built until `Tax-rules/2181/formulas.md` and `Tax-rules/common/iva.md` are populated with real calculation formulas and confirmed IVA rates.

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
- **Updated:** 7/7/2026
- **Reporter:** Juan Leites
- **Assignee:** Juan Leites

---

_Synced from Jira by sync-jira-issues_
