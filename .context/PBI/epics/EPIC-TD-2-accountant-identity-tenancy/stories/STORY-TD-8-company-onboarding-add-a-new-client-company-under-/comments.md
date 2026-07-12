# Comments for TD-8

[View in Jira](https://lk-tudeclaracion.atlassian.net/browse/TD-8)

---

### Juan Leites - 7/7/2026, 19:50:20

## Acceptance Criteria

```gherkin
Scenario: Happy path add company
  Given Rosana is on the company selection screen
  When she chooses to add a new company
  And she enters a valid RUT and company name
  And she confirms
  Then the new company is created under her account
  And it appears immediately in her company list

Scenario: Duplicate RUT rejection
  Given Rosana enters a RUT that is already registered under her account
  When she confirms the new company form
  Then she sees an error message telling her the RUT is already registered
  And no duplicate company is created

Scenario: Required-field validation
  Given Rosana leaves the RUT or company name empty
  When she tries to confirm the new company form
  Then she sees a validation message identifying the missing field
  And the company is not created
```

---

### Juan Leites - 7/7/2026, 19:50:21

## Scope

- Add a company by RUT and name
- Associate the new company with the authenticated accountant's account
- New company appears immediately in the company list

---

### Juan Leites - 7/7/2026, 19:50:22

## Out Of Scope

- Editing or deleting an existing company
- Bulk import of companies

---

### Juan Leites - 12/7/2026, 17:11:37

## Scope note (2026-07-12): now includes chart-of-accounts entry

TD-7 (chart-of-accounts-to-fiscal-concept mapping) was unblocked by reversing its self-service-out-of-scope decision -- see TD-7's comment for the full reversal note. Practical consequence for TD-8: the 'Agregar nueva empresa' flow (currently a placeholder alert() in src/app/empresas/empresas-client.tsx) now needs to include a step/section where the accountant defines that new company's chart-of-accounts-to-fiscal-concept mapping, not just company identity fields (nombre, RUT, etc.).

Not yet mocked -- master-design-plan.md still lists TD-8's onboarding flow as unmocked (SS4.4). Will need a just-in-time design brief covering both concerns (company fields + chart-of-accounts rows) when TD-8 is picked up.

---

### Juan Leites - 12/7/2026, 17:49:31

## Spec Implementation Plan (Dev)

# Implementation Plan: STORY-TD-8 - Company Onboarding | Add a new client company under my account

## Overview

Self-service company creation for an accountant (RUT + name), combined in the same flow with TD-7's chart-of-accounts entry (folded in per the 2026-07-12 self-service reversal — see TD-7's implementation plan / Jira comment). One screen, one submit, one atomic DB write.

***Acceptance Criteria to satisfy*** (source: `comments.md`, Gherkin, TD-8):
- Happy path: valid RUT + name -> company created, appears immediately in the company list.
- Duplicate RUT: RUT already registered under this account -> specific error, no company created.
- Required-field validation: RUT or name empty -> validation message identifying the missing field.

Plus TD-7's folded-in requirement: the 5-row chart-of-accounts mapping is captured in the same submit and available to the Normalizer (TD-15) afterward.

---

## Technical Approach

***Chosen approach****: new route `/empresas/nueva`, client component mirroring the existing `login`/`signup` pattern (browser Supabase client, no Server Action). Both the company row and its 5 chart-of-accounts rows are written in ****one atomic Postgres RPC*** (`crear*empresa*con*plan*cuentas`), not two sequential client-side inserts — a partial failure between them would leave a company with an incomplete tax mapping, silently breaking the Normalizer (TD-15) later. `security invoker` on the function keeps RLS enforced (runs as the calling user, not a bypass).

