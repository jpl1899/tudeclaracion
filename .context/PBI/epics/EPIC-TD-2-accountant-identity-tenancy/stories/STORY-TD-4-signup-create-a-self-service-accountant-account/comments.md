# Comments for TD-4

[View in Jira](https://lk-tudeclaracion.atlassian.net/browse/TD-4)

---

### Juan Leites - 7/7/2026, 19:48:11

## Acceptance Criteria

```gherkin
Scenario: Happy path signup
  Given Rosana is on the signup screen
  When she enters a valid email and a password that meets the strength requirements
  And she submits the signup form
  Then her account is created
  And she receives an email verification message
  And she is redirected to the company selection screen once her email is verified

Scenario: Duplicate email error
  Given Rosana enters an email that already has an account
  When she submits the signup form
  Then she sees an error message telling her the email is already registered
  And no new account is created

Scenario: Weak password rejection
  Given Rosana enters a password that does not meet the minimum strength requirements
  When she submits the signup form
  Then she sees an error message explaining the password requirements
  And no account is created
```

---

### Juan Leites - 7/7/2026, 19:48:12

## Scope

- Email + password signup
- Email confirmation before granting access
- Automatic redirect to company selection after successful verification

---

### Juan Leites - 7/7/2026, 19:48:13

## Out Of Scope

- OAuth / social signup
- Multi-role accounts
- Admin-invited accounts

---

### Juan Leites - 9/7/2026, 19:07:02

## Spec Implementation Plan (Dev)

# Implementation Plan: STORY-TD-4 - Signup | Create a self-service accountant account

## Overview

Implement self-service account creation for accountants (Rosana Ferreira persona): email + password signup, Supabase Auth email verification, and automatic redirect to the company selection screen (`/empresas`) once the email is confirmed. No admin invitation exists or is planned for the MVP.

***Acceptance Criteria to satisfy*** (source: `comments.md`, Gherkin):

- Happy path: valid email + password meeting strength rules -> account created, verification email sent, redirected to `/empresas` once verified.
- Duplicate email: submitting an already-registered email shows a specific "already registered" error and creates no new account.
- Weak password: submitting a password that fails the strength rules shows an explanatory error and creates no account.

---

## Technical Approach

***Chosen approach******:*** Client Component (`'use client'`) calling the Supabase browser client directly, mirroring the existing `src/app/login/page.tsx` pattern (no Server Action, no custom API route in front of Supabase Auth). `supabase.auth.signUp({ email, password, options: { emailRedirectTo } })` is called from the browser; the confirmation email link routes to a new Route Handler (`src/app/auth/confirm/route.ts`) that exchanges the token for a session and redirects to `/empresas`.

***Alternatives considered******:***

- ***Server Action for the signup mutation*** — rejected for consistency with the shipped `login` page (client component + browser `createClient()`), and because the browser client already owns the PKCE code-verifier cookie that the email-confirmation exchange needs; routing the mutation through a Server Action would complicate that cookie handshake for no benefit.
- ***Custom pre-check against the ****`cuenta`**** table before calling ***`signUp()` (query if the email already has a row) — rejected: `SRS/12-security.md` scopes authorization to Supabase Auth + RLS only, with no custom user directory; a pre-check would also leak account existence through a different channel than `signUp()` itself, undermining Supabase's own anti-enumeration protection (see Decision 1 below).

***Why this approach******:***

- Zero new backend surface — reuses the same Supabase Auth + `@supabase/ssr` stack already wired for login.
- Matches the one-page-one-pattern precedent already in the repo (`login/page.tsx`), keeping the codebase consistent for the next auth-adjacent story.
- Trade-off: duplicate-email detection depends on an undocumented Supabase Auth response shape rather than an explicit error (see Decision 1 and Risk 1).

---

## UI/UX Design

***Screen spec******:*** `.context/design/master-design-plan.md` §4.5 (Crear cuenta / signup), US 1.1 row in §8.
***Mockup******:*** `.context/designs/tudeclaracion/signup-screen/signup-2.html` — 2-column layout (intro panel + form panel), same OKLCH token family and shell pattern as `login.html`.
***Route******:*** `/signup` (public, pre-login).

### Components to reuse (already exist)

- `Button` (`@/components/ui/button`) — primary CTA, `size="lg"`, `h-[52px]` override for the 52px tap target the mockup uses (same pattern as `login/page.tsx`).
- `Input` (`@/components/ui/input`) — email + password fields, `h-[52px]`.
- `Label` (`@/components/ui/label`) — always-visible field labels (never placeholder-only, per `DESIGN.md` Do's/Don'ts).
- Shell/intro-panel markup — copy the `login/page.tsx` structure (`grid grid-cols-1 md:grid-cols-[1fr_420px]`, `bg-gradient-to-b from-primary/5 to-white` intro panel) rather than re-deriving it from the raw mockup CSS, per the repo's Live-UI-First rule.

### New component surface

- No new reusable component needed — the page owns its own local state for the 3 error/success panels and the password-rule checklist (small enough to stay inline, mirrors `login/page.tsx`'s single-file pattern).

### States mapped from the mockup's 4 demo states to real app states

| Mockup demo state | Real app trigger | UI treatment |
| --- | --- | --- |
| Vacío (empty) | Initial render / fields cleared | Form visible, no error/success panel, rule checklist unchecked |
| Contraseña débil | `signUp()` not called — client-side rule check fails on submit | Password-error panel shown inline under the password field; rule checklist shows which rules are unmet (live, on every keystroke) |
| Correo duplicado | `signUp()` succeeds but `data.user.identities` is empty (or returns an "already registered" error) | Top `notice` panel shown with the literal registered email; form stays visible and editable |
| Verificación pendiente | `signUp()` succeeds with a real new identity | Form fields hidden; success panel shown with the submitted email; no further action until the user clicks the email link |

### Responsive

- `md:grid-cols-[1fr_420px]` collapses to a single column below 860px (mockup-observed breakpoint, matches the checklist item in §4.5).

---

## Types & Type Safety

- `src/types/supabase.ts` (auto-generated `Database` type) already declares the `cuenta` table (`id`, `email`, `nombre`, `created*at`, `updated*at`). A Postgres trigger auto-provisions the `cuenta` row keyed on `auth.users.id` on signup (per `.env.example`'s `LOCAL*USER*EMAIL` comment: "auth.users.id = cuenta.id (auto-provisioned by trigger)") — this story does ***not*** write to `cuenta` directly; no new generated types are required.
- `supabase.auth.signUp()` / `verifyOtp()` types come from `@supabase/supabase-js` (already a dependency) — no local type authoring needed beyond the password-rules module's own return type.

---

## Content Writing

All UI copy is taken verbatim from the ratified mockup (`signup-2.html`) — no placeholder text:

- Heading: "Crear cuenta"
- Subheading: "Usa un correo profesional y una contraseña robusta para habilitar el acceso de tu estudio."
- Field labels: "Correo electrónico" (placeholder `nombre@estudio.com`), "Contraseña" (placeholder `Crea una contraseña`)
- Password helper: "Antes de enviar, la contraseña debe cumplir todas las reglas indicadas debajo."
- Password-error panel: "La contraseña no cumple el mínimo requerido. Debe tener al menos 10 caracteres, una letra mayúscula, una letra minúscula y un número."
- Rule checklist: "Al menos 10 caracteres." / "Al menos una letra mayúscula." / "Al menos una letra minúscula." / "Al menos un número."
- Required-email panel: "Introduce un correo electrónico." + "Necesitamos un correo profesional válido para crear la cuenta."
- Duplicate-email panel: "Este correo ya está registrado." + "Ya existe una cuenta asociada a `{email}`. Inicia sesión o recupera el acceso para continuar."
- Success panel: "Revisa tu correo para continuar." + "Hemos enviado un mensaje de verificación a `{email}`. Hasta confirmar ese correo, el acceso al dashboard permanecerá bloqueado."
- Primary CTA: "Crear cuenta"
- Footer link row: "¿Ya tienes cuenta?" -> "Iniciar sesión" (points to `/login`)
- Intro panel: "Crear cuenta para empezar con seguridad." + supporting paragraph from the mockup's `.muted` copy.

---

## Implementation Steps

### Step 1: Password requirement utility

***Task******:*** Extract the mockup's 4 password rules into a small, pure, reusable module so the live checklist and the submit-gate share one source of truth.

***File******:*** `src/lib/validation/password-rules.ts` (new)

***Structure/Logic******:***

- `getPasswordRules(value: string): { length: boolean; upper: boolean; lower: boolean; digit: boolean }` — mirrors the mockup's regexes (`value.length >= 10`, `/[A-ZÁÉÍÓÚÜÑ]/`, `/[a-záéíóúüñ]/`, `/\d/`).
- `passwordMeetsRequirements(value: string): boolean` — `Object.values(getPasswordRules(value)).every(Boolean)`.

***Edge cases handled******:***

- Empty string: all rules false (checklist starts fully unchecked, matches "Vacío" state).
- Accented uppercase/lowercase Spanish characters: included in the regex (matches mockup exactly, relevant for `contraseña`-style inputs).

***Testing******:*** Unit tests deferred — see Dependencies (no test runner installed in this repo yet).

***Estimated time******:*** 20 min

---

### Step 2: Signup page

***Task******:*** Build `/signup` per the mockup, wired to real Supabase Auth.

***File******:*** `src/app/signup/page.tsx` (new)

***Structure/Logic******:***

- Local state: `email`, `password`, `submitted` (bool), `passwordTouched` (bool, gates when the live rule checklist first renders errors), `authError: 'duplicate' | 'required-email' | null`, `isSubmitting`, `isPendingVerification`.
- On every `password` change: recompute `getPasswordRules(password)` and paint the checklist (dot fills green per rule), independent of submit state — matches the mockup's live-feedback behavior.
- On submit:

***Edge cases handled******:***

- Re-submitting after a duplicate-email error with a corrected email clears the duplicate panel (mirrors the mockup's `email` input listener that resets state).
- Whitespace-only email/password trimmed before validation, matching the mockup's `.trim()` calls.

***Testing******:*** Manual smoke test against the 3 Gherkin scenarios on staging (no automated test runner — see Dependencies).

***Estimated time******:*** 2.5 hr

---

### Step 3: Auth confirmation route handler

***Task******:*** Handle the Supabase confirmation-email link so a verified user lands on `/empresas` with an active session (required for AC1 — without this route the redirect in the AC cannot happen, since this project uses the PKCE flow via `@supabase/ssr`, not Supabase's own hosted confirmation page).

***File******:*** `src/app/auth/confirm/route.ts` (new)

***Structure/Logic******:***

- `GET` handler reads `token_hash` and `type` (`EmailOtpType`) query params.
- Calls `(await createClient()).auth.verifyOtp({ type, token_hash })` (server Supabase client from `@/infrastructure/supabase/server`).
- On success: `redirect(next ?? '/empresas')` (`next` param read from the URL, defaulting to `/empresas` per this story's AC).
- On failure or missing params: `redirect('/login?error=verification-failed')` (no dedicated error screen exists yet — reuses the login page's existing error-banner slot).

***Edge cases handled******:***

- Expired/already-used token: Supabase's `verifyOtp` returns an error; handled via the failure branch above, not a 500.

***Testing******:*** Manual smoke test on staging (click the real confirmation email link).

***Estimated time******:*** 45 min

---

### Step 4: Middleware — protect `/signup` as an auth route

***Task******:*** Redirect already-authenticated users away from `/signup`, same treatment `/login` already gets.

***File******:*** `middleware.ts` (modify)

***Structure/Logic******:***

- Add `/signup` to the existing `AUTH_ROUTES` array (currently `['/login']`).

***Edge cases handled******:*** none new — reuses the existing `isAuthRoute` branch verbatim.

***Testing******:*** Manual smoke test (visit `/signup` while logged in, expect redirect to `/empresas`).

***Estimated time******:*** 10 min

---

### Step 5: Wire the login page's dormant signup link

***Task******:*** Point the existing placeholder link at the new route.

***File******:*** `src/app/login/page.tsx` (modify)

***Structure/Logic******:***

- Change `<a href="#">Creá tu cuenta</a>` to `<a href="/signup">Creá tu cuenta</a>` and remove the stale code comment in the file header noting the link is a placeholder (per Rule: remove dead references your change makes stale).

***Testing******:*** Manual click-through.

***Estimated time******:*** 5 min

---

### Step N: Integration

***Task******:*** Verify the full flow end to end.

***Flow completo******:***

1. Visit `/signup`, submit a new email with a weak password -> password-error panel shown, no account created (AC3).
2. Correct the password, submit again with an email that already has a confirmed account -> duplicate-email panel shown, no new account created (AC2).
3. Submit with a new email + valid password -> success panel shown, verification email received, clicking the email link lands on `/empresas` with an active session (AC1).

***Testing******:*** Manual E2E on staging (no automated E2E runner configured in this repo).

***Estimated time******:*** 30 min

---

## Technical Decisions (Story-specific)

### Decision 1: Duplicate-email detection via Supabase's anti-enumeration response shape

***Chosen******:*** Detect a duplicate, already-confirmed email by checking `data.user.identities.length === 0` on a "successful" `signUp()` response, in addition to (defensively) matching an explicit `error.message` containing "already registered".

***Reasoning******:***

- ✅ When "Confirm email" is enabled in Supabase Auth (the model this story assumes, per `SRS/12-security.md`), `signUp()` for an email that already has a ***confirmed**** account does ****not*** throw — it returns HTTP 200 with a synthetic user object whose `identities` array is empty, specifically to prevent attackers from using signup responses to enumerate registered emails. This is documented Supabase behavior, not a bug, and it is the only client-observable signal available without a custom pre-check.
- ✅ Checking both shapes (empty `identities` and the literal error string) keeps the code correct whether "Confirm email" ends up enabled or disabled in a given environment's Supabase project settings, without the app needing to know which mode is active.
- ❌ Trade-off: this couples the duplicate-email UI to an undocumented-as-a-stable-contract response shape (Supabase could change it in a future SDK version). Flagged as Risk 1 below with a mitigation (code comment linking to this decision + a staging smoke test before every deploy that touches this file).

---

## Dependencies

***Pre-requisitos técnicos******:***

- [ ] ***BLOCKER (scope decision needed)******:*** No test runner is installed in this repo — `package.json` has no `test` script and no Jest/Vitest/etc. in `devDependencies`. The Definition of Done template calls for unit tests on the password-rules utility; that cannot be satisfied until a runner is chosen and installed, which is out of scope for this story. Needs an explicit user decision before Stage 2: (a) add a minimal runner as part of this story, or (b) descope automated tests here and rely on the manual E2E pass (Step N) against the 3 Gherkin scenarios, with automated coverage tracked as a follow-up tech story.
- [ ] Supabase Dashboard — Auth -> Providers -> Email -> confirm "Confirm email" is enabled (this story's AC1 assumes it; if it is off, signup grants immediate access with no verification step, contradicting the AC).
- [ ] Supabase Dashboard — Auth -> Email Templates -> "Confirm signup": the link must be changed from the default `{{ .ConfirmationURL }}` (Supabase's own hosted verify page) to `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup&next=/empresas`, so the PKCE exchange lands on this app's new route (Step 3) instead of Supabase's generic page.
- [ ] Supabase Dashboard — Auth -> URL Configuration -> Redirect URLs allowlist must include `<NEXT*PUBLIC*APP_URL>/auth/confirm` for every environment (local + staging + production), or `verifyOtp` redirects will be rejected.
- [ ] `NEXT*PUBLIC*APP_URL` set correctly per environment (already scaffolded in `.env.example`; no code change needed, just per-environment value confirmation).

---

## Risks & Mitigations

***Risk 1******:*** Duplicate-email detection depends on Supabase's `identities`-array anti-enumeration behavior (Decision 1), which is not a versioned/stable API contract.

- ***Impact******:*** Medium
- ***Mitigation******:*** Code comment on the detection branch linking to this plan's Decision 1; re-verify AC2 manually on every staging deploy that touches `signup/page.tsx` or after any `@supabase/supabase-js` version bump.

***Risk 2******:*** No automated test coverage for this story (test runner gap, see Dependencies) — regressions in password-rule logic or the duplicate-email branch would only surface via manual QA.

- ***Impact******:*** Medium
- ***Mitigation******:*** Explicit user decision requested before Stage 2 (add runner now vs. descope + follow-up tech story); until resolved, Step N's manual E2E pass against all 3 Gherkin scenarios is the only safety net and must be re-run on every subsequent change to this flow.

***Risk 3******:*** The email-verification redirect (AC1) depends entirely on out-of-repo Supabase Dashboard configuration (email template + redirect allowlist) that is not versioned in this codebase.

- ***Impact******:*** High
- ***Mitigation******:*** Exact dashboard steps documented in Dependencies above; re-verified as part of the staging deploy smoke test (Step N) before this story is marked Ready For QA.

---

## Estimated Effort

| Step | Time |
| --- | --- |
| 1. Password requirement utility | 20 min |
| 2. Signup page | 2.5 hr |
| 3. Auth confirmation route handler | 45 min |
| 4. Middleware — protect `/signup` | 10 min |
| 5. Wire login page's signup link | 5 min |
| N. Integration / manual E2E | 30 min |
| ***Total**** | ****~******4.3 hr*** |

***Story points******:*** not set in `story.md` (field shows `-`) — this plan's effort estimate is offered as input to a future estimation pass, not a substitute for it.

---

## Definition of Done Checklist

- [ ] Código implementado según este plan
- [ ] Los 3 Acceptance Criteria (Gherkin) pasando
- [ ] ***Tipos del backend usados correctamente***
- [ ] ***Personalidad UI/UX aplicada consistentemente***
- [ ] ***Content Writing contextual (NO genérico)*** — copy taken verbatim from `signup-2.html`, no placeholder text
- [ ] ***Protección de rutas***
- [ ] Tests unitarios — ***BLOCKED pending Dependencies decision*** (no test runner installed)
- [ ] Tests E2E — manual pass only (Step N), automated E2E out of scope for this story
- [ ] Code review aprobado
- [ ] Sin errores de linting/TypeScript
- [ ] Deployed to staging
- [ ] Manual smoke test en staging

---

## Review Workload Forecast

Estimated: 480 additions + 20 deletions = 500 total lines
400-line budget risk: High
Chain strategy: pending
Decision needed before apply: Yes

Notes: Per-file estimate — `src/app/signup/page.tsx` (~200 lines, new, ×1.5) is the dominant cost given the 4 UI states (empty/weak-password/duplicate-email/pending-verification) it must render; `src/lib/validation/password-rules.ts` (~35 lines, new, ×1.5) and `src/app/auth/confirm/route.ts` (~40 lines, new, ×1.5) add moderate weight; `middleware.ts` and `src/app/login/page.tsx` are trivial one-line modifications (×1.0). Sum ≈ 417, ×1.2 buffer ≈ 500. Risk is High per the >400-line threshold — the algorithm's guidance is to emit `pending` and surface the chain-strategy gate rather than pick a strategy here; `/git-flow-master` (Step 4, chained-PR decision tree) should resolve this before Stage 2 (Implementation) begins. A plausible resolution given the shape of the work (2 largely-independent new files + 1 cohesive page + 2 trivial edits) is `stacked-to-main` (e.g. PR1: password-rules util + auth/confirm route; PR2: signup page + middleware + login link wiring), but that decision is intentionally left to the git-flow-master handoff, not asserted here.

---

### Juan Leites - 9/7/2026, 19:17:22

## Chain Strategy Resolved (git-flow-master Step 4)

Workload forecast: 500 lines estimated, risk High -> ran the chained-PR decision tree.

Q1 (mechanical change?): No.
Q2 (linearly decomposable into 2-4 independent slices, each <400 lines, base safe after each)? Yes:
  1. Password requirement utility (src/lib/validation/password-rules.ts) - standalone, no dependents needed
  2. Signup page + form (src/app/signup/page.tsx) - the core UI, depends on step 1
  3. Auth confirmation route handler (src/app/auth/confirm/route.ts) + middleware AUTH_ROUTES update - completes the email-verification loop
  4. Wire login page's dormant signup link - trivial, cosmetic

Decision: stacked-to-main. Repo strategy is solo-main (single branch, direct commits, PRs optional) -> executed as 4 sequential atomic commits directly to main, each independently buildable/deployable, landing in the order above. Decision needed before apply: No (resolved).

---


_Synced from Jira by sync-jira-issues_
