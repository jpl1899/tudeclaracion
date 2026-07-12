# Design brief — tuDeclaracion / password-recovery
Tool session: CONTINUE project "tuDeclaracion" (Open Design) — mode FOLLOW-UP

## Mission
Design 2 screens for tuDeclaracion. We describe WHAT each screen must accomplish;
HOW it looks is your call — layout, composition, hierarchy, component choices, and
micro-interactions are fully delegated to you. Your only hard boundary is the design
contract below: never invent colors, fonts, or spacing values outside it.
When done, export and return the files as described in "Export & return".

## Frozen design contract (non-negotiable)
- Same design system as the previous screens in this project (login, dashboard, company-select, signup); keep full visual consistency with them. The established tokens still govern.

## Screens requested

### 1. forgot-password — Recuperar acceso (request)
- Route: /forgot-password
- Purpose: entry point for a user who forgot their password — reached from the dormant "Recuperar acceso" link already on the login screen.
- User stories: TD-9 — Password Recovery: Reset a forgotten password (AC1: Request reset email)
- The user must be able to: enter their account email and submit to request a reset link; after submitting, understand that an email was sent (no further action possible on this screen until they open that email).
- States the AC demands: default (empty form) / post-submit confirmation (email sent, form replaced by a message, same visual pattern as signup's "pending verification" panel)
- Viewport: same as the existing login/signup screens in this project

### 2. reset-password — Restablecer contraseña
- Route: /reset-password
- Purpose: reached only via the link inside the reset email — lets the user set a new password.
- User stories: TD-9 — Password Recovery: Reset a forgotten password (AC2: Reset with valid token, AC3: Expired or invalid token rejection)
- The user must be able to: on a valid link, enter a new password that meets the strength requirements (reuse the same 4-rule checklist pattern already established on signup — length/upper/lower/digit) and confirm the change, then know they can sign in with it; on an expired/already-used link, see a clear error explaining the link is no longer valid, with a way to request a new reset email (link back to screen 1).
- States the AC demands: valid-token form (password + live rule checklist) / success (password updated, link to /login) / invalid-or-expired-token error (no form shown, explanation + "request a new link" action)
- Viewport: same as the existing login/signup screens in this project

## Hard constraints
- Name the screen files/frames exactly `forgot-password` and `reset-password` — the repo maps files by slug.
- No new tokens. A value not in the frozen contract is a defect, not a creative choice.
- Reuse the password-strength-checklist pattern from the signup screen (4 rules, live-updating dots) rather than inventing a new one for screen 2.

## Export & return
**Open Design** (local app — `http://localhost:7456` once the Docker stack is up): open the same
project you used for login/dashboard/company-select/signup, paste this brief into the Discover
question form / brief field. Iterate until satisfied. The app writes artifacts to
`./.od/artifacts/<timestamp>-<slug>/` (HTML/PDF/PNG). Copy the final artifacts you consider
canonical into `.context/designs/tudeclaracion/password-recovery/` in this repo.

When the files are in place, come back to the agent session and confirm — the screen-mapping
phase resumes automatically (session checkpoint is waiting).
