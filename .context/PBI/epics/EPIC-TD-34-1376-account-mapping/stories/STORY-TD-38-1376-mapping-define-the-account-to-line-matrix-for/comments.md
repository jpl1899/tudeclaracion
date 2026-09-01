# Comments for TD-38

[View in Jira](https://lk-tudeclaracion.atlassian.net/browse/TD-38)

---

### mathias Kantor - 1/9/2026, 6:52:57

Estos son los codigos de PADI que deben aparecer sugeridos en el combox , a diferencia de lo que dice “(their own value from the form design) - it is not picked from a system catalog, so this story does not depend on the DGI line catalog.” que no es correcto, va a existir un combox al igual que la configuracion de la 2181 donde indique cada codigo de padi y su nombre para seleccionar, ahora van los codigos con sus nombres respectivos :    


|  |
|  |
|  |
|  |
|  |
|  |
|  |

---

### Juan Leites - 1/9/2026, 7:30:57

## Spec Implementation Plan (Dev)

> Authored 2026-09-01 with the contadora present. Story spec (description) updated the same session: catalog-driven rows, per-row amount column (`Total` | `IVA`), bijective account <-> line-code constraint.

### Goal

Per-company 1376 mapping screen: the contador assigns exactly one accounting account (with its Debe/Haber side and TXT amount column) to each 1376 line code, so the TD-41 engine can total the declaration automatically.

### Design fidelity

- No dedicated mockup. Spec-only build, recorded as a divergence in `.context/design/master-design-plan.md` §5.
- Reuses the live editable-table pattern from `src/app/empresas/[id]/empresa-detalle-client.tsx` (TD-30): `selectClassName`, shadcn `Input` / `Button` / `Label` / `Badge`, 3-banner save feedback (success / validation-error / save-error).
- Catalog-driven fixed rows (one row per 1376 line code) instead of the design brief's "add a row per account" model - per the contadora's explicit direction this session.
- `DESIGN.md` tokens only. No new tokens.

### Data model

***New table ***`codigo*linea*1376` (configurable catalog, DB-seeded - ADR-0001 config-driven; editable later via backoffice):

| Column | Type | Notes |
| --- | --- | --- |
| `codigo` | text PK | line code |
| `concepto` | text not null | fiscal concept shown next to the code |
| `orden` | smallint not null | display order |
| `created_at` | timestamptz default now() |  |

- Seed the 10 provisional codes: 101, 102, 103, 201, 301, 302, 501, 502, 510, 601 (concepts per the story description table).
- RLS: `select` policy `using (true)` for authenticated users. No insert/update/delete policy in MVP (backoffice owns edits later).
- Provisional until DGI's official per-rubro catalog is captured (open question - `.context/tax-rules/1376/open-questions.md`).

***New table ***`mapeo_1376` (per empresa, bijective):

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK default gen*random*uuid() |  |
| `empresa_id` | uuid not null references empresa(id) on delete cascade |  |
| `codigo*linea` | text not null references codigo*linea_1376(codigo) |  |
| `cuenta_contable` | text not null |  |
| `lado` | text not null check in ('debe','haber') |  |
| `columna_importe` | text not null check in ('total','iva') |  |
| `created_at` | timestamptz default now() |  |

- `unique (empresa*id, codigo*linea)` - a line code maps at most one account.
- `unique (empresa*id, cuenta*contable)` - an account is used by at most one line code. Together => bijective.
- RLS: `select` / `insert` / `delete` policies scoped through `empresa.cuenta*id = (select auth.uid())` - mirror `plan*cuentas` (see `20260715120000*rediseno*plan*cuentas.sql` + `20260805100000*editar*empresa*con*plan*cuentas.sql`). No `update` policy - the RPC only DELETEs + INSERTs.

***New RPC ***`guardar*mapeo*1376(p*empresa*id uuid, p_filas jsonb)`:

- `language plpgsql`, `security invoker`, `set search_path = ''`.
- Ownership guard: if `empresa` update/lookup affects 0 rows -> `raise exception` (a stolen/invented id in the URL fails loudly instead of a silent no-op) - same pattern as `editar*empresa*con*plan*cuentas`.
- Reconciliation: `delete from mapeo*1376 where empresa*id = p*empresa*id;` then `insert ... select from jsonb*array*elements(p*filas)`. Both in the function's implicit transaction: a duplicate `cuenta*contable` in the reinsert (bijection breach) raises 23505 and rolls back the delete too - the empresa never ends with a half-applied mapping.
- Each item shape: `{codigo*linea, cuenta*contable, lado, columna*importe}`. Line codes with no account are simply absent from `p*filas`.

### Steps

1. ***Migration ****`<ts>*crear*codigo*linea*1376.sql` - table + RLS select + seed 10 rows. `verify:` migration applies clean on a branch DB; `select count(**) = 10`.
2. ***Migration ***`<ts>*crear*mapeo*1376.sql` - table + 3 RLS policies + `guardar*mapeo*1376` RPC. `verify:` applies clean; bijection uniques reject a second row with the same `cuenta*contable`.
3. ***Regenerate ***`src/types/supabase.ts` (`bun run` the types script - read `package.json` for the exact name). `verify:` `bun run build` clean.
4. `src/modules/mapeo-1376/mapeo-1376.ts` - TS interfaces (`CatalogoLinea`, `MapeoRow`, `MapeoRowInicial`), the `LADO*OPCIONES` / `COLUMNA*IMPORTE_OPCIONES` label constants, a pure `construirFilasParaGuardar(rows)` that drops incomplete rows and a `validarMapeo(rows)` that returns the first missing-field / bijection-collision message. `verify:` unit tests green.
5. `src/modules/mapeo-1376/mapeo-1376.test.ts` - AAA unit tests: incomplete row (no account / no lado / no columna) is flagged; a client-side duplicate `cuenta_contable` across two codes is flagged; a fully blank screen builds an empty payload; a valid set builds the expected jsonb. `verify:` `bun run test` green for this file.
6. `src/app/empresas/[id]/mapeo-1376/page.tsx` - Server Component. Resolve `empresa` (RLS), the ordered `codigo*linea*1376` catalog, and existing `mapeo_1376` rows for the empresa. Pass as props (no fetch-on-mount). 404 / redirect if the empresa is not the caller's.
7. `src/app/empresas/[id]/mapeo-1376/mapeo-1376-client.tsx` - one row per catalog code: `concepto` static + `cuenta*contable` `Input` + `lado` `<select>` + `columna*importe` `<select>`. Empty state = every row unmapped. Save -> `validarMapeo` -> `construirFilasParaGuardar` -> `guardar*mapeo*1376` RPC. 3 banners. Prominent heading + helper text: "separate from the plan de cuentas used for the 2181". A "Volver" link that navigates back without saving. `verify:` live-UI check on `bun run dev`.
8. ***Nav link*** from `src/app/empresas/[id]/empresa-detalle-client.tsx` (or its `page.tsx`) to the new screen. `verify:` link renders and routes.
9. ***Live-UI validation*** (Stage 3) - dev server, login from `.env`: empty state, save confirmation, incomplete-row message, bijection-collision message, responsive, "distinct from 2181" labelling.
10. ***Docs*** - divergence row in master-design-plan §5; strike the resolved catalog/combo question in `.context/tax-rules/1376/open-questions.md` (still leave the "official DGI catalog" one open).

### Out of scope (this story)

TD-40 suggested base mapping; TD-39 dedicated edit flow; TD-41/TD-42 engine; mapping version history; DGI official catalog sourcing.

### Technical decisions

- ***TD-38-D1***: line codes are a DB catalog table, not a hardcoded list or free text - ADR-0001 config-driven. Not ADR-worthy (data-shape, easily reversible).
- ***TD-38-D2***: bijection enforced by two DB uniques, not app logic only - the RPC transaction gives an atomic all-or-nothing save.
- ***TD-38-D3***: catalog-driven fixed rows over the brief's account-driven "add row" model - contadora's call; recorded as a §5 divergence.

### Review Workload Forecast

Estimated: ~560 additions + ~15 deletions = ~575 total lines
400-line budget risk: High
Chain strategy: single feature branch `feat/TD-38-1376-mapping` -> PR to `staging`; size-exception justified (2 migrations + module + 2 UI files + tests form one cohesive story). Split option on the table: PR-A schema+module+tests, PR-B UI+nav.
Decision needed before apply: Yes - confirm single-branch vs split.

---


_Synced from Jira by sync-jira-issues_