***New DB schema*** (2 tables + 1 function — see Dependencies for the exact migration):
- `codigo*iva` — global reference catalog, NOT tenant-scoped. Seeded once with the 5 confirmed rows (id, tipo, tasa, rubro*padi, descripcion) from the domain-model session (engram topic `domain/parser-codigoiva-mapping`). RLS: `select` for any authenticated user (read-only reference data).
- `plan*cuentas` — per-company mapping (`empresa*id` FK, `codigo*iva` FK, `numero*cuenta`). RLS scoped through `empresa.cuenta*id = auth.uid()` (same join pattern as `empresa`'s own policies — verified live via `supabase db query --linked`). `unique (empresa*id, codigo_iva)` — one row per fixed concept per company.
- `crear*empresa*con*plan*cuentas(p*rut, p*nombre, p*cuentas jsonb) returns uuid` — inserts the `empresa` row, then all 5 `plan*cuentas` rows, in one transaction.

***Duplicate-RUT detection***: the DB already has `empresa*cuenta*rut*unique UNIQUE (cuenta*id, rut)` (pre-existing constraint, confirmed live) — no new constraint needed. The RPC's `empresa` insert raises Postgres `unique_violation` (23505) on a duplicate; the client catches that error code and shows the "RUT ya registrado" message. No app-level pre-check (same anti-enumeration-style pattern already used for TD-4's duplicate-email detection — let the DB be the source of truth, don't leak existence via a separate query).

***Why this approach***:
- Atomic RPC avoids a real data-integrity failure mode (orphaned company with a missing/partial tax mapping) that plain sequential client inserts would risk.
- Reuses the exact RLS pattern already live on `empresa` — no new security model introduced.
- Zero new backend framework surface — same browser-client pattern as every other form built so far (login/signup/forgot-password/reset-password).

***Alternatives considered***:
- ***Two sequential client-side inserts (empresa, then 5x plan_cuentas)*** — rejected: no transactional guarantee: browser network failure or tab close between the two calls leaves a company with 0/5 or partial mapping rows, and TD-15's Normalizer would silently have no fiscal-concept resolution for that company's transactions later, with no clear error surfaced anywhere. The failure is invisible until someone tries to process a declaration.
- ***Server Action instead of RPC*** — considered, rejected for consistency: no other story in this repo uses a Server Action for a Supabase write; all of them (login, signup, forgot-password, reset-password) call the browser client directly. An RPC keeps the atomicity guarantee without introducing a second write pattern into the codebase.

---

## UI/UX Design

***Screen spec***: `.context/design/master-design-plan.md` §4.7 (Agregar nueva empresa), §5 D4 (ratified divergence — build uses `/empresas`'s live shell, not the mockup's dashboard-sidebar chrome).
***Mockup***: `.context/designs/tudeclaracion/company-onboarding/company-onboarding-2.html` — content/states taken, tokens/chrome not.
***Route***: `/empresas/nueva` (authenticated, reached from `/empresas`'s "Agregar nueva empresa" card).

### Components to reuse (already exist)

- `Button`/`Input`/`Label` (`@/components/ui/*`) — same `h-[52px]` pattern as every other form.
- `/empresas`'s simple centered-card shell (`grid ... place-items-center`, `border border-border bg-card`) — NOT the sidebar/header chrome from the mockup, which doesn't exist yet at this point in the flow (see D4).

### New component surface

- No new reusable component — page owns local state for the 2 form parts + validation, same single-file pattern as `signup`/`reset-password`.

### States mapped from mockup to real app states

| Mockup state | Real app trigger | UI treatment |
| --- | --- | --- |
| Vacío | Initial render | Both parts visible, no errors |
| Campos requeridos | Submit with RUT or nombre empty | Field-level error under the missing field(s) |
| Cuenta contable faltante | Submit with any of the 5 account fields empty | Field-level error under that row |
| RUT duplicado | RPC raises `23505` on `empresa` insert | Error panel + RUT field marked invalid |
| Éxito | RPC returns the new `empresa_id` | Success panel, summary, links back to `/empresas` or "add another" |

### Responsive

- Reuses `/empresas`'s existing breakpoint (1 column under 980px) — no new breakpoint needed, form is a single column already at desktop width (unlike the mockup's 2-column grid, dropped along with its chrome — see D4).

---

## Types & Type Safety

- `src/types/supabase.ts` needs regeneration after the migration (`supabase generate*typescript*types` / `supabase gen types typescript --project-id <ref>`) to pick up `codigo*iva`, `plan*cuentas`, and the RPC signature — run as the last step of Stage 2, not before (types must reflect the applied schema).
- RPC call typed via `supabase.rpc('crear*empresa*con*plan*cuentas', { p*rut, p*nombre, p_cuentas })` — return type `uuid` (new empresa id).

---

## Content Writing

Copy taken verbatim from the mockup's Parte A / Parte B sections (already matches the product's established tone):
- Heading: "Agregá la empresa y dejá listo el vínculo con los conceptos fiscales del 2181."
- RUT label/placeholder: "RUT" / `214589630019`, helper "Ingresá el RUT completo, sin puntos ni guiones."
- Nombre label/placeholder: "Nombre de la empresa" / `Comercial del Sur S.A.`
- Duplicate-RUT message: "Este RUT ya está registrado en tu cuenta."
- Section B intro: "Estas cinco relaciones conectan tu plan de cuentas con las líneas fiscales estándar que usa DGI en el 2181."
- Row labels (fixed, not editable): IVA Compras 10%/22%, IVA Ventas 10%/22%, Compra Exenta 0% — same wording as the `codigo_iva` seed data.
- Success: "Empresa creada correctamente." + summary stats (mapa 5/5 completo).

