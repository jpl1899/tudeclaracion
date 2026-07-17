# Design brief — tuDeclaracion / declaracion-detalle
Tool session: CONTINUE project "tuDeclaracion" (Open Design) — mode FOLLOW-UP

## Mission
Design 1 screen for tuDeclaracion. We describe WHAT the screen must accomplish;
HOW it looks is your call — layout, composition, hierarchy, component choices, and
micro-interactions are fully delegated to you. Your only hard boundary is the design
contract below: never invent colors, fonts, or spacing values outside it.
When done, export and return the files as described in "Export & return".

## Frozen design contract (non-negotiable)
- Same design system as the previous screens in this project (login, dashboard, company-select, signup, forgot-password, reset-password, company-onboarding); keep full visual consistency with them. The established tokens still govern.

## Screens requested

### 1. declaracion-detalle — Estado y descarga de una declaración

- Route: `/dashboard/declaraciones/[periodo]` (or a modal/panel over `/dashboard` — your call, follow the existing "Actividad reciente" table as the entry point)
- Purpose: TD-20 (PADI Export) — once a declaration finishes processing, the accountant needs to see its status and, only when processing succeeded, download the generated PADI-compatible TXT file.
- User story: TD-20 — "As Rosana Ferreira (contadora), quiero descargar el archivo PADI generado una vez que mi declaración fue procesada, para poder presentarlo ante DGI."

#### Entry point (already live — reuse it, don't redesign it)
The real, currently-shipped `/dashboard` (`src/app/dashboard/dashboard-client.tsx`) already has an "Actividad reciente" table with a `Período` column and a status `Badge` per row (`Validado` / `Generado`, both rendered with the `success` badge variant today — this is mock data, not yet wired to a real backend). This new screen is reached by clicking a row in that table. Please look at the live table's visual language (badges, `mono` typeface for period values, card/border style) and continue it — do not invent a different visual system for this new screen.

#### States this screen must cover
1. **Processing** — the declaration is still being generated. No download action available. Show clear "still working" status (no error, no success).
2. **Success** — processing finished without errors. Primary action: "Descargar archivo PADI" button, prominent. Filename shown or implied should follow the convention: declaration type (2181) + declarant RUT + period (AAAAMM), extension `.txt`.
3. **Failed** — processing finished WITH validation errors. No download action available (same as Processing — action is absent/disabled either way, AC doesn't distinguish the two for the button itself, but the accountant needs to tell "still working" apart from "something's wrong and won't finish"). This is a real use case for an error-toned status — `DESIGN.md` currently has no `badgeError` variant (only documented if a real use case appears) and does have `alertError` for banners; use whichever fits better, your call, but stay inside the frozen palette (`colors.error` / `errorBg` / `errorText`).

#### Hard constraints
- Name the screen file/frame exactly `declaracion-detalle` — the repo maps files by slug.
- No new tokens. A value not in the frozen contract is a defect, not a creative choice.
- Do NOT design a new "Actividad reciente" table or a new dashboard layout — that already exists and is out of scope here. This brief is ONLY the detail/status view for a single declaration.
- Do NOT design any DGI-submission flow — TD-20 is download-only, submitting the file to DGI is an explicit out-of-scope confirmed by the product owner (the accountant does it manually, outside this system).
- Reuse existing patterns already established across the batch: `Badge` variants, `Card`, `Button` (52px touch targets), `alertError`/`alertWarning` banners for the failed state if you go that route.

## Export & return
**Open Design** (local app — `http://localhost:7456` once the Docker stack is up): open the same
project you used for the previous screens (login/dashboard/company-select/signup/forgot-password/reset-password/company-onboarding), paste
this brief into the Discover question form / brief field. Iterate until satisfied. The app writes
artifacts to `./.od/artifacts/<timestamp>-<slug>/` (HTML/PDF/PNG). Copy the final artifacts you
consider canonical into `.context/designs/tudeclaracion/declaracion-detalle/` in this repo.

When the files are in place, come back to the agent session and confirm — the screen-mapping
phase resumes automatically (session checkpoint is waiting).
