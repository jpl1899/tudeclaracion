-- TD-43 (2026-09-22): materializa la entidad "Declaración 1376", análoga a
-- `declaracion` (2181, 20260717170000) pero como entidad propia -- no
-- reutiliza la declaración 2181 para trackear su estado. Decisión del
-- usuario: los asientos del período siguen siendo los de la `declaracion`
-- 2181 (mismo TXT mensual, confirmado en TD-41); esta tabla solo trackea el
-- estado propio del 1376 (abierta / generada / con_errores, mismo patrón que
-- 2181 -- `generada` la setea TD-44 al descargar).
create table public.declaracion_1376 (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresa(id) on delete cascade,
  periodo text not null check (periodo ~ '^[0-9]{6}$'),
  estado text not null default 'abierta' check (estado in ('abierta', 'generada', 'con_errores')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (empresa_id, periodo)
);

alter table public.declaracion_1376 enable row level security;

-- Mismo patrón de RLS que declaracion/asiento/plan_cuentas.
create policy declaracion_1376_select_own on public.declaracion_1376
  for select using (
    exists (
      select 1 from public.empresa e
      where e.id = declaracion_1376.empresa_id
        and e.cuenta_id = (select auth.uid())
    )
  );

create policy declaracion_1376_insert_own on public.declaracion_1376
  for insert with check (
    exists (
      select 1 from public.empresa e
      where e.id = declaracion_1376.empresa_id
        and e.cuenta_id = (select auth.uid())
    )
  );

create policy declaracion_1376_update_own on public.declaracion_1376
  for update using (
    exists (
      select 1 from public.empresa e
      where e.id = declaracion_1376.empresa_id
        and e.cuenta_id = (select auth.uid())
    )
  );
