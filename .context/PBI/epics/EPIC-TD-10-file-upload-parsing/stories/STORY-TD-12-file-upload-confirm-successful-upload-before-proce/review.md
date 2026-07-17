# TD-12 — Stage 3 Code Review

Independent adversarial reviewer dispatched with fresh context, scoped to the single TD-12 commit. Findings adjudicated below.

## AC coverage

All 3 confirmed Gherkin scenarios (success confirmation with filename+timestamp, failure visually/textually distinct, confirmation shows exact filename+timestamp) covered, verified live via `playwright-cli` (real upload + real malformed-file rejection, screenshotted).

## Findings

| # | Severity | Finding | Verdict | Reasoning |
|---|---|---|---|---|
| 1 | MAJOR | Cancelling (or Esc/click-outside) while an import is in flight let the async `onImportar` promise resolve after the dialog closed, setting a stale `confirmacion` state that would falsely reappear the next time the dialog opened for an unrelated upload | **Legitimate, fixed** | `handleClose` now ignores close attempts while `importando` is true (covers Cancelar, Esc, click-outside, the dialog's own X in one place); Cancelar is also disabled during import as a visual affordance. |
| 2 | MAJOR | Swapping from the form to the confirmation panel doesn't move focus — Radix only manages focus on dialog open/close, not on internal content swaps, so focus drops to `<body>` right when the user most needs to notice the confirmation | **Legitimate, fixed** | Added a `useEffect` that focuses the "Listo" button when `confirmacion` becomes truthy. |
| 3 | MINOR | Neither the confirmation nor the (pre-existing) error banner has `role="status"`/`aria-live`, so a screen-reader user without nearby focus won't hear the result | Legitimate, **deferred** | Pre-existing gap on the error banner too (not introduced by this story) — belongs to a dedicated accessibility pass across the app's alert/confirmation patterns, not a one-off fix scoped to this dialog. |
| 4 | NIT | Confirmation's type is declared inline in `useState` instead of as a top-level type like `ImportarAsientoError` | Legitimate, **not fixed** | Matches an existing precedent elsewhere in the codebase (`nueva-empresa-client.tsx`) — consistent with current convention, not a real deviation. |

No BLOCKER findings. State-transition logic (reset on Listo/Cancelar/Esc/X, all routed through `handleClose`) confirmed correctly unified after the fix; no dead code left from the form/confirmation refactor.

## Decision: ✅ APPROVED — 2 MAJOR fixed (close-during-import race, lost focus), 1 MINOR deferred with documented reasoning, 1 NIT not actionable (matches convention).
