# Comments for TD-9

[View in Jira](https://lk-tudeclaracion.atlassian.net/browse/TD-9)

---

### Juan Leites - 7/7/2026, 19:50:23

## Acceptance Criteria

```gherkin
Scenario: Request reset email
  Given Rosana has forgotten her password
  When she requests a password reset using her account email
  Then she receives an email with a password reset link

Scenario: Reset with valid token
  Given Rosana opens a valid, unexpired password reset link
  When she enters a new password that meets the strength requirements
  And she confirms the change
  Then her password is updated
  And she can sign in with the new password

Scenario: Expired or invalid token rejection
  Given Rosana opens a password reset link that has expired or was already used
  When she tries to set a new password
  Then she sees an error message telling her the link is no longer valid
  And she is offered the option to request a new reset email
```

---

### Juan Leites - 7/7/2026, 19:50:24

## Scope

- Email-based password reset link via Supabase Auth's password-recovery flow

---

### Juan Leites - 7/7/2026, 19:50:25

## Out Of Scope

- SMS-based recovery
- Security questions

---

### Juan Leites - 12/7/2026, 13:12:28

## Spec Implementation Plan (Dev)

# Implementation Plan: STORY-TD-9 - Password Recovery | Reset a forgotten password

## Overview

Email-based password reset for accountants via Supabase Auth's recovery flow: request a reset link from `/forgot-password`, land on `/reset-password` with a session established from the email link, set a new password, sign in with it. Out of scope: SMS recovery, security questions.

***Acceptance Criteria to satisfy*** (source: `comments.md`, Gherkin):
- Request reset email: valid account email -> reset email sent.
- Reset with valid token: valid unexpired link + password meeting strength rules -> password updated, can sign in with it.
- Expired/invalid token: opening an expired/used link -> clear error + option to request a new email.

---

## Status: BLOCKED on screen mockup (partial plan)

Per `.context/dev-roadmap.md` §5, TD-9 is mockup-gated (link exists on `/login`, no destination screen). A just-in-time brief was generated this session (`.context/designs/tudeclaracion/password-recovery/BRIEF.md`, requesting `forgot-password` + `reset-password` screens via Open Design) and is currently waiting on the user to return the exported artifacts. ***Stage 2 (UI coding) cannot start until the mockup lands*** — this plan covers everything that does NOT depend on the mockup, so Stage 2 can start immediately on the non-UI pieces once resumed.

---

## Technical Approach

***Chosen approach***: reuses the exact PKCE pattern already shipped for TD-4 (signup email confirmation) — the existing `src/app/auth/confirm/route.ts` route handler is generic over `EmailOtpType` and already calls `supabase.auth.verifyOtp({ type, token_hash })`. Password recovery emails use `type=recovery` against that SAME route (no new route handler needed), redirecting to `next=/reset-password` instead of `/empresas`.

- `/forgot-password` (client component, mirrors `login`/`signup` pattern): calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: '<APP_URL>/auth/confirm?next=/reset-password' })`.
- `/reset-password` (client component): by the time the user lands here, `/auth/confirm` has already exchanged the token and established a session via cookies (confirmed via Context7 / Supabase docs — PKCE recovery flow). Calls `supabase.auth.updateUser({ password })` directly — no token handling needed on this page.
- Expired/invalid token: `/auth/confirm`'s existing failure branch redirects to `/login?error=verification-failed` — for the recovery case this should instead redirect to `/forgot-password?error=expired` (a login redirect makes no sense for a password-reset flow; the user has no working password yet). ***Modify*** `/auth/confirm/route.ts`'s failure redirect to be type-aware: `type=recovery` -> `/forgot-password?error=expired`, else (signup) -> `/login?error=verification-failed` (existing behavior, unchanged).

***Why this approach***: zero new backend surface beyond the two pages — the token-exchange route is fully reused from TD-4, verified against Supabase's own documented PKCE recovery recipe (Context7, `supabase/supabase` — matches our existing `route.ts` shape exactly). Confirms TD-4's route handler was built generically enough to serve a second story without modification to its happy path.

---

## UI/UX Design

***PENDING — mockup in flight.*** `.context/designs/tudeclaracion/password-recovery/BRIEF.md` requests 2 screens (`forgot-password`, `reset-password`) reusing the signup screen's password-checklist pattern. Once the mockup lands: update `.context/design/master-design-plan.md` §4 (new screen specs), §8 (US 1.4 row), clear the §5 gate — then build the two pages against it, same fidelity process as TD-4.

Until then, do NOT invent the UI — no page markup gets written in this pass.

---

## Implementation Steps (buildable now, no mockup dependency)

### Step 1: Make `/auth/confirm`'s failure redirect type-aware

***Task***: recovery-flow token failures should route back to `/forgot-password`, not `/login`.
***File***: `src/app/auth/confirm/route.ts` (modify)
***Structure/Logic***: on the existing failure branch, redirect to `type === 'recovery' ? '/forgot-password?error=expired' : '/login?error=verification-failed'`.
***Testing***: covered by the eventual Step N manual E2E (needs the built `/forgot-password` page to verify the redirect lands correctly) — deferred until Stage 2 resumes with the mockup.
***Estimated time***: 10 min

### Step 2 (blocked): `/forgot-password` page
***File****: `src/app/forgot-password/page.tsx` (new) — ****cannot start, no mockup***.

### Step 3 (blocked): `/reset-password` page
***File****: `src/app/reset-password/page.tsx` (new) — ****cannot start, no mockup***.

### Step 4 (blocked): middleware — decide if `/forgot-password` needs `AUTH_ROUTES` treatment
Open question: should an already-authenticated user be redirected away from `/forgot-password` (like `/login`/`/signup`)? Probably yes for `/forgot-password`, probably NOT for `/reset-password` (a user arrives there via a fresh recovery session that isn't necessarily their "normal" authenticated session — redirecting them away would break the flow). Confirm during Stage 2 once building against the real screens.

---

## Dependencies

- [ ] Supabase Dashboard — Auth -> Email Templates -> "Reset password": confirm the link points to `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password` (same dashboard area already pending from TD-4's Dependencies — can be configured in the same pass).
- [ ] Mockup for `forgot-password` + `reset-password` (JIT brief in flight, see Status above).

---

## Risks & Mitigations

***Risk 1***: `/auth/confirm` is now shared by two stories (TD-4 signup, TD-9 recovery). A future change to its happy-path logic for one flow could silently break the other.
- ***Mitigation***: the Step 1 change only touches the failure branch, scoped by `type`; re-run TD-4's manual E2E (Step N) alongside TD-9's once both are on staging together.

---

## Estimated Effort

| Step | Time |
|---|---|
| 1. Type-aware failure redirect (buildable now) | 10 min |
| 2. `/forgot-password` page (blocked on mockup) | ~1.5 hr (est., signup-sized) |
| 3. `/reset-password` page (blocked on mockup) | ~1.5 hr (est., signup-sized) |
| 4. Middleware decision + wiring (blocked on mockup) | 15 min |
| N. Integration / manual E2E (blocked on mockup) | 30 min |
| ***Total**** | ****~10 min now, ~3.75 hr once mockup lands*** |

---

## Review Workload Forecast

Estimated: ~200 additions + ~10 deletions = ~210 total lines (once mockup lands)
400-line budget risk: Low
Chain strategy: not needed at this size — single branch, single PR once Stage 2 resumes
Decision needed before apply: No

Notes: sized similarly to TD-4's signup page (single new component per screen, no new backend surface) but split across 2 screens instead of 1 — still comfortably under budget as a single PR.


---


_Synced from Jira by sync-jira-issues_
