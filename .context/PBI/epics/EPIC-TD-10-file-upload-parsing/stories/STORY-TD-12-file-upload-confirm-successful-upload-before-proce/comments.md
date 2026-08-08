# Comments for TD-12

[View in Jira](https://lk-tudeclaracion.atlassian.net/browse/TD-12)

---

### Juan Leites - 7/7/2026, 20:01:47

## Acceptance Criteria

```gherkin
Scenario: Successful upload confirmation shown
  Given Rosana has uploaded a valid file
  When the upload completes successfully
  Then she sees a confirmation that the upload succeeded
  And the confirmation shows the uploaded filename and the upload timestamp

Scenario: Upload failure shown distinctly
  Given Rosana attempts to upload a file
  When the upload does not complete successfully
  Then she sees a failure state that is visually and textually distinct from the success confirmation
  And she is not led to believe processing has started

Scenario: Confirmation includes filename and timestamp
  Given a file has just uploaded successfully
  When Rosana views the confirmation
  Then it displays the exact filename she uploaded
  And it displays the date and time the upload completed
```

---

### Juan Leites - 7/7/2026, 20:01:48

## Scope

- Post-upload confirmation feedback for both the success and failure states
- Filename and timestamp displayed as part of the success confirmation

---

### Juan Leites - 7/7/2026, 20:01:49

## Out Of Scope

- Processing status or progress indication for the parsing pipeline itself
- Retrying a failed upload automatically

---

### Juan Leites - 17/7/2026, 14:39:12

## Spec Implementation Plan (Dev) — confirmed 2026-07-17

Spec-only build (D7, no mockup), same pattern as TD-11.

### Technical plan

- Extend ImportarAsientoDialog (src/components/importar-asiento-dialog.tsx): on a successful import (onImportar resolves null), instead of immediately closing the dialog, show a confirmation state -- filename + upload timestamp (Date.now() at success), success-toned (border-success/bg-success-bg, mirrors the existing error-state styling but with the success token pair). A single close button dismisses it, resetting state.
- Failure state already exists and is visually/textually distinct (error banner, dialog stays open) -- covered by AC scenario 2 already, no change needed there.
- No schema, no new route -- same modal, same shell, per D7.

## Review Workload Forecast

Estimated: ~40 additions = ~40 total lines (component change only)
400-line budget risk: Low
Chain strategy: stacked-to-main (feature/TD-7-plan-cuentas-rework)
Decision needed before apply: No

---


_Synced from Jira by sync-jira-issues_
