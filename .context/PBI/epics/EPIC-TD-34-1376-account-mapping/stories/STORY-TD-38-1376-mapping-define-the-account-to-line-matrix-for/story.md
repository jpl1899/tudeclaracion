# 1376 Mapping | Define the account-to-line matrix for a company

**Jira Key:** [TD-38](https://lk-tudeclaracion.atlassian.net/browse/TD-38)
**Epic:** [TD-34](https://lk-tudeclaracion.atlassian.net/browse/TD-34) (1376 Account Mapping)
**Type:** Historia
**Status:** Deployed
**Priority:** Medium
**Story Points:** -

---

## Overview

## User story

As a contador (Rosana), I want to define, per company, which single accounting account feeds each 1376 form line code — from the Debe or the Haber, and from the TXT `Total` or `IVA` amount column — so that the engine can total the declaration automatically.

## Context

A new configuration surface: one mapping per company, separate from the plan de cuentas used for the 2181.

The screen is driven by a catalog of 1376 line codes. Each line code is a fixed row (code + fiscal concept). For each line code the contador assigns exactly one accounting account plus how its balance is read from the monthly TXT.

The line-code catalog is seeded provisionally from the design example (`DJ 1376.xlsx`) and is not yet validated against DGI's official per-rubro catalog. It lives as configurable data (DB table) so it can be corrected later without code changes.

## Line-code catalog (provisional seed)

| Code | Concept |
| --- | --- |
| 101 | Ventas gravadas tasa basica (22%) |
| 102 | Ventas gravadas tasa minima (10%) |
| 103 | Ventas no gravadas / exentas |
| 201 | Costo de ventas gravadas |
| 301 | Gastos de personal / sueldos |
| 302 | Arrendamientos pagados |
| 501 | Credito fiscal IVA compras |
| 502 | Debito fiscal IVA ventas |
| 510 | Anticipos de IRAE del ejercicio |
| 601 | Disponibilidades (Activo) |

## Scope

- A per-company screen that lists the 1376 line-code catalog as fixed rows (code + concept).
- Per line-code row, assign: one accounting account (from the company's chart of accounts), a Debe / Haber side, and an amount column (`Total` for asientos abiertos, `IVA` for the Memory Conty "formato rapido").
- Bijective constraint: a line code has at most one account, and an account is used by at most one line code. Assigning an account already mapped elsewhere is blocked with a guided message.
- A line code left with no account is allowed — it simply produces no total.
- Save the mapping; leave without saving and keep the previous state.
- Confirmation on save; a clear guided message when an assignment is incomplete or invalid.
- The screen makes it unmistakable that this configuration is separate from the company's plan de cuentas used for the 2181.

## Out of scope

- The suggested base mapping (TD-40).
- Editing an existing saved mapping as its own dedicated flow (TD-39).
- Running the engine or producing totals (EPIC TD-35).
- Version history of the mapping.
- Sourcing DGI's official line-code catalog (tracked as an open question; the seed above stands until it arrives).

## Acceptance criteria

```gherkin
Scenario: Company with no mapping yet
  Given I open the 1376 mapping screen for a company that has no mapping
  Then I see every line-code row with no account assigned
  And I can assign an account to any row

Scenario: Assign an account to a line code and save
  Given I am editing a company's 1376 mapping
  When I assign an accounting account, a Debe or Haber side, and an amount column (Total or IVA) to a line-code row
  And I save
  Then I see a save confirmation
  And the assignment is still there when I reopen the screen

Scenario: An account cannot map to two line codes
  Given accounting account X is already assigned to line code 502
  When I try to assign account X to line code 501
  Then the save is blocked
  And the message says account X is already mapped to line code 502
  And nothing is persisted

Scenario: Save an incomplete assignment
  Given a row has an accounting account but no side or no amount column
  When I try to save
  Then the save is blocked
  And the message names the missing field
  And nothing is persisted

Scenario: Leave without saving
  Given I have assigned or changed rows
  When I leave the screen without saving
  Then none of my changes are persisted

Scenario: Distinct from the 2181 plan de cuentas
  Given I am on the 1376 mapping screen
  Then it is clearly labelled as separate from the plan de cuentas used for the 2181
```

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

## Traceability

### Historias (2)

- [TD-41](https://lk-tudeclaracion.atlassian.net/browse/TD-41): 1376 Generation | Calculate line totals from the monthly TXT _(Tareas por hacer)_
- [TD-42](https://lk-tudeclaracion.atlassian.net/browse/TD-42): 1376 Generation | Aggregate each account balance into its line code _(Tareas por hacer)_

---

## Metadata

- **Created:** 8/30/2026
- **Updated:** 9/16/2026
- **Reporter:** Juan Leites
- **Assignee:** Juan Leites
- **Labels:** form-1376, mvp2

---

_Synced from Jira by sync-jira-issues_
