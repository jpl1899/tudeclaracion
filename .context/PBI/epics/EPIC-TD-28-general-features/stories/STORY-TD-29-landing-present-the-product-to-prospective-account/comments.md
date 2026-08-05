# Comments for TD-29

[View in Jira](https://lk-tudeclaracion.atlassian.net/browse/TD-29)

---

### Juan Leites - 1/8/2026, 20:08:39

## Acceptance Criteria

```gherkin
Scenario: First-time visitor sees marketing content instead of being redirected to login
  Given a visitor who has never signed in opens the site's root address
  When the page loads
  Then the visitor sees marketing content describing what the product does
  And the visitor is not automatically sent to the login screen

Scenario: Visitor proceeds to create an account from the landing page
  Given a visitor is viewing the marketing content on the root address
  When the visitor chooses to sign up
  Then the visitor is taken to the account-creation screen

Scenario: Returning visitor proceeds to sign in from the landing page
  Given a visitor is viewing the marketing content on the root address
  When the visitor chooses to sign in
  Then the visitor is taken to the sign-in screen
```

---

### Juan Leites - 1/8/2026, 20:08:54

## Scope

- The root address shows marketing content presenting the product, instead of redirecting straight to the login screen
- A visitor can navigate from the landing page to the sign-in screen
- A visitor can navigate from the landing page to the account-creation screen

---

### Juan Leites - 1/8/2026, 20:08:55

## Out Of Scope

- A/B testing of landing content or layout
- A content-management system or any editable-by-non-developers content
- Analytics or visitor tracking
- Localization beyond Spanish
- A blog or resources section

---

### Juan Leites - 1/8/2026, 20:24:38

## Spec Implementation Plan (Dev)

# Implementation Plan: STORY-TD-29 - Landing | Present the product to prospective accountants before signup

## Overview

Replace the root route's blanket `redirect('/login')` with a real public marketing page, so a first-time visitor sees what tuDeclaracion does before being pushed into the auth flow. This is the first story under the new catch-all epic TD-28 ("General Features") — a static, content-only page outside the tax-engine backbone, using the pre-existing mockup `landing-2.html` (`.context/design/master-design-plan.md` §4.1).

***Acceptance Criteria to satisfy*** (from TD-29 `comments.md`, 2026-08-01 — no Jira custom field configured for AC in this workspace):

- Scenario 1: a first-time visitor opening `/` sees marketing content, and is NOT auto-redirected to `/login`.
- Scenario 2: from the landing page, a visitor can choose to sign up and lands on the account-creation screen (`/signup`).
- Scenario 3: from the landing page, a visitor can choose to sign in and lands on the sign-in screen (`/login`).

***Scope*** (from `comments.md`): root address shows marketing content instead of redirecting; navigation to `/login`; navigation to `/signup`.

***Out of scope*** (from `comments.md`): A/B testing, CMS/editable content, analytics/tracking, localization beyond Spanish, blog/resources section.

---

## Technical Approach

***Chosen approach******:**** Rewrite `src/app/page.tsx` as a plain ****Server Component*** (no `'use client'`) that renders the landing content directly — no new route, no new component directory. The page has zero interactivity/state (no forms, no client-only hooks), so it matches Next.js App Router's default (server-rendered) convention rather than the `'use client'` pattern used by `login`/`signup` (those need client state for form handling; this page doesn't).

***Alternatives considered******:***

- **Keep the redirect and add a **`?ref=`** marketing query param**: rejected — doesn't satisfy AC Scenario 1 (visitor must see content, not be redirected at all).
- **New **`src/components/landing/`** directory with a **`<Hero>`**, **`<TrustSection>`**, **`<Footer>`** split into separate files**: rejected for this pass — the page is single-use, single-route, and has no reuse target yet. Matches CLAUDE.md "SIMPLICITY FIRST" (no abstractions for single-use) and mirrors the existing convention in `signup/page.tsx`, which keeps `IntroPanel`/`FooterLink` as local functions in the same file rather than extracting them.

***Why this approach******:***

