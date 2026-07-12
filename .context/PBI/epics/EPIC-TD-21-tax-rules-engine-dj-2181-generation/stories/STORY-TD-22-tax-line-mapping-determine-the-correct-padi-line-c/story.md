# Tax Line Mapping | Determine the correct PADI line/code for each fiscal concept

**Jira Key:** [TD-22](https://lk-tudeclaracion.atlassian.net/browse/TD-22)
**Epic:** [TD-21](https://lk-tudeclaracion.atlassian.net/browse/TD-21) (Tax Rules Engine & DJ 2181 Generation)
**Type:** Historia
**Status:** Tareas por hacer
**Priority:** Medium
**Story Points:** -

---

## Overview

***Source spec******:*** FR-13

## User story

As Rosana Ferreira, I want each fiscal concept automatically mapped to its correct PADI line/code, so that I don't have to know DGI's line catalog by heart.

## Status: BLOCKED — 0% domain content specified

`SRS/08-tax-engine.md` documents this module's responsibility but confirms none of its rules: "Reglas concretas: qué concepto fiscal mapea a cada código PADI (502, 503, 504, 505, 506, 552, 553, y los que faltan...)" is listed under "Pendiente de confirmar," alongside whether the mapping depends only on the fiscal concept or also on other factors (third-party type, VAT regime, transaction amount), and how an unmapped fiscal concept is resolved. The file closes with: "No fabricar reglas tributarias — este archivo se completa a medida que el usuario las provea."

`Tax-rules/2181/mapping.md` — described in its own header as "la regla de negocio central del tax engine... el contenido real de las reglas configurables mencionadas en `business-model.md` como el activo diferencial del producto" — is itself empty of rules. It lists the same three open questions (full concept→casilla table, whether other factors apply, how an unresolved concept is handled) and states: "No fabricar reglas de mapeo — este archivo se completa a medida que el usuario las provea. Es, junto con `formulas.md`, el contenido más crítico y aún menos definido de todo `tax-rules/`."

This story cannot be estimated or built until `Tax-rules/2181/mapping.md` is populated with real DGI line/code mapping rules.

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
- **Updated:** 7/7/2026
- **Reporter:** Juan Leites
- **Assignee:** Juan Leites

---

_Synced from Jira by sync-jira-issues_
