# Comments for TD-13

[View in Jira](https://lk-tudeclaracion.atlassian.net/browse/TD-13)

---

### Juan Leites - 7/7/2026, 20:02:03

Blocked — no AC until a real Memory export sample is provided (see `SRS/05-parser.md`).

---

### Juan Leites - 7/7/2026, 20:02:04

## Scope

- An uploaded file becomes structured internal data with zero manual edits (capability-level only — exact input grammar not yet defined)

---

### Juan Leites - 7/7/2026, 20:02:05

## Out Of Scope

- Normalization and fiscal-concept mapping (separate epic)
- Validation of the resulting structured data (separate epic)

---

### Juan Leites - 16/7/2026, 11:23:07

## Acceptance Criteria

```gherkin
Scenario: Compra exenta con código de cuenta se interpreta sin edición manual

  Given Rosana subió un archivo de Memory confirmado exitosamente (TD-12)
    And el archivo contiene la línea "5,"5215","11111","Ancap Ticket A 12452548","233669988774",0,1000,0,0,0,"E","
   When el sistema interpreta automáticamente el archivo
   Then los 12 campos de esa línea quedan disponibles como datos estructurados sin ninguna edición manual de Rosana
    And los datos quedan listos para el mapeo automático de cuentas (TD-15) sin acción adicional de Rosana
```

```gherkin
Scenario: Línea con código de IVA directo se interpreta sin edición manual

  Given Rosana subió un archivo de Memory confirmado exitosamente (TD-12)
    And el archivo contiene una línea con Código IVA "3", Libro "V" y Total "1000"
   When el sistema interpreta automáticamente el archivo
   Then esa línea queda disponible como dato estructurado sin ninguna edición manual de Rosana
```

```gherkin
Scenario: El campo Tipo alfabético no interrumpe la interpretación de la línea

  Given el archivo contiene una línea cuyo campo Tipo es "CIE"
   When el sistema interpreta automáticamente el archivo
   Then la línea se interpreta igualmente, y el valor de Tipo queda registrado como fuera de alcance para el motor tributario, sin bloquear el resto de la interpretación
```

```gherkin
Scenario: Dato inválido en una línea aborta la interpretación e identifica el campo

  Given Rosana subió un archivo de Memory confirmado exitosamente (TD-12)
    And el archivo contiene una línea cuyo campo "Total" trae un valor no numérico
   When el sistema intenta interpretar automáticamente el archivo
   Then la interpretación del archivo completo se aborta, sin generar datos parciales
    And Rosana ve un mensaje que identifica el número de línea y el campo "Total" como origen del dato inválido
```

## Business Rules Specification

- Formato del TXT de entrada confirmado 2026-07-15 contra archivo real (`ASIENTOS JUNIO 2026.TXT`): delimitador `,`, 12 campos por línea, campos alfanuméricos entre comillas dobles. Ver `SRS/05-parser.md` para el detalle campo por campo.
- El parser transforma el TXT en un modelo de datos interno ***sin aplicar reglas tributarias*** en este paso (invariante confirmado, `ADR-0001`, FR-07).
- Los campos Debe/Haber son códigos de cuenta contable, no importes — la resolución de importe/PADI ocurre en etapas posteriores (Normalizer/Tax Engine), fuera de alcance de esta historia.
- El campo Tipo solo tiene efecto en el motor tributario cuando su valor es `504`; los valores alfabéticos (`CIE`, `RES`, `DIF`, `APE`) se registran pero no afectan la interpretación de esta historia.
- Ante un dato inválido en cualquier campo de una línea, la interpretación del archivo completo se aborta — no se generan datos parciales. Se muestra un mensaje que identifica la línea y el campo de origen, reutilizando el patrón genérico `alert.error` de `design-system.html` (confirmado 2026-07-16).
- Fuera de alcance de esta historia (épica separada): normalización, mapeo a conceptos fiscales, y validación de los datos estructurados resultantes.

## Open questions (no bloquean el MVP de esta historia)

- Encoding esperado del TXT de entrada — sin confirmar.
- Volumen esperado (líneas por archivo mensual) — sin confirmar, relevante para performance.

---

### Juan Leites - 16/7/2026, 11:34:03

## Spec Implementation Plan (Dev)

### Overview

Implement automatic interpretation of the uploaded Memory export TXT into structured internal data, with zero manual edits from the accountant. Pure parsing only — no tax rules, no account mapping, no validation beyond field-level data-type checks (per `ADR-0001` invariant, FR-07).

***Acceptance Criteria to satisfy*** (published as a comment on this issue, 2026-07-16):

- Compra exenta con código de cuenta se interpreta sin edición manual
- Línea con código de IVA directo se interpreta sin edición manual
- El campo Tipo alfabético no interrumpe la interpretación de la línea
- Dato inválido en una línea aborta la interpretación e identifica el campo

No formal Acceptance Test Plan exists yet for this story (QA shift-left phase pending) — the 4 AC scenarios above are the coverage target for this plan's tests.

### Technical Approach

***Chosen approach******:*** A pure, framework-agnostic parser module (`src/modules/parser/`) that takes the raw TXT content and returns either a fully-parsed line array or a structured error (line number + field name). A new Next.js Route Handler wraps the module with the transactional persistence step. The existing upload dialog (`ImportarAsientoDialog`, already built for TD-11) is wired to call this route instead of doing nothing on import.

***Alternatives considered******:***

- Parse client-side and insert rows one-by-one from the browser: rejected — no natural place to enforce the "abort whole file on one bad line" rule without either a DB transaction or an all-or-nothing client-side batch insert with weaker consistency guarantees than a server-side transaction.
- Fold parsing directly into the API route handler (no separate module): rejected — `03-modules.md` / `ADR-0001` require the Parser to be a standalone, reusable, form-agnostic module; inlining it into a Next.js route couples it to the HTTP layer.

***Why this approach******:***

- Pure module is trivially unit-testable against the real sample data already confirmed in `05-parser.md`.
- Transactional insert at the DB layer gives an atomic guarantee for "abort whole file, no partial data" without hand-rolled rollback logic.
- Matches the existing module boundary (`src/modules/{parser,normalizer,validator,tax-engine,forms,exporter}`) so TD-15/TD-22/TD-23 can build on it without rework.

### Data model (new)

***Table ***`public.asiento` — one row per parsed TXT line. Follows the RLS pattern already established by `plan*cuentas` (`supabase/migrations/20260715120000*rediseno*plan*cuentas.sql`).

```gherkin
columns:
  id              uuid primary key default gen*random*uuid()
  empresa_id      uuid not null references empresa(id) on delete cascade
  dia             smallint not null
  debe            text not null        -- account code, not an amount (05-parser.md)
  haber           text not null        -- account code, not an amount
  concepto        text not null
  rut             text not null        -- 12-digit RUT, stored as text (leading zeros)
  moneda          smallint not null    -- 0 = pesos, 1 = dólares
  total           numeric not null
  codigo_iva      smallint not null    -- 0-9; 0 = sin código asignado
  iva             numeric not null
  cotizacion      numeric not null
  libro           text not null        -- C | V | E | I | P
  tipo            text                 -- nullable; 504 | CIE | RES | DIF | APE | null
  created_at      timestamptz not null default now()
```

RLS: `select`/`insert` policies scoped to `empresa.cuenta*id = auth.uid()`, mirroring `plan*cuentas*select*own` / `plan*cuentas*insert_own`.

***Known gap — not modeled here (do not invent)******:**** no "período" (month/year) column. The confirmed 12-field TXT format has no period field, and the domain model (`04-domain-model.md`) only defines período on the **output* (PADI) side. Rows land tagged only by `empresa*id` + `created*at`; period assignment is deferred to whichever future story resolves it. Flagged in the plan so TD-15+ doesn't assume it silently exists.

### Implementation Steps

***Step 1******:****** Parser module — pure parse + validate***

File: `src/modules/parser/parse-asientos.ts`

- `parseAsientosTxt(content: string): ParseResult` where `ParseResult = { ok: true, lines: AsientoLine[] } | { ok: false, line: number, field: string, message: string }`.
- Split on newlines, split each line on `,` respecting double-quoted fields (per `05-parser.md`: alphanumeric fields quoted, numeric fields bare).
- Per-field type/shape validation against the confirmed grammar (12 fields, `Libro` in `{C,V,E,I,P}`, `Moneda`/`Código IVA` in `0-9`, etc.). First invalid field found aborts the whole parse and returns `{ok:false, line, field, message}` — no partial results.
- `Tipo` field: accept `504` or any of `CIE/RES/DIF/APE` or empty; store as-is, no branching logic (tax-rule interpretation of `504` is Tax Engine's job, out of scope here).

Testing: unit tests (Vitest) against literal lines from the real sample file (`ASIENTOS JUNIO 2026.TXT` examples already captured in `05-parser.md`), covering all 4 AC scenarios plus the boundary/error cases from `05-parser.md`.

Estimated time: 2h

***Step 2******:****** API route — transactional persistence***

File: `src/app/api/asientos/import/route.ts`

- `POST`, expects `{ empresaId: string, content: string }` (file read as text client-side before the request, matching the existing dialog's `File` handling).
- Calls `parseAsientosTxt`. On parse failure, responds with the line/field error payload (no DB write).
- On parse success, inserts all rows for `empresaId` in a single Supabase transaction (`asiento` table) using the server Supabase client (`src/infrastructure/supabase/server.ts`), respecting RLS via the authenticated session — no service-role bypass.

Testing: integration test hitting the route with a valid sample file (happy path) and a file with one malformed line (abort path); assert zero rows written on the abort path.

Estimated time: 2h

***Step 3******:****** Wire the existing upload dialog***

File: `src/app/dashboard/page.tsx` (edit `onImportar` callback, currently a no-op that just closes the dialog)

- Read the `File` as text, `POST` to `/api/asientos/import` with the active `empresaId`.
- Success: keep current behavior (close dialog) — no new UI state, no mockup exists for a post-import screen and none is required by the published AC.
- Error: surface the `{line, field, message}` via the existing generic `alert.error` pattern from `design-system.html` (per the business rule confirmed 2026-07-16) — do not build a dedicated error screen.

Testing: manual live-UI check (dev server) — upload the real sample file end-to-end, and a hand-edited copy with one bad line, and confirm the alert shows the right line/field.

Estimated time: 1h

### Technical Decisions (Story-specific)

***Decision 1******:****** New ****`asiento`**** table has no period column***

***Chosen******:*** Do not model período on the `asiento` table for this story.

***Reasoning******:***

- ✅ Nothing in the confirmed TXT format or this story's AC requires it.
- ✅ Avoids inventing an unconfirmed business rule (which field/mechanism assigns period was never specified).
- ❌ Trade-off: whichever story consumes `asiento` next (TD-15 or later) will need to resolve period assignment — flagged here so it isn't silently assumed to already exist.

This is a story-local data-modeling choice, not a promoted ADR — the two-gate test (architectural AND hard to reverse) doesn't clearly pass yet since the table is brand new and adding a period column later is a trivial migration, not a rework.

### Dependencies

- [x] TD-12 (Confirm Upload) — not a hard blocker per `dev-roadmap.md` §3 (no edge), but functionally the dialog assumes a prior successful-upload confirmation exists. Not required to land first for TD-13 to be built/tested.
- [x] `empresa` table + RLS pattern — exists (`plan_cuentas` migration).
- [ ] No blocker on Supabase MCP / migration tooling — same pattern as the TD-7 migration.

### Risks & Mitigations

***Risk 1******:****** Encoding of the input TXT is unconfirmed*** (flagged in `05-parser.md`)

- ***Impact******:*** Low — the real sample file parses correctly assuming UTF-8; if a future file uses a different encoding, parsing may silently mis-render accented characters in `Concepto`.
- ***Mitigation******:*** Read the file as UTF-8 for this story (matches the sample); log this assumption in code as an inline comment; revisit if a non-UTF-8 file surfaces in QA.

***Risk 2******:****** File volume / performance is unconfirmed***

- ***Impact******:*** Low for MVP — accountant-scale monthly exports are expected to be small (tens to low hundreds of lines).
- ***Mitigation******:*** No pagination/streaming in this story; revisit only if QA or production usage shows otherwise.

### Estimated Effort

| Step | Time |
| --- | --- |
| 1. Parser module (parse + validate) | 2h |
| 2. API route (transactional persistence) | 2h |
| 3. Wire upload dialog | 1h |
| ***Total**** | ****5h*** |

### Definition of Done Checklist

- [ ] `parseAsientosTxt` implemented per `05-parser.md`, unit-tested against real sample data
- [ ] All 4 published Acceptance Criteria scenarios passing
- [ ] `asiento` table + RLS migration applied (mirrors `plan_cuentas` policy pattern)
- [ ] API route transactional: zero partial writes on an aborted parse (verified by test)
- [ ] Upload dialog wired; error path shows line+field via generic `alert.error`
- [ ] Live-UI check: real sample file end-to-end on the running dev server (non-UI story per mockup-gate registry, but the error alert is a real UI touchpoint — verify it renders)
- [ ] Lint + types + unit tests green
- [ ] Code review approved
- [ ] Deployed to staging

---


_Synced from Jira by sync-jira-issues_
