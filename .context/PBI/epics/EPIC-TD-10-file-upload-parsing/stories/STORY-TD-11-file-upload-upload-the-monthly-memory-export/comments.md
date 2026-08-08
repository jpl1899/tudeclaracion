# Comments for TD-11

[View in Jira](https://lk-tudeclaracion.atlassian.net/browse/TD-11)

---

### Juan Leites - 7/7/2026, 20:00:21

## Acceptance Criteria

```gherkin
Scenario: Happy path upload
  Given Rosana has selected the active company
  When she selects a valid Memory export TXT file
  And she confirms the upload
  Then the file is accepted for processing

Scenario: Wrong file type rejected
  Given Rosana has selected the active company
  When she selects a file that is not a TXT export
  Then she sees an error message telling her the file type is not supported
  And no file is uploaded

Scenario: Upload without a selected company rejected
  Given Rosana has not selected an active company
  When she tries to upload a file
  Then she sees an error message telling her to select a company first
  And no file is uploaded
```

---

### Juan Leites - 7/7/2026, 20:00:22

## Scope

- File selection and upload for the active company
- Basic file-type check on the selected file before accepting the upload

---

### Juan Leites - 7/7/2026, 20:00:23

## Out Of Scope

- Parsing and interpreting the uploaded file's contents (separate story)
- Structural validation of the file's contents (separate epic)
- Batch upload of multiple files at once

---

### Juan Leites - 14/7/2026, 11:36:59

## Spec Implementation Plan (Dev)

***Ticket******:*** TD-11 — File Upload | Upload the monthly Memory export
***Fidelity note******:*** §5 D5 ratified spec-only build (no mockup exists for the upload wizard) — see `master-design-plan.md` §5.

### Goal

Replace the placeholder `alert()`-style text under "Iniciar nueva declaración" (`src/app/dashboard/page.tsx`) with a real "Importar asiento" modal offering two equivalent ways to provide the monthly Memory `.txt` export: native file picker or drag-and-drop.

### Approach

1. Add the shadcn `dialog` primitive (`@radix-ui/react-dialog`) — first use of a modal in this codebase, matches the `new-york` style already configured in `components.json`.
2. Build `ImportarAsientoDialog` component (`src/components/importar-asiento-dialog.tsx`):
3. Wire the dialog into `dashboard/page.tsx`: replace the `wizardPending` boolean + placeholder paragraph with `dialogOpen` state opening `ImportarAsientoDialog`.
4. Guard: "Importar" stays disabled if there is no active company (today `EMPRESA_ACTIVA` is a hardcoded constant — guard against an empty string so the check is real once TD-5's company-selection state is wired here; do not touch TD-5's own scope).
5. Out of scope (belongs to TD-12/TD-13): actually parsing/uploading the file to the backend. This story ends at "file selected and ready to import" per its DoD — no upload call yet.

### Files touched

- `src/components/ui/dialog.tsx` (new, shadcn-generated)
- `src/components/importar-asiento-dialog.tsx` (new)
- `src/app/dashboard/page.tsx` (edit — wire the dialog)

### Verification

- `bun run lint`, `bun run build` (types), no unit tests exist for this screen yet (UI-only story, no new business logic to unit-test)
- Live-UI check on `bun run dev`: open dialog, browse a `.txt` file, drag-and-drop a `.txt` file, confirm both populate the same state; confirm a non-`.txt` file is rejected

## Review Workload Forecast

Estimated: ~180 additions + ~15 deletions = ~195 total lines
400-line budget risk: Low
Chain strategy: stacked-to-main
Decision needed before apply: No

---

### Juan Leites - 14/7/2026, 14:19:45

PR opened: https://github.com/jpl1899/tudeclaracion/pull/6 (feat/TD-11-importar-asiento-import-modal -> staging). Verified manually on localhost by the user: modal opens, file picker + drag-and-drop both work, invalid extension rejected.

---


_Synced from Jira by sync-jira-issues_
