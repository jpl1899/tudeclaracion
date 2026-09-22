# 1376 Generation | Download the code-and-amount file for PADI

**Jira Key:** [TD-44](https://lk-tudeclaracion.atlassian.net/browse/TD-44)
**Epic:** [TD-35](https://lk-tudeclaracion.atlassian.net/browse/TD-35) (1376 Declaration Generation)
**Type:** Historia
**Status:** Tareas por hacer
**Priority:** Medium
**Story Points:** -

---

## Overview

## User story

As a contador (Rosana), I want to download the code-and-amount file ready to import into PADI, so that I do not build it by hand.

## Context

The export format is confirmed against a real PADI example (SRS/13-forms-1376.md, Exporter section): plain text, one row per line code, semicolon delimiter, no header, integer amounts with no thousands separator, no RUT and no period.

## Scope

- A download action on the reviewed-totals screen.
- File: plain text; one row per 1376 line code; fields separated by a semicolon; no header row; amount is an integer with no thousands separator; no RUT and no period anywhere in the file.
- The download proceeds only after any unmapped-accounts warning has been acknowledged (per M2.10).

## Out of scope

- The PADI upload itself.
- Determining the liquidation / amount to pay (open question).

## Acceptance criteria

```gherkin
Scenario: Download a clean file
  Given I am on the reviewed-totals screen with no outstanding warning
  When I download the 1376 file
  Then it has one row per line code
  And fields are separated by a semicolon
  And there is no header row
  And every amount is an integer with no thousands separator

Scenario: File carries no identifiers
  Given I have downloaded the 1376 file
  Then it contains no RUT and no period

Scenario: Download gated by an unmapped-accounts warning
  Given the totals screen shows an unmapped-accounts warning
  When I have not acknowledged it
  Then the download does not proceed
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
- [TD-45](https://lk-tudeclaracion.atlassian.net/browse/TD-45): Monthly Package | Generate the 2181 and 1376 for a period as a linked pair _(Tareas por hacer)_

---

## Metadata

- **Created:** 8/30/2026
- **Updated:** 8/30/2026
- **Reporter:** Juan Leites
- **Assignee:** Juan Leites
- **Labels:** exporter, form-1376, mvp2

---

_Synced from Jira by sync-jira-issues_
