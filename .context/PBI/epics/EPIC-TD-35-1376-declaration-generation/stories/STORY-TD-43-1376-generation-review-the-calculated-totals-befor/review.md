# TD-43 — Code Review (PR #38)

Mode: Solo — fresh-eyes review pass inline over `git diff origin/staging...HEAD`, then per-finding adjudication.

## Decision

Approved after fixes #1 and #2 (commit on the PR branch). No BLOCKER / MAJOR findings.

## Checklist

- AC: 5/5 scenarios mapped — see `compliance-matrix.md`.
- Lint / types / tests: green (147/147).
- Code standards: max 2 positional params (`cargarRevision` takes an object), imports via `@/` aliases, interfaces at top of file.
- Security: RLS on `declaracion_1376` for select / insert / update scoped to the owner's empresa; no secrets in the diff.
- UI: spec-only build on the 2181 detail template; same shell, `Card` / `Badge` / `Button` / `Checkbox` from the design system; `data-testid`s follow the existing snake_case convention.

## Findings and adjudication

| # | finding | severity | verdict | reason | action |
| - | ------- | -------- | ------- | ------ | ------ |
| 1 | `src/app/dashboard/declaraciones-1376/[periodo]/page.tsx` — every Supabase error returns `{ tipo: 'error' }` with the cause discarded; a production failure would be undiagnosable | MINOR | legitimate | The guided error state replaces the thrown exception, so nothing reaches the logs | Fixed: `fallo()` logs `[revision-1376] <context>: <message>` via `console.error` (same pattern as `src/app/signup/page.tsx`) |
| 2 | `page.tsx` get-or-create — two concurrent first visits: the second `insert` hits `unique (empresa_id, periodo)` and the user sees the error state | MINOR | legitimate | Select-then-insert is not atomic; the unique violation is reachable with two tabs | Fixed: on `UNIQUE_VIOLATION_CODE` (23505) re-read the row instead of failing |
| 3 | `supabase/migrations/20260923100806_crear_declaracion_1376.sql:39` — the update policy has no `with check`, so a user could move a row to another empresa | MAJOR (proposed) | false-positive | Postgres uses the `USING` expression as `WITH CHECK` when `WITH CHECK` is omitted, so the new row must also belong to the user's empresa | dismissed |
| 4 | `page.tsx` — the Server Component writes (`insert`) during render; `<Link>` prefetch of "Ver 1376" could create rows just by showing the dashboard | MAJOR (proposed) | false-positive | Next.js docs (Context7, `/vercel/next.js`): dynamic routes (this page reads cookies) are not prefetched unless a `loading.js` exists, and then only down to that boundary, never the page. Write-on-first-visit was ratified in the plan | dismissed |
| 5 | `revision-1376-client.tsx` — sidebar/shell markup duplicated from `declaracion-detalle-client.tsx` and `dashboard-client.tsx` (3 copies) | MINOR | legitimate, deferred | Real DRY debt, but extracting a shared dashboard layout touches two screens outside this story's scope (S8) | follow-up tech-debt: extract a shared `/dashboard` shell |
| 6 | `detectar-cuentas-sin-mapear.ts` — an account mapped on one side (e.g. Debe) but with movement only on the other side is not flagged, and its amount is silently excluded | MINOR | legitimate, deferred | Outside this AC ("not mapped to any line code"); belongs to TD-47's full validation scope | note for TD-47 |
| 7 | `revision-1376-client.tsx` — with zero totals and no warning, the download is enabled for an empty result | NIT | false-positive | The AC says the download is available on a clean result; what an empty file contains is TD-44's concern | dismissed |
| 8 | PR size 677 lines vs forecast ~360 | NIT | legitimate, accepted | The overshoot is tests (97), hand-added generated types (35), synced Jira docs (48) and 2 PNGs; reviewable production code is ~440 lines | no split |

## Glossary

No new domain terms introduced.
