# Design brief — tuDeclaracion / signup-screen
Tool session: CONTINUE project "tuDeclaracion" (Open Design) — mode FOLLOW-UP

## Mission
Design 1 screen for tuDeclaracion. We describe WHAT the screen must accomplish;
HOW it looks is your call — layout, composition, hierarchy, component choices, and
micro-interactions are fully delegated to you. Your only hard boundary is the design
contract below: never invent colors, fonts, or spacing values outside it.
When done, export and return the files as described in "Export & return".

## Frozen design contract (non-negotiable)
- Same design system as the previous screens in this project (login, dashboard, company-select); keep full visual consistency with them. The established tokens still govern.

## Screens requested
### 1. signup — Crear cuenta
- Route: /signup
- Purpose: Self-service account creation for an accountant, no admin involved.
- User stories: TD-4 — Signup: Create a self-service accountant account
- The user must be able to: enter an email and a password and submit to create an account; understand the password strength requirements before the form rejects a weak one; get a clear, specific error if the email is already registered; after a successful submit, understand that a verification email was sent and that they must confirm it before continuing.
- States the ACs demand: default (empty form) / weak-password error (inline, explains the requirement) / duplicate-email error (form-level, no account created) / post-submit pending-verification (waiting for email confirmation, no dashboard access yet)
- Viewport: same as the existing login/dashboard screens in this project

## Hard constraints
- Name the screen file/frame exactly `signup` — the repo maps files by slug.
- No new tokens. A value not in the frozen contract is a defect, not a creative choice.

## Export & return
**Open Design** (local app — `http://localhost:7456` once the Docker stack is up): open the same
project you used for login/dashboard/company-select, paste this brief into the Discover
question form / brief field. Iterate until satisfied. The app writes artifacts to
`./.od/artifacts/<timestamp>-<slug>/` (HTML/PDF/PNG). Copy the final artifacts you consider
canonical into `.context/designs/tudeclaracion/signup-screen/` in this repo.

When the files are in place, come back to the agent session and confirm — the screen-mapping
phase resumes automatically (session checkpoint is waiting).