---

## Implementation Steps

### Step 1: Database migration — codigo*iva, plan*cuentas, RPC

***Task***: create the two tables + seed data + atomic RPC function.
***File***: applied via `mcp_*supabase**apply*migration` (or `supabase db push` once local migration files exist) — no local `.sql` file convention established yet in this repo, apply directly to the linked project.
***Structure/Logic***: per the Technical Approach section above — full DDL drafted, ready to apply on confirmation.
***Testing***: verify via `supabase db query --linked` that both tables + policies + function exist as expected; manually insert a test row to confirm RLS blocks a different `cuenta_id`.
***Estimated time***: 30 min

### Step 2: Regenerate Supabase types

***Task***: `supabase generate*typescript*types` (or MCP equivalent) → `src/types/supabase.ts`.
***Estimated time***: 5 min

### Step 3: `/empresas/nueva` page

***Task***: build the two-part form wired to the new RPC.
***File***: `src/app/empresas/nueva/page.tsx` (new)
***Structure/Logic***:
- Local state: `rut`, `nombre`, `cuentas` (array of 5 `{ codigoIva, numeroCuenta }`), `submitted`, `authError: 'duplicate' | null`, `isSubmitting`, `isSuccess`.
- On submit: client-side required-field check first (RUT, nombre, all 5 account numbers) — mirrors the mockup's validation order. If clean, call the RPC.
- RPC error handling: catch Postgres error code `23505` → set `authError = 'duplicate'`; any other error → generic failure message (fail-fast per `error-handling.md` — no silent swallow).
- On success: show the success panel (no client-side route push needed immediately — mirrors the mockup's "stay and confirm" pattern, with links to `/empresas` or reset-and-add-another).

***Edge cases handled***:
- RUT sanitization: strip non-digits as the user types (mockup's own JS does this — keep it, matches the field's `inputmode="numeric"` intent).
- Re-submitting after a duplicate-RUT error with a corrected RUT clears the error (mirrors signup's email-change-clears-duplicate-error pattern).

***Testing***: unit tests for any pure validation helper extracted (if the required-field check grows beyond trivial inline logic); manual E2E against the 3 Gherkin scenarios.
***Estimated time***: 2.5 hr

### Step 4: Wire `/empresas`'s "Agregar nueva empresa" card

***Task***: replace the `addPending` placeholder state with real navigation.
***File***: `src/app/empresas/empresas-client.tsx` (modify)
***Structure/Logic***: change the card's `onClick` from `setAddPending(true)` to `router.push('/empresas/nueva')`; remove the now-dead `addPending` state and its placeholder message block.
***Testing***: manual click-through.
***Estimated time***: 10 min

### Step N: Integration

***Task***: verify the full flow end to end.
***Flow completo***:
1. From `/empresas`, click "Agregar nueva empresa" -> lands on `/empresas/nueva`.
2. Submit with RUT or nombre empty -> field-level validation error (AC3).
3. Submit with a RUT already used by this account -> "RUT ya registrado" error, no company created (AC2).
4. Submit with a new RUT + name + all 5 account numbers -> success panel, company appears in `/empresas` on return (AC1). Confirm via SQL that `plan*cuentas` has exactly 5 rows for the new `empresa*id`.

***Testing***: manual E2E on staging (no automated E2E runner configured in this repo).
***Estimated time***: 30 min

---

## Technical Decisions (Story-specific)

### Decision 1: Atomic RPC over sequential client-side inserts

See "Why this approach" / "Alternatives considered" above. Not promoted to an ADR — this is a story-local persistence-pattern choice, not a system-wide invariant (it doesn't change how **other** multi-table writes in this codebase are done, since this is the first one).

### Decision 2: `codigo_iva` as a DB reference table, not a hardcoded app constant

***Chosen***: seed the 5 rows into a real `codigo_iva` table rather than a TypeScript constant.
***Reasoning***: ADR-0001 already commits the tax engine to "reglas en DB, no hardcodeadas" — this catalog is exactly that kind of rule (tipo/tasa/rubro PADI per code), and TD-22/TD-23 (Tax Rules Engine) will need to read the same table. Seeding it once now avoids a second migration later when those stories land.

---

## Dependencies

***Pre-requisitos técnicos***:
- [ ] Migration must be applied before Step 3 can be tested end-to-end (Step 1 blocks Step 3).
- [ ] `src/types/supabase.ts` regenerated after the migration (Step 2), before writing Step 3's code (needs the real types for `plan*cuentas`/`codigo*iva`/the RPC).

---

## Risks & Mitigations

***Risk 1***: The `codigo_iva` catalog is currently only 5 rows / confirmed for the 2181 form. If a future form needs different codes, this table's shape may need revisiting.
- ***Impact***: Low (out of MVP scope, `mvp-scope.md` confirms 2181-only).
- ***Mitigation***: none needed now: documented here for future-story awareness.

***Risk 2***: RPC `security invoker` relies on `auth.uid()` being correctly available inside the function context when called via the browser client with an active session — same mechanism already proven working for every other RLS-scoped query in this app (`empresa`'s own policies), so low residual risk, but worth confirming during Step 1's manual RLS test (insert as one `cuenta_id`, confirm a different session cannot read/write it).
- ***Impact***: Medium if wrong (would be a tenant-isolation bug).
- ***Mitigation***: explicit manual RLS test in Step 1, not just "it should work by analogy".

---

## Estimated Effort

| Step | Time |
| --- | --- |
| 1. DB migration (2 tables + RPC) | 30 min |
| 2. Regenerate Supabase types | 5 min |
| 3. `/empresas/nueva` page | 2.5 hr |
| 4. Wire `/empresas`'s onboarding card | 10 min |
| N. Integration / manual E2E | 30 min |
| ***Total**** | ****~3.75 hr*** |

---

## Definition of Done Checklist

- [ ] Código implementado según este plan
- [ ] Los 3 Acceptance Criteria (Gherkin, TD-8) pasando
- [ ] TD-7's folded-in requirement satisfied: 5-row plan_cuentas written atomically with the company
- [ ] Tipos del backend regenerados y usados correctamente
- [ ] Personalidad UI/UX aplicada consistentemente (shell de `/empresas`, no el chrome del mockup — ver D4)
- [ ] Content Writing contextual (NO genérico) — copy tomado verbatim del mockup
- [ ] Protección de rutas (autenticado, RLS verificado manualmente)
- [ ] Tests unitarios — solo si se extrae lógica de validación pura; si no, smoke test manual
- [ ] Code review aprobado
- [ ] Sin errores de linting/TypeScript
- [ ] Deployed to staging
- [ ] Manual smoke test en staging

---

## Review Workload Forecast

Estimated: ~280 additions + ~15 deletions = ~295 total lines (excluding the SQL migration, which doesn't count against the line-review budget the same way — DDL review is a different kind of check)
400-line budget risk: Low
Chain strategy: not needed at this size — single branch, single PR
Decision needed before apply: No

Notes: dominant cost is `src/app/empresas/nueva/page.tsx` (~220 lines, new, two-part form with 5 dynamic-but-fixed rows) plus the regenerated `src/types/supabase.ts` diff (machine-generated, not part of the human-reviewed line count in practice). `empresas-client.tsx` edit is trivial (~10 lines).


---


_Synced from Jira by sync-jira-issues_
