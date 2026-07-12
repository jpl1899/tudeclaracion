# EPIC: PADI File Export

**Jira Key:** [TD-19](https://lk-tudeclaracion.atlassian.net/browse/TD-19)
**Priority:** High
**Status:** Planificación
**Total Story Points:** 0

---

## Description

## Overview

Generates and delivers the DGI-compatible PADI output file for the Declaración Jurada 2181, once the tax rules engine (EPIC 5) has mapped and calculated every declaration line. This is the final step in the pipeline: turn fully-processed declaration data into a downloadable TXT file the accountant submits directly to DGI.

## Why this epic is low-risk

Unlike every other module in the SRS, the ***Exporter is the only one confirmed against a real validated sample file*** (`SRS/10-exporter.md`). The 7-field structure, delimiter, line format, and a real worked example were checked field-by-field by the user. The only open item is whether the amount field (campo 7) carries implicit decimals — a precision detail that affects acceptance-criteria wording, not the epic's viability.

This epic's stories are ready for implementation as soon as its upstream dependency exists: EPIC 5's tax-line mapping and amount calculation, which produces the data this module formats and exports.

## Scope

- Generate the PADI-format TXT file from processed declaration data (FR-15).
- Trigger and serve the file download once processing completes without errors (FR-16).

---

## User Stories

| Key | Story | Points | Priority | Status |
| --- | ----- | ------ | -------- | ------ |
| [TD-20](https://lk-tudeclaracion.atlassian.net/browse/TD-20) | PADI Export | Download the generated PADI-compatible file | - | Medium | Tareas por hacer |

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