- Consistent with the two other public, unauthenticated pages already live (`login/page.tsx`, `signup/page.tsx`) in shell structure (`<main>` full-height, centered content, `rounded-lg border bg-card` panel) — Live-UI-First (Critical Rule #14): reuse the live shell/tokens, not the mockup's own OKLCH variables/shell.
- Zero new dependencies, zero new files besides the one being rewritten.
- ❌ Trade-off: none of substance — this is the simplest option that satisfies all three AC scenarios.

---

## UI/UX Design

***Fidelity bar***: `.context/design/master-design-plan.md` §4.1 checklist + `DESIGN.md` tokens/components (frozen contract, §2 of the master plan). Per Live-UI-First (Critical Rule #14), tokens/shell come from the LIVE app (Tailwind CSS vars already wired in `globals.css` — `bg-primary` = `#08569A`, etc. — and the existing `Button`/`Card` primitives), not from the mockup's own `oklch()` custom properties or its bespoke `.btn`/`.card`/`.eyebrow` CSS classes.

### Components used (all already live — no new primitives)

- `Button` (`@/components/ui/button`, `variant="default" size="lg"`, `asChild` + `next/link` `Link`) — primary CTA "Ingresar al sistema" → `/login`.
- `Card` / `CardContent` (`@/components/ui/card`) — the 3 "Criterios de confianza" cards.
- Plain `<a>`/`Link` styled as a text link (`text-primary font-semibold hover:underline`) — same pattern already used in `login/page.tsx` (`¿Primera vez? Creá tu cuenta`) and `signup/page.tsx` (`FooterLink`) — for the secondary sign-up path (see Decision 1 below).
- Local helper function `TrustCard` inside `page.tsx` (mirrors the `IntroPanel`/`FooterLink` local-function pattern in `signup/page.tsx`) to avoid repeating the 3 near-identical card blocks — DRY within a single file, no new shared component.

### Layout (from `landing-2.html`, tokens/shell swapped for the live ones)

```
┌──────────────────────────────────────────────┐
│ Header: logo mark "TD" + "tuDeclaracion"      │
├──────────────────────────────────────────────┤
│ Hero: eyebrow badge                           │
│       h1 (display/h1 scale, clamp)            │
│       lead paragraph (muted)                  │
│       [Ingresar al sistema →/login]  (primary)│
│       ¿Todavía no tenés cuenta? Creá tu cuenta│
│        (secondary text-link →/signup)          │
├──────────────────────────────────────────────┤
│ "Criterios de confianza" (h2)                 │
│  [Card] [Card] [Card]  (1 col under 960px)    │
├──────────────────────────────────────────────┤
│ Footer: disclaimer legal (muted, text-sm)     │
└──────────────────────────────────────────────┘
```

### States

Static content only — no loading/empty/error states apply (no data fetching, no form). This matches the story's Out-of-scope list (no CMS, no analytics, no A/B).

### Responsiveness

- Single-column hero at all widths (the mockup's hero is already single-column — no 2-col split to collapse, unlike `login`/`signup`).
- `Criterios de confianza`: `grid-cols-3` → `grid-cols-1` under `960px` (`md:grid-cols-3 grid-cols-1`), matching the mockup's `@media (max-width: 960px)` rule.
- Container width matches the mockup's `min(1200px, calc(100% - 32px))` → Tailwind `mx-auto w-full max-w-[1200px] px-4`.
- Touch targets ≥48px on the primary CTA (`size="lg"` Button, consistent with `h-[52px]` used on `login`/`signup` — will match at 52px via `className="h-[52px]"` override, same pattern already used on those two pages).

---

## Content Writing

Copy is carried over verbatim/adapted from the mockup (`landing-2.html`), which already uses real domain vocabulary — no placeholder text:

- Eyebrow: "Declaraciones DGI sin fricción"
- H1: "Prepara tus declaraciones DGI, con un flujo claro y seguro."
- Lead: "tuDeclaracion acompaña al estudio contable desde la carga del TXT exportado desde Memory hasta la generación del archivo PADI. Sin pantallas recargadas, sin navegación confusa y con foco total en productividad diaria."
- Trust cards: "Lectura inmediata" / "Próximo paso obvio" / "Escalable" (with their existing descriptions).
- Footer disclaimer: "Herramienta de apoyo. No reemplaza asesoramiento contable ni legal." (mandatory per §4.1 checklist).
- New copy needed only for the secondary sign-up link (not in the mockup — see Decision 1): "¿Todavía no tenés cuenta? Creá tu cuenta." — mirrors the exact phrasing/pattern already used in `login/page.tsx`'s footer link.

---

## Implementation Steps

### Step 1: Rewrite `src/app/page.tsx`

***File******:*** `src/app/page.tsx` (MODIFIED — full rewrite of the current 10-line redirect stub)

***Task******:*** Remove the `redirect('/login')` call and its stale comment block ("No landing/marketing page is in scope for this scaffold..." — now obsolete, TD-29 puts it in scope). Replace with a server-rendered landing page.

***Structure******:***

- Drop the `next/navigation` `redirect` import entirely (no longer used).
- Root-level `<main>` (matches `login`/`signup`'s `min-h-screen` pattern, but full-width — no centered single card, this page has multiple full-width sections like the mockup).
- Header: logo mark (`TD` in a `bg-primary` rounded box) + wordmark, reusing the exact classes already used for the logo mark in `login/page.tsx` / `signup/page.tsx`'s `IntroPanel` (`h-11 w-11 rounded-md bg-primary font-bold text-primary-foreground`).
- Hero section: eyebrow pill, `h1`, lead paragraph, primary CTA `Button asChild` wrapping `Link href="/login"`, secondary text `Link href="/signup"`.
- "Criterios de confianza" section: `h2` + 3× `TrustCard` (local helper, `title`/`description` props) inside a responsive grid.
- Footer: legal disclaimer paragraph.
- No client-side state, no `useEffect`, no event handlers — pure server component.

***Edge cases handled******:***

- Visitor with an existing session hitting `/`: out of scope per this story's Scope/Out-of-scope (no session-check redirect logic requested; AC only covers the first-time/never-signed-in visitor). Flagged as an ***open question*** below rather than silently adding auth-aware branching not in the AC.

***Testing******:***

- No unit tests planned — the page has zero business logic (no conditionals, no state, no computed values) to unit-test; this matches the existing convention in this repo (`login/page.tsx` and `signup/page.tsx`'s pure-JSX portions are not unit-tested either — only their validation helpers, e.g. `password-rules.ts`, have dedicated tests). Coverage instead comes from Stage 3's live-UI validation pass (see below) against the three AC scenarios.
- Live-UI validation (Stage 2/3, via `[AUTOMATION_TOOL]`): open `/` on the running dev server and confirm (a) marketing content renders, no redirect fires; (b) the primary CTA navigates to `/login`; (c) the secondary link navigates to `/signup`; (d) responsive collapse of the trust-cards grid under 960px.

***Estimated time******:*** 45–60 min (single file, no backend/schema changes).

---

## AC → Implementation mapping

| AC Scenario | Implementation step | How it's satisfied |
| --- | --- | --- |
| 1 — visitor sees marketing content, not redirected | Step 1 (remove `redirect`, render landing JSX) | `page.tsx` returns marketing JSX unconditionally; the `redirect('/login')` call is deleted, not conditioned |
| 2 — visitor proceeds to sign up | Step 1 (secondary `Link href="/signup"`) | Secondary text link under the primary CTA, following the `login`/`signup` footer-link pattern |
| 3 — visitor proceeds to sign in | Step 1 (primary CTA `Link href="/login"`) | Primary `Button` CTA, matches the mockup's single "Ingresar al sistema" button |

---

## Technical Decisions (Story-specific)

### Decision 1: Add a secondary sign-up link not present in the mockup

***Chosen******:*** Add a low-emphasis text link ("¿Todavía no tenés cuenta? Creá tu cuenta.") below the primary CTA, pointing to `/signup`.

***Reasoning******:***

- ✅ AC Scenario 2 explicitly requires a path from the landing page to the account-creation screen. The mockup (`landing-2.html`) only has ONE button, linking to `login.html` — it predates TD-4 (signup) and TD-29 being written up as separate stories with explicit Gherkin AC, so it doesn't yet reflect the sign-up path requirement.
- ✅ Keeps the master design plan's §4.1 fidelity-checklist item ("Un solo CTA primario — no competir con otros botones") intact: the sign-up path is a secondary, low-visual-weight text link, not a second competing button — same visual hierarchy already established on `login/page.tsx` and `signup/page.tsx` for the reciprocal link.
- ❌ Trade-off: this is content the mockup doesn't show. Flagged below as an open question rather than silently ratifying it as a mockup divergence in `master-design-plan.md` §5 (that promotion is a PM/design call, not a dev-planning one) — this plan treats it as the minimal, precedent-consistent way to satisfy the AC without inventing new visual patterns.

This is a ***story-local*** UI decision (one file, reversible, no cross-cutting invariant) — does not meet the ADR two-gate test (architectural AND hard to reverse), so it stays here, not promoted to `.context/ADR/`.

---

## Open Questions (flag, do not silently decide)

1. ***Secondary CTA not in the mockup*** (see Decision 1) — the plan resolves this with a low-weight text link consistent with existing pages' pattern, but this is new content vs. the mockup and worth a quick confirm before/while building. Does not block planning; flagged for visibility.
2. ***Authenticated visitor hitting ***`/` — AC only specifies "a visitor who has never signed in." Whether an already-authenticated user hitting `/` should see the landing page too, or get redirected to `/empresas`/`/dashboard`, is unspecified in AC/Scope. This plan builds the landing unconditionally for `/` (simplest option, satisfies the stated AC) and does NOT add a session check — if product wants authenticated-user redirect behavior, that's a separate follow-up (not fabricated here).

---

## Dependencies

***Pre-requisitos técnicos******:***

- [x] Mockup ready (`landing-2.html`, referenced in master design plan §4.1) — no design blocker.
- [x] No dependency-graph blocker per `dev-roadmap.md` §3/§6 — TD-29 has no inbound edge, not mockup-gated.
- [x] `Button`/`Card` primitives already live in `src/components/ui/` — no new primitives needed.

---

## Risks & Mitigations

***Risk 1******:*** Secondary sign-up link (Decision 1) reads as visually competing with the primary CTA, undermining the "one primary action per screen" design principle.

- ***Impact******:*** Low
- ***Mitigation******:*** Match the exact low-emphasis styling already used for the equivalent reciprocal links on `login/page.tsx` (`text-muted-foreground` paragraph + `font-semibold text-primary hover:underline` inline link) — a pattern already accepted for two other live pages.

***Risk 2******:*** None identified for backend/data — this story touches zero backend, zero schema, zero API routes.

---

## Estimated Effort

| Step | Time |
| --- | --- |
| 1. Rewrite `src/app/page.tsx` | 45–60 min |
| ***Total**** | ****~******1 hour*** |

***Story points******:*** not set in Jira (`story.md` shows `-`).

---

## Definition of Done Checklist

- [ ] Code implemented per this plan
- [ ] All 3 AC scenarios passing (manual/live-UI verification — no automated test suite for this page, see Step 1 Testing note)
- [ ] No backend/type changes involved — N/A for backend-types checklist items
- [ ] Design-system fidelity: §4.1 checklist items in `master-design-plan.md` satisfied (single primary CTA, disclaimer visible, responsive collapse under 720px/960px)
- [ ] Content Writing: real domain copy carried from the mockup, no placeholder text
- [ ] No new routes added to `middleware.ts` — none exists in this repo; `/` remains public by default (no auth guard to update)
- [ ] Lint / typecheck / build clean
- [ ] Live-UI validation pass on the running dev server (loading has no meaning here — static page — but all 3 AC flows clicked through)
- [ ] Code review approved
- [ ] Deployed to staging; manual smoke test (desktop + mobile) on `https://tudeclaracion-staging.onrender.com/`

---

## Review Workload Forecast

Estimated: 55 additions + 10 deletions = 65 total lines
400-line budget risk: Low
Chain strategy: pending
Decision needed before apply: No

**(Single modified file, ****~****55 new lines of JSX replacing a 10-line redirect stub. **`55 × 1.0 × 1.2 ≈ 66`**, rounded. Well under the 200-line Low threshold — no chain decision needed, **`pending`** is fine per the algorithm's own rule for **`Z < 200`**.)**

---


_Synced from Jira by sync-jira-issues_
