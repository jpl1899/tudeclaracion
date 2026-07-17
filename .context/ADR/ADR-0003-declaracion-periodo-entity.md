# ADR-0003 — Introduce a `declaracion` entity to model período and processing status

- **Status:** Accepted
- **Date:** 2026-07-17
- **Deciders:** Juan Leites
- **Tags:** data-model, cross-cutting-invariant, tax-engine
- **Supersedes:** —
- **Superseded by:** —

---

## Context

`SRS/04-domain-model.md` already defines "Declaración" as a domain entity (N lines, all under the same RUT declarante + período), but it was never materialized in the database. The `asiento` table (`supabase/migrations/20260716140000_crear_asiento.sql`) stores only `dia` (day of month) — there is no month/year column anywhere in the schema, and the upload flow (TD-11/TD-13, `ImportarAsientoDialog` → `insertar_asientos`) never asks for a período.

This surfaced as a blocker while planning TD-20 (PADI Export): the AC requires distinguishing "the declaration for the active company/período" and its processing status (still processing / generated / failed), but there is currently no way to know which `asiento` rows belong to which período, nor any place to persist a status. The dashboard's "Actividad reciente" table (`dashboard-client.tsx`) is still 100% mock data for exactly this reason.

## Decision

We will introduce a `declaracion` table as the aggregate root for a period's worth of `asiento` rows:

```sql
create table public.declaracion (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresa(id) on delete cascade,
  periodo text not null check (periodo ~ '^\d{6}$'), -- AAAAMM
  estado text not null default 'abierta' check (estado in ('abierta', 'generada', 'con_errores')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (empresa_id, periodo)
);
```

`asiento` gains a required `declaracion_id` FK. The import flow (`ImportarAsientoDialog`, TD-11/TD-13's UI) gains a período (AAAAMM) input; `insertar_asientos` resolves-or-creates the `declaracion` row for `(empresa_id, periodo)` and stamps every inserted `asiento` with its `declaracion_id`, atomically with the existing insert-all-or-nothing behavior.

`estado` is a **derived, not manually driven** field: `abierta` while asientos can still be added; `generada` once TD-20's export has been produced at least once for this declaración; `con_errores` when the tax-engine pipeline (TD-15 → TD-23) finds at least one unresolved `asiento` for this declaración. The exact transition mechanics (write-on-export vs. computed-on-read) are a TD-20 implementation detail, not part of this ADR.

## Consequences

- **Positive:** Every downstream story that needs "this period's data" (TD-16/17/18 validations, TD-20 export, the future TD-07 declaration history epic) now has a real anchor instead of inferring period from upload timestamps. The dashboard's "Actividad reciente" table can finally read real rows instead of mock data.
- **Negative / trade-offs:** Expands TD-20's scope beyond "just export a file" — it now also touches the TD-11/TD-13 upload flow (adds a required período field) and the `asiento` schema (new required FK). This is a direct, necessary consequence of the confirmed model, not scope creep from unrelated cleanup.
- **Neutral / follow-ups:** **Correction (verified 2026-07-17, before writing the migration):** the original text of this ADR assumed no real data existed yet — wrong. `asiento` already has 25 rows for 1 empresa (TD-13's manual end-to-end verification against staging). The migration adds `declaracion_id` as nullable, backfills one `declaracion` row per distinct `empresa_id` (período inferred as `202506`, matching the known test file "ASIENTOS JUNIO 2026.TXT"), points every existing row at it, then flips the column to `not null`. No data is deleted.

## Alternatives considered

- **One active período per empresa, no selector** — simpler (no new UI, no período input), but doesn't allow correcting a past período or having two períodos in flight, which doesn't match how accountants actually work (monthly declarations, late corrections). Rejected by the user in favor of the real model.
- **Implicit período from calendar date at upload time** — zero new UI, but fragile: uploading late in a month, or re-uploading a correction for a past período, resolves to the wrong período silently. Rejected for the same reason as above.
- **No persisted status, always compute live** — would avoid the `estado` column entirely (always re-run TD-15→TD-23 and derive status on every view). Kept `estado` as a real column anyway so TD-20's "generada" state can record *when* a file was actually produced, which a pure live computation can't express — but the column is intentionally still treated as derived/recomputable, not hand-edited.

## References

- `.context/SRS/04-domain-model.md` §"Declaración (2181)"
- `.context/SRS/10-exporter.md`
- `.context/PBI/epics/EPIC-TD-19-padi-file-export/stories/STORY-TD-20-padi-export-download-the-generated-padi-compatible/`
- `supabase/migrations/20260716140000_crear_asiento.sql`
