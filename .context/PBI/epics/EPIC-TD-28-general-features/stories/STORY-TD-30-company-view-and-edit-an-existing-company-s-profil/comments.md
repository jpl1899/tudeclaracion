# Comments for TD-30

[View in Jira](https://lk-tudeclaracion.atlassian.net/browse/TD-30)

---

### Juan Leites - 5/8/2026, 15:56:46

## Acceptance Criteria

```gherkin
Scenario: Accountant opens an existing company's profile from the company list
  Given the accountant is viewing the list of companies under their account
  When the accountant chooses to view one of the listed companies
  Then the accountant sees that company's current name, RUT, IVA-code mapping, and exempt-purchases mapping already filled in

Scenario: Accountant updates a company's data and saves successfully
  Given the accountant is viewing an existing company's profile with valid changes made
  When the accountant saves the changes
  Then the company's data is updated
  And the accountant sees a clear confirmation that the changes were saved

Scenario: Accountant tries to save with incomplete required data
  Given the accountant is editing an existing company's profile
  When the accountant tries to save with a missing or invalid RUT, or with an incomplete IVA-code or exempt-purchases row
  Then the save is rejected
  And the accountant sees a clear message indicating what needs to be completed

Scenario: Accountant tries to save a RUT that belongs to another company
  Given the accountant is editing an existing company's profile
  When the accountant tries to save a RUT that already belongs to a different company in the same account
  Then the save is rejected
  And the accountant sees a clear message explaining that the RUT is already in use by another company
```

---

### Juan Leites - 5/8/2026, 15:56:47

## Scope

- Each company in the company list offers a way to open that company's own detail view, independent of selecting it as the active company.
- The company detail view shows the company's current name, RUT, IVA-code mapping, and exempt-purchases mapping, pre-filled with the values already saved.
- The accountant can add, edit, or remove rows in both the IVA-code mapping and the exempt-purchases mapping.
- The accountant can save changes to update the company's data.
- The accountant can leave the screen without saving and return to the company list.
- Saving shows a clear success confirmation.
- Saving shows a clear, specific error when required data is missing or invalid, or when the RUT collides with another company in the same account.

---

### Juan Leites - 5/8/2026, 15:56:48

## Out Of Scope

- Creating a new company (already covered by the existing company-onboarding flow).
- Deleting or deactivating a company.
- Reassigning a company to a different accountant/account.
- A change history / audit trail for a company's data.
- Editing more than one company at a time (bulk editing).

---

### Juan Leites - 5/8/2026, 15:56:50

## Business Rules Specification

- A RUT cannot be shared by two companies within the same accountant's account — the same uniqueness rule already enforced when a company is first created.
- Every row in the IVA-code mapping and every row in the exempt-purchases mapping must have its account field filled in before the company can be saved.

---

### Juan Leites - 5/8/2026, 16:25:08

## Spec Implementation Plan (Dev) — Part 1/5

# Implementation Plan: STORY-TD-30 - Company | View and edit an existing company's profile

## Overview

Add a detail/edit screen for an existing company. Today `/empresas` only lets the accountant **select** a company as active or create a new one (`/empresas/nueva`) — there is no way to open a single company's own record and change its name, RUT, or its two tax-account mapping tables (IVA-code mapping, exempt-purchases mapping) without recreating it. This story adds a "Ver empresa" action on each company card that opens `/empresas/[id]`, a dedicated view/edit screen scoped to that one company.

***Acceptance Criteria to satisfy*** (from TD-30 `comments.md`, 2026-08-05 — no Jira custom field configured for AC in this workspace):

- Scenario 1: opening an existing company's profile from the list pre-fills name, RUT, IVA-code mapping, and exempt-purchases mapping with the values already saved.
- Scenario 2: saving valid changes updates the company and shows a clear success confirmation.
- Scenario 3: saving with a missing/invalid RUT or an incomplete IVA/exempt row is rejected with a clear message of what to complete.
- Scenario 4: saving a RUT that already belongs to another company in the same account is rejected with a clear message naming the conflict.

***Scope*** (from `comments.md`): per-card "Ver empresa" entry point independent of selection; pre-filled detail view; add/edit/remove rows in both mapping tables; save; leave without saving; success confirmation; specific validation/duplicate-RUT errors.

***Out of scope*** (from `comments.md`): creating a company (already `company-onboarding`), deleting/deactivating a company, reassigning a company to another account, change history/audit trail, bulk editing.

---

## Technical Approach

***Chosen approach******:**** Extend the existing `empresa`/`plan*cuentas` data model with a ****new symmetric RPC****, `editar*empresa*con*plan*cuentas`, that mirrors `crear*empresa*con*plan*cuentas` (same `security invoker` + `set search*path = ''` pattern, same `p*cuentas jsonb` row shape) but takes an existing `p*empresa*id` and does an UPDATE on `empresa` + a ****delete-all-then-reinsert*** of that company's `plan*cuentas` rows, instead of two INSERTs. The new route `/empresas/[id]` follows the same Server Component (RLS-scoped fetch) + client component split already used by `/empresas` (`page.tsx` + `empresas-client.tsx`) and by `/empresas/nueva` (`nueva-empresa-client.tsx`), and the new client component mirrors `nueva-empresa-client.tsx`'s structure closely (same libs — `createClient` from `@/infrastructure/supabase/client`, same validation style, same `23505` duplicate-RUT error-code handling, same table-of-rows pattern for IVA/exempt).

***Live schema verified before writing this plan*** (via read-only SQL MCP against the staging project, `kqrleobwemscldkfissh` — migration files alone don't show `empresa`'s defining migration, it predates this repo's migration history):

- `empresa` columns: `id uuid pk`, `cuenta*id uuid` (FK → `cuenta`, cascade), `nombre text not null`, `rut text not null`, `estado text not null default 'Pendiente'` (check `Operativa`/`Pendiente`), `responsable text`, `ultimo*movimiento text`, `created*at`, `updated*at timestamptz not null`.
- `empresa` constraints: `empresa*cuenta*rut*unique UNIQUE (cuenta*id, rut)` — this is the constraint that Scenario 4 (duplicate RUT) hits; `empresa*rut*check CHECK (rut ~ '^[0-9]{12}$')`.
- `empresa` RLS — ***already has full CRUD***, not just select/insert as the migration files alone suggested: `empresa*select*own`, `empresa*insert*own`, `empresa*update*own` (`USING`/`WITH CHECK` both `cuenta*id = auth.uid()`), `empresa*delete*own`. So no RLS work is needed on `empresa` itself — only on `plan*cuentas`.
- `plan*cuentas` RLS — confirmed ***only*** `plan*cuentas*select*own` and `plan*cuentas*insert*own` exist (both via `EXISTS (... empresa e WHERE e.id = plan*cuentas.empresa*id AND e.cuenta*id = auth.uid())`). No `UPDATE`/`DELETE` policy today — this blocks any edit path until one is added.
- `plan*cuentas` constraints: `codigo*padi CHECK (codigo*padi in ('502','503','504','505','506'))`, `codigo*iva CHECK (0–9)`, `UNIQUE (empresa*id, cuenta*contable)`, `UNIQUE (empresa*id, codigo*iva)`, FK `empresa_id → empresa(id) ON DELETE CASCADE`.
- `crear*empresa*con*plan*cuentas(p*rut, p*nombre, p*cuentas jsonb)` — confirmed live definition matches the migration file: `security invoker` (default, not stated = invoker), `set search*path = ''`, inserts one `empresa` row then bulk-inserts `plan*cuentas` from `jsonb*array*elements(p*cuentas)`.

***Reconciliation strategy for ****`plan*cuentas`**** (added/edited/removed rows) — decided******:****** delete-all-then-reinsert, scoped inside the function by ****`empresa*id`****, not a row-by-row diff/upsert.***

- ***Chosen******:*** inside `editar*empresa*con*plan*cuentas`, after the `empresa` UPDATE, `DELETE FROM plan*cuentas WHERE empresa*id = p*empresa*id` then bulk-insert the submitted `p*cuentas` set — same jsonb shape and same INSERT statement already proven by `crear*empresa*con*plan*cuentas`. Both statements run inside the function's implicit single transaction, so a partial failure (e.g. a duplicate `cuenta*contable` in the submitted set) rolls back the delete too — the company never ends up with an empty mapping.
- ***RLS added******:**** one new policy, `plan*cuentas*delete*own`, identical ownership check to `plan*cuentas*select*own`/`plan*cuentas*insert*own` (`EXISTS (... e.cuenta*id = auth.uid())`). ****No ****`UPDATE`**** policy is added*** — the delete-then-reinsert strategy never runs a `plan_cuentas` `UPDATE` statement, so an `UPDATE` policy would be dead code.
- ***Why not row-level diff (match by id, UPDATE changed rows, DELETE removed ids, INSERT new ones)******:*** would need the client to track which rows are pre-existing (with their `id`) vs. newly added in this session, then send three separate lists — more client-side state, more surface for a stale-id bug, and still has to handle the same two unique constraints (`cuenta*contable`, `codigo*iva` per empresa) that a naive UPDATE could violate mid-reconciliation (e.g. swapping two rows' `codigo_iva` values hits the unique constraint mid-statement unless deferred). Delete-then-reinsert sidesteps all of that: the constraints only ever see the final, already-deduplicated set, exactly like company creation does today.
- ❌ ***Trade-off******:*** every save re-generates new `plan*cuentas.id` values (old UUIDs are gone) and a fresh `created*at`. Nothing in the current schema or codebase reads `plan*cuentas.id` as a stable foreign key from anywhere else (`plan*cuentas` is only ever referenced by `empresa_id`, never pointed to), so this is safe today. Documented so it's a conscious call, not an oversight.

***Alternatives considered******:***

- ***Extend ****`crear*empresa*con*plan*cuentas`**** with an optional ****`p*empresa*id`**** param (upsert-style, one function for both create and edit)***: rejected — the two flows have different failure semantics (create always inserts a fresh `empresa` row; edit must reject silently-no-op'd updates against another account's row, see the "not found/unauthorized" behavior below). Overloading one function with a branch on "is this a create or an edit" is exactly the kind of implicit control flow CLAUDE.md's SIMPLICITY FIRST rule warns against; two small symmetric functions are easier to read and to review independently (also keeps each PR/diff smaller, relevant given the Workload Forecast in Part 5).
- ***Row-level diff/upsert instead of delete-then-reinsert***: rejected, see reasoning above.
- ***Extend the existing ****`src/app/empresas/actions.ts`**** Server Action file for the save operation***: rejected — see Decision 2 in Part 4 (no Server Action needed at all for the save path).

***Why this approach******:***

- ✅ Mirrors an already-reviewed, already-live pattern (`crear*empresa*con*plan*cuentas`) almost line for line — minimal new surface for reviewers to reason about from scratch.
- ✅ RLS stays the single source of truth for ownership on both tables — the function does not re-implement an ownership check in application code, consistent with `ADR-0001`'s "reglas en DB, no hardcodeadas" principle already followed by the create flow.
- ✅ The "not found/unauthorized" case (a request for another account's company id) degrades to Postgres's normal RLS behavior — zero rows visible, not a custom error path to get wrong.
- ❌ Trade-off: delete-then-reinsert is slightly more DB work per save than a true diff (extra DELETE), but `plan_cuentas` rows per company are small (single digits in the observed data), so this is not a real performance concern.

---

## UI/UX Design

***Fidelity bar******:**** `.context/design/master-design-plan.md` §4.4 (updated) + §4.9 (new) checklists + `DESIGN.md` tokens/components (frozen contract). Per Live-UI-First (Critical Rule #14, ratified as divergence ****D8****): build with the ****live*** shell/tokens of `/empresas` (Tailwind CSS vars, `Button`/`Input`/`Label`/`Badge` primitives already in `src/components/ui/`), never the two mockups' own `oklch()` custom properties or their standalone topbar. The mockups (`empresas-listado-ver-empresa.html`, `empresa-detalle-edicion.html`) only supply structure, copy, and states.

### Components used (all already live — no new primitives)

- `Button` (`variant="default"` primary "Guardar cambios"; `variant="outline"` for "Volver sin guardar" and per-row remove actions) — same usage pattern as `nueva-empresa-client.tsx`.
- `Input` / `Label` — company name, RUT (`inputMode="numeric" maxLength={12}` + `font-mono`, exact pattern from `nueva-empresa-client.tsx`), per-row `cuenta_contable` fields.
- `Badge` (`@/components/ui/badge`) — "Empresa existente" badge (see Decision 3, Part 4) and, per IVA/exempt row, the existing plain `<select>` pattern (`selectClassName` from `nueva-empresa-client.tsx`, reused, not reinvented) for the PADI code.
- Inline banner divs styled with `border-success/25 bg-success-bg text-success-text` / `border-error/25 bg-error-bg text-error-text` — same literal classes `nueva-empresa-client.tsx` already uses for its RUT error banners, extended here to a 3-state banner set (success / validation-error / save-error) since the edit screen, unlike creation, needs to represent an already-saved state that can also **fail** to save (duplicate RUT is possible on edit in a way it already is on create, but validation-vs-save-error are now two visually distinct banners per the mockup's 3-banner layout, mapped onto the live tokens).

### Layout (from `empresa-detalle-edicion.html`, tokens/shell swapped for the live ones — same swap already ratified for D3/D4/D6/D8)

```
┌──────────────────────────────────────────────────┐
│ /empresas shell header (existing "TD" mark + back)│
├────────────────────────────────────────────────────┤
│ Panel: eyebrow "Edición de empresa existente"      │
│  h1 + lead  |  summary card (empresa, RUT, badge)  │
├────────────────────────────────────────────────────┤
│ Banner (success | validation-error | save-error)   │
├────────────────────────────────────────────────────┤
│ Datos generales card: Nombre + RUT + badge          │
│  "Empresa existente" (badgeInfo, see Decision 3)    │
├────────────────────────────────────────────────────┤
│ Códigos de formato rápido de IVA (table-of-rows)    │
│  [Código IVA select][Cuenta contable][PADI select]  │
│  + "Agregar código de IVA" / empty-state if 0 rows  │
├────────────────────────────────────────────────────┤
│ Compras Exentas (table-of-rows)                     │
│  [Cuenta contable] (badge "Línea 504" fixed)        │
│  + "Agregar cuenta exenta" / empty-state if 0 rows  │
├────────────────────────────────────────────────────┤
│ [Volver sin guardar]        [Guardar cambios]       │
└──────────────────────────────────────────────────────┘
```

### States

- ***Loading******:*** none needed — `page.tsx` is a Server Component, data is resolved before the client component ever renders (same pattern as `/empresas` and `/empresas/nueva`, no client-side fetch/spinner).
- ***Not found / unauthorized******:*** see "Not-found behavior" (Part 2, Step 3) — `notFound()` → Next.js 404, not a custom banner.
- ***Empty (0 rows in a mapping table)******:*** see Decision 1 (Part 4) (both tables, though the story explicitly flags the gap for Compras Exentas).
- ***Editing in progress******:*** clears all banners on any input change (mirrors the mockup's `clearBanners()` behavior and `nueva-empresa-client.tsx`'s `setDuplicateRutError(false)` pattern on RUT change).
- ***Validation error******:*** banner "Revisá los datos antes de guardar." + per-field `invalid` styling (border-error), same visual language `nueva-empresa-client.tsx` already uses per-row.
- ***Save success******:*** banner "Cambios guardados correctamente." — stays on the same screen (does not navigate away), so the accountant can keep verifying the saved state, unlike the create flow which shows a full-screen success panel with "Volver a empresas"/"Agregar otra empresa" (edit has no equivalent "do another one" action, so a full-screen takeover would be a dead end pattern here — inline banner is closer to the mockup's own `successBanner` treatment).
- ***Save error — duplicate RUT******:*** banner "Ya existe otra empresa en esta cuenta con el RUT {rut}." (exact phrasing from the mockup and from TD-30's Business Rules text), driven by catching Postgres `23505` from the RPC call, same as `DUPLICATE*RUT*ERROR_CODE` handling in `nueva-empresa-client.tsx`.

### Responsiveness

- Content grid `minmax(0,1.45fr) minmax(300px,0.55fr)` → 1 column under `1080px` (from the mockup's own breakpoint, consistent with the `980px`/`1080px` breakpoints already used on `/empresas` and `/dashboard`).
- Row-fields grid (3 columns for IVA rows) → 1 column under `720px`, matching `nueva-empresa-client.tsx`'s existing `grid-cols-[96px*1fr*1fr_auto]` → stacks the same way on narrow viewports it already does today.
- Touch targets ≥48px throughout (`h-[52px]` on all inputs/buttons, same convention as `nueva-empresa-client.tsx`).

**(continued in Part 2/5)**

---

### Juan Leites - 5/8/2026, 16:25:20

## Spec Implementation Plan (Dev) — Part 2/5

**(continued from Part 1/5 — STORY-TD-30)**

## Types & Type Safety

No `lib/database.types.ts` codegen exists yet in this repo for `plan_cuentas`/`empresa` (the create flow itself hand-types its row shapes, e.g. `IvaRow`/`ExentaRow` interfaces in `nueva-empresa-client.tsx`) — this plan follows the same convention rather than introducing generated Supabase types as a one-off for this story:

```typescript
// src/app/empresas/[id]/empresa-detalle-client.tsx
interface EmpresaDetalle {
  id: string
  nombre: string
  rut: string
}

interface IvaRow { key: string, id: string | null, codigoIva: string, cuentaContable: string, codigoPadi: string }
interface ExentaRow { key: string, id: string | null, cuentaContable: string }
```

`id: string | null` on each row distinguishes a pre-loaded row (has a real `plan_cuentas.id`, informational only — never sent back to the RPC, see the delete-then-reinsert reasoning in Part 1) from a row added client-side this session (`id: null`). This mirrors `nueva-empresa-client.tsx`'s `key`-based React list identity, extended with one field because the edit screen, unlike creation, starts from server-provided rows.

---

## Content Writing

Copy carried over verbatim from `empresa-detalle-edicion.html` (per D8, mockup supplies copy/states, not tokens) — already real domain vocabulary, no placeholders:

- Eyebrow: "Edición de empresa existente".
- Lead: "Esta pantalla no crea una empresa nueva. Solo permite consultar y actualizar la ficha ya existente, junto con la parametrización contable que usa el estudio para IVA y compras exentas."
- Section helper (Datos generales): "Nombre y RUT identifican la empresa sobre la que ya estás trabajando. Si cancelas, vuelves al listado sin guardar."
- IVA table helper: "Cada fila relaciona código de IVA, cuenta contable y línea PADI para automatizar la generación." (adjusted at build time — see Decision 4, Part 4 — since "línea PADI" becomes a select of the 4 real codes, not free text)
- Exempt table helper: "Estas cuentas se declaran siempre en línea PADI 504. Mantenelas separadas para evitar carga manual posterior."
- Success banner: "Cambios guardados correctamente." / "La empresa quedó actualizada y la parametrización contable ya está disponible para próximas declaraciones."
- Validation banner: "Revisá los datos antes de guardar." / "Faltan campos obligatorios o hay filas incompletas en la configuración contable."
- Duplicate-RUT banner: "No fue posible guardar los cambios." / "Ya existe otra empresa en esta cuenta con el RUT {rut}." — `{rut}` interpolated exactly like `nueva-empresa-client.tsx` already does for its own RUT-format error message.
- "Ver empresa" card action label (new, `empresas-client.tsx`): kept as-is from the mockup (`empresas-listado-ver-empresa.html`'s `<a class="btn-link">Ver empresa</a>`) — already real, no invented copy.

***New copy needed*** (not in either mockup, both are small extensions of an already-established pattern):

- Empty-state row for a 0-row mapping table (Decision 1, Part 4): "Todavía no hay [códigos de IVA / cuentas exentas] cargados para esta empresa." — mirrors the phrasing/tone already used for the company-list empty state in `empresas-client.tsx` ("Todavía no tenés empresas registradas...").

**(continued in Part 3/5 — Implementation Steps)**

---

### Juan Leites - 5/8/2026, 16:25:31

## Spec Implementation Plan (Dev) — Part 3/5

**(continued from Part 2/5 — STORY-TD-30)**

## Implementation Steps

### Step 1: Extract shared plan-cuentas constants

***Task******:*** Move `CODIGOS*PADI*IVA`, `CODIGO*PADI*EXENTA`, and `DUPLICATE*RUT*ERROR_CODE` out of `nueva-empresa-client.tsx` (currently private module-level consts) into a new shared module, since the edit client now needs the exact same three values — this is the DRY threshold CLAUDE.md's "Move to shared/ only when ≥2 features import AND abstraction stable" describes: it just became ≥2.

***File******:*** `src/modules/empresa/plan-cuentas.ts` (new — same directory convention as the existing `src/modules/empresa/empresa-activa.ts`)

***Details******:***

- Export `CODIGOS*PADI*IVA` (the 4-option `{value, label}` array: 505/506/502/503), `CODIGO*PADI*EXENTA` (`'504'`), `DUPLICATE*RUT*ERROR_CODE` (`'23505'`).
- Update `nueva-empresa-client.tsx` to import from this module instead of declaring them locally (net-zero new lines there, just relocated).

***Testing******:*** none — pure constant relocation, no behavior change to the create flow (covered by its own existing manual/live-UI verification, not touched by this story's AC).

***Estimated time******:*** 10 min.

---

### Step 2: Migration — `plan*cuentas` DELETE policy + `editar*empresa*con*plan_cuentas` RPC

***File******:*** `supabase/migrations/20260805100000*editar*empresa*con*plan_cuentas.sql` (new)

***⚠️ NO static SQL here per template policy — described narratively******:***

- Add one RLS policy on `plan*cuentas`, `plan*cuentas*delete*own`, using the identical `EXISTS (... e.cuenta*id = auth.uid())` ownership check already proven by `plan*cuentas*select*own`/`plan*cuentas*insert_own`.
- Create `editar*empresa*con*plan*cuentas(p*empresa*id uuid, p*rut text, p*nombre text, p*cuentas jsonb) returns void`, `language plpgsql`, `security invoker`, `set search*path = ''` (same header as `crear*empresa*con*plan*cuentas`). Body: `UPDATE empresa SET rut = p*rut, nombre = p*nombre, updated*at = now() WHERE id = p*empresa*id` (relies on `empresa*update*own` RLS for the ownership check — no duplicate check in application code); immediately after, check the affected row count and raise an exception if zero (guards the tamper/stale-URL case where `p*empresa*id` doesn't belong to the caller or doesn't exist — RLS silently no-ops the UPDATE rather than erroring, so this guard is what turns "silently did nothing" into a surfaced error); then `DELETE FROM plan*cuentas WHERE empresa*id = p*empresa*id` followed by the same bulk-insert-from-`jsonb*array*elements` statement `crear*empresa*con*plan_cuentas` already uses, unchanged.
- ***Apply via Supabase MCP*** (`apply_migration`) during Stage 2 implementation, not during this planning stage.

***Testing******:***

- Manual/live-UI (Stage 2/3): call the RPC for an owned company → row updates, mapping rows replaced. Call it (via a forged id) for a company belonging to a different `cuenta_id` → exception raised, no partial write.

***Estimated time******:*** 45–60 min.

---

### Step 3: `/empresas/[id]/page.tsx` — Server Component

***File******:*** `src/app/empresas/[id]/page.tsx` (new)

***Structure/Logic******:***

- Same shape as `src/app/empresas/page.tsx`: `createClient()` from `@/infrastructure/supabase/server`, `auth.getUser()` → redirect to `/login` if absent.
- `select('id, nombre, rut').eq('id', id).maybeSingle()` on `empresa` — RLS (`empresa*select*own`) means a company belonging to another `cuenta_id` simply returns no row, not an error.
- ***Not-found behavior******:*** if the row is `null` (either the id doesn't exist, or it belongs to another account — indistinguishable by design, which is the correct behavior: never leak "that id exists but isn't yours" vs. "that id doesn't exist" to an unauthorized caller), call Next.js `notFound()` → renders the framework's 404, no custom error screen needed for this edge case (matches CLAUDE.md's "no error handling for impossible scenarios" — this isn't impossible, but it's explicitly out of the AC's happy-path scope, so the framework default is the right amount of effort).
- Fetch `plan*cuentas` rows for that `empresa*id` (`select('id, cuenta*contable, codigo*padi, codigo*iva').eq('empresa*id', id)`), split client-side (in the Server Component, before handing off) into `iva` rows (`codigo*padi !== '504'`) and `exenta` rows (`codigo*padi === '504'`) — same split the create flow already does implicitly via its two separate form sections.
- Pass `{ empresa, ivaRows, exentaRows }` to `EmpresaDetalleClient`.

***Edge cases handled******:***

- Company with 0 `plan_cuentas` rows in one or both tables: passes empty arrays through — the client component's Decision 1 empty-state handles the rendering, `page.tsx` does no special-casing.
- Unauthenticated request: `redirect('/login')`, same as `/empresas`.
- Wrong-account / nonexistent id: `notFound()`, see above.

***Testing******:***

- Live-UI: open `/empresas/[id]` for an owned company → fields pre-filled. Manually navigate to another account's company id (or a random UUID) → 404, no data leak, no crash.

***Estimated time******:*** 30–40 min.

---

### Step 4: `/empresas/[id]/empresa-detalle-client.tsx` — client component

***File******:*** `src/app/empresas/[id]/empresa-detalle-client.tsx` (new)

***Structure/Logic******:***

- `'use client'`, mirrors `nueva-empresa-client.tsx`'s state shape (`useState` for `nombre`, `rut`, `ivaRows`, `exentaRows`, `submitted`, `isSubmitting`) plus new state for the 3-banner set (`saveState: 'idle' | 'success' | 'validation-error' | 'save-error'`, `saveErrorMessage: string`).
- Pre-fills all state from the `empresa`/`ivaRows`/`exentaRows` props passed by `page.tsx` (no fetch-on-mount — data is already server-resolved, satisfying AC Scenario 1 directly).
- Reuses `nueva-empresa-client.tsx`'s exact validation predicates (`missingNombre`, `invalidRutLength`, `ivaRowsIncomplete`, `exentaRowsIncomplete`) — same shape, now sourced from the shared module for the constants (Step 1).
- `handleSubmit`: validates client-side first (Scenario 3) → on failure, sets `saveState = 'validation-error'`, no RPC call. On pass, calls `supabase.rpc('editar*empresa*con*plan*cuentas', { p*empresa*id, p*rut, p*nombre, p*cuentas })` directly via `createClient()` from `@/infrastructure/supabase/client` (see Decision 2, Part 4 — no Server Action) → on `error?.code === DUPLICATE*RUT*ERROR*CODE` sets `saveState = 'save-error'` with the interpolated message (Scenario 4); on other error, `throw new Error(...)` (matches `nueva-empresa-client.tsx`'s own escalation for unexpected errors — CLAUDE.md error-handling rule "no silenciar errores"); on success, `saveState = 'success'` (Scenario 2), stays on the same screen.
- "Volver sin guardar": `router.push('/empresas')`, no confirmation dialog (matches the mockup, and Scope explicitly says "leave without saving" with no mention of a confirm step).
- Empty-state rendering per table (Decision 1, Part 4): when `ivaRows.length === 0` (or `exentaRows.length === 0`), render the "Todavía no hay ... cargados" message instead of the table-of-rows grid; the "Agregar ..." button stays visible either way (unlike the create flow, remove buttons are never `disabled` — 0 rows is a valid end state on edit, see Decision 1).
- Badge "Empresa existente" renders via `Badge` with the `info`/neutral treatment (Decision 3, Part 4), not the mockup's `warning` amber.

***Edge cases handled******:***

- Removing every row from a table, then saving: allowed (Decision 1, Part 4) — an empty `p_cuentas` slice for that PADI family is a legitimate submission, the RPC's delete-then-reinsert just ends up inserting fewer rows.
- Editing the RUT to the same value it already has (no actual change): `empresa*cuenta*rut*unique` is `(cuenta*id, rut)` and the row being updated already owns that exact `(cuenta_id, rut)` pair, so Postgres does not raise `23505` on a no-op RUT — verified against the constraint definition, not assumed.

***Testing******:***

- Live-UI (Stage 2/3), one pass per AC scenario — see AC → Implementation mapping below.

***Estimated time******:*** 3.5–4.5 hours (largest single file in this story — mirrors a ~380-line sibling plus 3-banner state and prefill logic).

---

### Step 5: "Ver empresa" action on `empresas-client.tsx`

***File******:*** `src/app/empresas/empresas-client.tsx` (modified)

***Details******:***

- Inside the existing company-card `<button>` (the one currently wrapping the whole card and firing `setSelected`), add a second, visually distinct action — per §4.4's fidelity checklist item ("'Ver empresa' visualmente distinguible de la acción de selección — ya materializado en el mockup: pill separada, no reemplaza el botón de selección"). Since the current card **is** a `<button>` (the whole card is clickable for selection), the "Ver empresa" control must be a sibling element outside that button (nesting an `<a>`/`<button>` inside a `<button>` is invalid HTML and breaks keyboard/a11y semantics) — restructure the card's outer element from `<button>` to a non-interactive `<div>`/`<article>` wrapping (a) the existing selection `<button>` (now covering just the card's content area, same visual result) and (b) a new `next/link` `Link` to `/empresas/${empresa.id}` styled as the mockup's `.btn-link` pill (`text-primary`, pill-shaped, low-emphasis background), placed next to it.
- This is a structural fix, not scope creep: the current implementation already violates the checklist item passively (there's no "Ver empresa" control at all yet), and fixing it correctly requires the button→div restructure regardless of exact styling choice.

***Testing******:***

- Live-UI: clicking "Ver empresa" navigates to `/empresas/[id]` without changing the card's selection state; clicking the card body still selects it as before (no regression to TD-5's existing selection behavior).

***Estimated time******:*** 30–40 min.

---

## AC → Implementation mapping

| AC Scenario | Implementation step | How it's satisfied |
| --- | --- | --- |
| 1 — opens existing company's profile, sees current data pre-filled | Steps 3 + 4 | `page.tsx` fetches `empresa` + `plan_cuentas` server-side (RLS-scoped) and passes them as initial state to `EmpresaDetalleClient`, which renders them pre-filled, never empty |
| 2 — updates data and saves successfully, sees confirmation | Step 4 (`handleSubmit` success path) + Step 2 (RPC) | RPC updates `empresa` + reconciles `plan_cuentas`; client sets `saveState = 'success'`, banner "Cambios guardados correctamente." |
| 3 — saves with incomplete/invalid data, sees what to complete | Step 4 (client-side validation, pre-RPC) | Same validation predicates as `nueva-empresa-client.tsx` (RUT format, required row fields) block the RPC call; banner "Revisá los datos antes de guardar." + per-field `invalid` styling |
| 4 — saves a RUT belonging to another company, sees the conflict | Step 4 (`23505` catch) + Step 2 (`empresa*cuenta*rut_unique`) | DB constraint raises `23505` on the `empresa` UPDATE; client catches the code and shows "Ya existe otra empresa en esta cuenta con el RUT {rut}." |

**(continued in Part 4/5 — Technical Decisions, Dependencies)**

---

### Juan Leites - 5/8/2026, 16:25:42

## Spec Implementation Plan (Dev) — Part 4/5

**(continued from Part 3/5 — STORY-TD-30)**

## Technical Decisions (Story-specific)

### Decision 1: Empty state for 0-row mapping tables (both IVA and Compras Exentas)

***Chosen******:*** Allow both mapping tables to reach zero rows. When a table has 0 rows, render a short empty-state message ("Todavía no hay [códigos de IVA / cuentas exentas] cargados para esta empresa.") instead of the row grid; the "Agregar ..." action stays available regardless of row count.

***Reasoning******:***

- ✅ §4.9's checklist explicitly flags this as an unresolved gap for Compras Exentas ("el mockup no cubre el estado vacío de esta tabla... gap a decidir en la construcción") — this plan resolves it rather than leaving it unspecified at implementation time.
- ✅ The story's own Business Rules only require that **existing** rows be complete ("Every row in the IVA-code mapping and every row in the exempt-purchases mapping must have its account field filled in") — it never states a minimum row count, unlike the create flow's own (separate, unwritten) UI convention of forcing at least one row per table.
- ✅ Applying the same treatment to the IVA table too (not just Compras Exentas) keeps both tables consistent — an accountant removing every IVA row via this screen (e.g. correcting a company that never uses "formato rápido") is a real, in-scope action per Scope's "add, edit, or remove rows."
- ❌ Trade-off: this is a deliberate divergence from `nueva-empresa-client.tsx`'s create-time minimum-1-row convention (`disabled={ivaRows.length === 1}` on the remove button) — documented here so it reads as intentional, not an inconsistency.

### Decision 2: No new Server Action for saving — client-side RPC call, same as company creation

***Chosen******:*** `EmpresaDetalleClient` calls `supabase.rpc('editar*empresa*con*plan*cuentas', ...)` directly via `createClient()` from `@/infrastructure/supabase/client`, exactly like `nueva-empresa-client.tsx` already does for `crear*empresa*con*plan*cuentas`. No `src/app/empresas/[id]/actions.ts` is created, and the existing `src/app/empresas/actions.ts` is not extended.

***Reasoning******:***

- ✅ The existing `actions.ts`'s one Server Action (`seleccionarEmpresaActiva`) exists specifically because it needs `httpOnly` cookie write access, a genuinely server-only capability. Saving a company's data has no such requirement — RLS on `empresa`/`plan_cuentas` is the actual security boundary either way, whether the RPC is invoked from a Server Action or straight from the browser client.
- ✅ Matches "mirror `nueva-empresa-client.tsx`'s structure/conventions closely" from the story's own framing — introducing a Server Action here would be a new pattern for this exact operation shape (create-a-company-like-thing), not a reused one.
- ❌ Trade-off: none of substance — this is the lower-surface-area option and the one already validated in production by the create flow.

### Decision 3: "Empresa existente" badge uses `badgeInfo`, not the mockup's `warning`

***Chosen******:*** Render the badge with `Badge` `variant="info"` semantics (neutral background, `primary` text — `DESIGN.md`'s `badgeInfo` token: `backgroundColor: colors.neutral`, `textColor: colors.primary`), not `warning`/amber.

***Reasoning******:***

- ✅ §4.9's checklist already flags this exact call: "Badge 'Empresa existente' usa un tono neutral/informativo (`badgeInfo` o similar) en el build real — el mockup lo muestra en `warning` (ámbar), semánticamente cuestionable para un estado que no es una advertencia."
- ✅ `warning` is reserved (per `DESIGN.md`'s Do's/Don'ts) for genuine warning states; "this is an existing, not new, company" is informational, not a caution to the user.

### Decision 4: IVA row's PADI field is a closed 4-option select, not the mockup's free-text "Línea PADI"

***Chosen******:*** The edit screen's IVA table uses the same closed `<select>` of 4 PADI codes (505/506/502/503) that `nueva-empresa-client.tsx` already uses (via the shared constants from Step 1) — not the mockup's free `mono` text input labeled "Línea PADI" (which shows made-up values like `314`/`318`/`320` in its demo data).

***Reasoning******:***

- ✅ `plan*cuentas.codigo*padi` is DB-constrained to exactly 5 values (`502`/`503`/`504`/`505`/`506` — verified live), and the live create flow already resolved "how does the user pick a PADI code" as a closed select, not free text. The mockup's free-text field would let a user submit a value the DB constraint rejects, producing a generic constraint-violation error with no clear message — a UX regression relative to what's already live, and it would violate the story's Business Rule that every IVA row's account field must be filled in **validly**, not just non-empty.
- ✅ This is a Live-UI-First call in the same spirit as D8 (build against the live domain model, mockup supplies structure/copy/states only) — just applied to a form-control's data shape rather than its visual tokens.
- ❌ Trade-off: the edit screen's IVA table will look slightly different from its own mockup (`empresa-detalle-edicion.html`) in this one field — acceptable and consistent with every other divergence already ratified for this batch (D8) and its siblings (D3/D4/D6).

***ADR promotion check (per the two-gate test)******:*** none of the decisions above are promoted to `.context/ADR/`. The RPC + RLS additions extend an already-established per-tenant-ownership pattern (`empresa`/`plan*cuentas` RLS, `security invoker` functions) to one more table/operation — they don't introduce a new architectural pattern, aren't hard to reverse (a follow-up migration can drop the policy/function cleanly, no data migration involved), and don't impose a new cross-cutting invariant beyond what `crear*empresa*con*plan_cuentas` already established. All four decisions above are story-local.

---

## Dependencies

***Pre-requisitos técnicos******:***

- [x] Mockups ready (`empresas-listado-ver-empresa.html`, `empresa-detalle-edicion.html`), mapped in master design plan §4.4/§4.9 — no design blocker.
- [x] Live schema inspected (this session, via read-only SQL MCP) — no unknowns blocking Step 2's migration design.
- [x] `Button`/`Input`/`Label`/`Badge` primitives already live — no new primitives needed.
- [ ] ***BLOCKER for Stage 2 start******:*** Step 2's migration must be applied (via Supabase MCP `apply_migration`, staging project) before Step 4's client component can be manually verified end-to-end — sequencing note, not a plan gap.

**(continued in Part 5/5 — Risks, Estimated Effort, Definition of Done, Review Workload Forecast)**

---

### Juan Leites - 5/8/2026, 16:25:55

## Spec Implementation Plan (Dev) — Part 5/5

**(continued from Part 4/5 — STORY-TD-30)**

## Risks & Mitigations

***Risk 1******:*** The button→div card restructure in Step 5 (`empresas-client.tsx`) regresses the existing TD-5 selection behavior (cookie-based active-company selection, already live in production/staging).

- ***Impact******:*** Medium
- ***Mitigation******:*** Step 5's testing note explicitly re-verifies card-body selection still works after the restructure, not just the new "Ver empresa" link. No change to `seleccionarEmpresaActiva` or the selection state logic itself — only the outer element type changes.

***Risk 2******:**** Delete-then-reinsert on `plan_cuentas` means a save that fails validation **after* the DELETE but the RPC statement itself is transactional — a real risk only if the function's exception handling is wrong.

- ***Impact******:*** Low
- ***Mitigation******:*** Postgres functions run in an implicit single transaction; any unhandled exception (e.g. a unique-constraint violation on the reinsert) rolls back the entire function body, including the DELETE. This is the same guarantee `crear*empresa*con*plan*cuentas` already relies on today (its own two-INSERT sequence isn't manually wrapped in a transaction either) — no new risk introduced, just documented since it's easy to assume a "delete" step needs extra defensive handling it doesn't.

***Risk 3******:*** A stale/forged `p*empresa*id` (URL tampering) silently no-ops instead of erroring, if the "raise on zero rows affected" guard in Step 2 is skipped or gets it wrong.

- ***Impact******:**** Low (RLS already prevents any **data* leak or unauthorized write either way — this risk is only about error-message clarity, not security)
- ***Mitigation******:*** Step 2 explicitly calls out the row-count guard as a required part of the function body, not an optional nicety.

---

## Estimated Effort

| Step | Time |
| --- | --- |
| 1. Extract shared plan-cuentas constants | 10 min |
| 2. Migration — RLS + `editar*empresa*con*plan*cuentas` | 45–60 min |
| 3. `/empresas/[id]/page.tsx` | 30–40 min |
| 4. `/empresas/[id]/empresa-detalle-client.tsx` | 3.5–4.5 hours |
| 5. "Ver empresa" action on `empresas-client.tsx` | 30–40 min |
| ***Total**** | ****~******5.5–6.5 hours*** |

***Story points******:*** not set in Jira (`story.md` shows `-`; CLAUDE.md rule — never populate Story Points).

---

## Definition of Done Checklist

- [ ] Code implemented per this plan
- [ ] All 4 AC scenarios passing (manual/live-UI verification)
- [ ] `plan*cuentas*delete*own` RLS policy live; `editar*empresa*con*plan_cuentas` RPC applied via Supabase MCP
- [ ] Design-system fidelity: §4.4/§4.9 checklist items in `master-design-plan.md` satisfied, including the two decisions this plan made (empty state, badge tone)
- [ ] Content Writing: real domain copy carried from the mockups + the small net-new empty-state copy, no placeholder text
- [ ] "Ver empresa" card restructure does not regress TD-5's existing company-selection behavior
- [ ] Lint / typecheck / build clean
- [ ] Live-UI validation pass on the running dev server, all 4 AC flows clicked through, including the 404 case for another account's company id
- [ ] Code review approved
- [ ] Deployed to staging; manual smoke test (desktop + mobile)

---

## Review Workload Forecast

Estimated: 1024 additions + 11 deletions = 1035 total lines
400-line budget risk: High
Chain strategy: pending
Decision needed before apply: Yes

***Per-file estimate*** (new × 1.5, modified × 1.0, then ×1.2 tests/docs buffer):

| File | Op | Base lines | Multiplier | Weighted (pre-buffer) |
| --- | --- | --- | --- | --- |
| `supabase/migrations/20260805100000*editar*empresa*con*plan_cuentas.sql` | new | ~60 | ×1.5 | 90 |
| `src/modules/empresa/plan-cuentas.ts` | new | ~20 | ×1.5 | 30 |
| `src/app/empresas/nueva/nueva-empresa-client.tsx` | modified (import swap) | ~10 | ×1.0 | 10 |
| `src/app/empresas/[id]/page.tsx` | new | ~55 | ×1.5 | 82.5 |
| `src/app/empresas/[id]/empresa-detalle-client.tsx` | new | ~420 | ×1.5 | 630 |
| `src/app/empresas/empresas-client.tsx` | modified | ~20 | ×1.0 | 20 |
| ***Sum**** |  |  |  | ****862.5*** |

`Z = ceil(862.5 × 1.2) = 1035`. New-file subtotal (832.5 × 1.2 ≈ 999) contributes 100% to additions; modified-file subtotal (30 × 1.2 = 36) splits 70/30 → 25 additions / 11 deletions. `X = 999 + 25 = 1024`, `Y = 11`, `X + Y = 1035 = Z`.

***Gate note (per ****`workload-forecast.md`****)******:**** `Z > 400` → the planner must emit `pending` and surface the gate rather than choose a chain strategy itself; that decision belongs to the `/git-flow-master` skill (Step 4, chained-PR decision tree) at the Stage 1→Stage 2 boundary. ****This plan does not resolve the chain strategy — Stage 2 cannot start until it is resolved.*** The size driver is almost entirely Step 4's new client component (~630 of the ~1035 weighted total); a `stacked-to-main` split along this plan's existing step boundaries (Step 1+2 migration/constants as PR 1, Step 3+4 the new route as PR 2, Step 5 the list-page action as PR 3) looks like the natural candidate for whoever runs that decision, but is offered here only as an observation, not a decision.

---

**Plan authored 2026-08-05, Stage 1 of **`/sprint-development`** for TD-30. Live schema facts verified via read-only SQL MCP against the staging Supabase project (**`kqrleobwemscldkfissh`**) in the same session. End of plan (Part 5/5).**

---


_Synced from Jira by sync-jira-issues_
