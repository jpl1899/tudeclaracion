# Tax Line Mapping | Determine the correct PADI line/code for each fiscal concept

**Jira Key:** [TD-22](https://lk-tudeclaracion.atlassian.net/browse/TD-22)
**Epic:** [TD-21](https://lk-tudeclaracion.atlassian.net/browse/TD-21) (Tax Rules Engine & DJ 2181 Generation)
**Type:** Historia
**Status:** Finalizada
**Priority:** Medium
**Story Points:** -

---

## Overview

***Source spec******:*** FR-13

## User story

As Rosana Ferreira, I want each fiscal concept automatically mapped to its correct PADI line/code, so that I don't have to know DGI's line catalog by heart.

## Status: UNBLOCKED — domain rules confirmed (2026-07-14)

`SRS/08-tax-engine.md` and `Tax-rules/2181/mapping.md` previously listed "qué concepto fiscal mapea a cada código PADI" as pending, contador-only content. That gap is now closed: the contador confirmed the resolution chain (`Código IVA` field → per-company account configuration → fixed Nombre de Impuesto → PADI code table) and the complete 7-code catalog for the 2181 (502, 503, 504, 505, 506, 552, 553). Full rule set in this story's 2026-07-14 comment; written spec in `SRS/08-tax-engine.md`, `SRS/09-forms.md`, `SRS/06-normalizer.md`.

This story can now be estimated and built.

> ***NOTE:**** Implementation note: the Código IVA → account configuration is per-company (stored, editable — no conflict with NFR-07). The Nombre de Impuesto → PADI code catalog is ****fixed across all companies*** (the contador called it "hardcoded"), but to satisfy NFR-07 ("reglas tributarias deben poder actualizarse... sin requerir un despliegue de código") it should still be implemented as a DB-stored reference table, not literal `if/switch` conditionals in application code — "fixed" and "hardcoded in source" are not the same requirement here.

## Definition of done (includes configurability enabler)

Per NFR-06 ("El Tax Rules Engine... debe permitir agregar formularios DGI futuros sin rediseñar el sistema") and NFR-07 ("Las reglas tributarias deben poder actualizarse... sin requerir un despliegue de código"), and per ADR-0001's confirmed decision ("El motor debe ser configurable (reglas en DB, no hardcodeadas)"), the definition of done for this story requires that the mapping logic be implemented as ***configurable data*** — stored and updatable independently of application code — not hardcoded conditionals in the Tax Rules Engine module.

This DoD requirement absorbs `mvp-scope.md`'s US 5.3 ("Como responsable del producto, quiero que las reglas tributarias sean configurables... para poder actualizarlas cuando cambie la normativa DGI sin modificar código"). US 5.3 has no corresponding persona in `user-personas.md` — it is a product/architecture requirement, not a user-facing capability — so it is folded into this story's Definition of Done rather than tracked as a separate, persona-less backlog item.

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
