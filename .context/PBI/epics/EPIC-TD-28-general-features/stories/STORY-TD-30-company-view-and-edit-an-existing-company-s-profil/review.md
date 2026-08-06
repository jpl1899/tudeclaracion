# TD-30 — Code Review

> Dev-authored, non-Jira. Not synced from Jira.

## PR1 (#25) — migration + `/empresas/[id]` route + detail/edit form

### Reviewer

Independent adversarial subagent (fresh context, no implementation stake). Orchestrator adjudicated each finding against the actual diff/schema before acting.

### Findings and adjudication

| # | Severity | Location | Finding | Verdict | Action |
|---|---|---|---|---|---|
| 1 | MAJOR | `empresa-detalle-client.tsx:184` | `error?.code === '23505'` misclassifies any `plan_cuentas` unique-constraint hit as "duplicate RUT" | **legitimate** — confirmed both extra constraints exist via `pg_constraint`; live-reproduced the false message | **fixed** — commit `d71f9df` |
| 2 | MINOR | `page.tsx:24-32` | Malformed (non-UUID) `id` route param throws a raw 500 instead of 404 | **legitimate** — live-reproduced via `/empresas/not-a-uuid` | **fixed** — commit `3006206` |
| 3 | MINOR | migration comment | No migration file creates `public.empresa`/its RLS policies — pre-existing infra debt | **legitimate but out of scope** (Anti-pattern S8) | **not fixed** — flagged as follow-up |
| 4 | NIT | `empresa-detalle-client.tsx:62-73` | Dead `id` field on row state, never read | **legitimate, trivial** | **skipped** — not worth the extra surface area |

## PR2 (#26) — "Ver empresa" link on `empresas-client.tsx`

### Reviewer

Independent adversarial subagent (fresh context, no implementation stake), scoped to the feature commit only (docs commit `15b10d8` skipped — non-code).

### Findings and adjudication

| # | Severity | Location | Finding | Verdict | Action |
|---|---|---|---|---|---|
| 1 | MAJOR | `empresas-client.tsx:105-117` | Card restructure moved `p-4.5` padding to the outer (non-interactive) `<div>` while the click handler stayed on an inner `<button>` sized to its content only — hover highlight region (outer div) wouldn't match the actual click/focus target (inner button), a "looks clickable, isn't" affordance mismatch, plus a shrunk keyboard-focus ring | **legitimate in principle, but investigation found the practical severity was overstated**: live `getComputedStyle` check showed the card's `padding` computes to `0px` — `p-4.5` is not a valid Tailwind utility (the default spacing scale has no `4.5` step, and `tailwind.config.ts` doesn't extend it), so there was never a real padded gap between the div and the button in the first place. The actual "dead" hover zone is just the `gap-3` (12px) strip between the button and the "Ver empresa" row — much smaller than the finding described, and arguably acceptable (a small, deliberate visual separation before a differently-styled secondary action). **Still fixed**, because scoping the highlight to the button also fixes a separate, real issue the investigation surfaced: the *unscoped* `hover:`/plain focus styling lit up the whole card — including while hovering the "Ver empresa" pill itself — implying that button also affects selection, which it doesn't. | **fixed** — commit `f09988a`, via `has-[button:hover]`/`has-[button:focus-visible]` on the outer div instead of touching the (separately broken) padding |

### New discovery (out of scope for this story, not fixed here)

**`p-4.5` (and `gap-4.5`/`px-4.5`/`py-4.5`/`pb-4.5`) is a dead Tailwind utility across this codebase** — Tailwind's default spacing scale has no `4.5` step (jumps `4` → `5`), and `tailwind.config.ts` does not extend `theme.spacing`, so any class using `4.5` compiles to nothing (confirmed via live `getComputedStyle().padding === '0px'`). Found in 3 files, 7 occurrences (`grep -rn 'p-4\.5\|gap-4\.5\|px-4\.5\|py-4\.5\|pb-4\.5' src/`): `src/app/dashboard/dashboard-client.tsx`, `src/app/dashboard/declaraciones/[periodo]/declaracion-detalle-client.tsx`, `src/app/empresas/empresas-client.tsx`. Predates TD-30 entirely (present in the original, un-restructured card). Not fixed here — touches screens outside this story's scope (Anti-pattern S8). Worth its own tech-debt ticket: likely a typo for `p-4` (16px) or `p-5` (20px), or an intentional custom half-step that never made it into `theme.spacing.extend`.

## Live-UI re-verification

- PR1 fixes: `/empresas/not-a-uuid` → clean 404; intra-submission `codigo_iva` duplicate → generic error naming the real constraint, no false RUT message.
- PR2: card-body click still selects (sidebar updates correctly); "Ver empresa" link navigates to the correct `/empresas/[id]`, landing pre-filled; card selection unaffected by the link.

## Glossary check

No new or ambiguous domain terms introduced by either PR.

## Verification after fixes

`bunx tsc --noEmit` clean · `bun run lint:check` clean · `bun run test` 94/94 pass, 8/8 files (both PRs).
