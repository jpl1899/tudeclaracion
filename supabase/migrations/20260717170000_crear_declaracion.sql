-- TD-20 (ADR-0003): materializa la entidad "Declaración" que el dominio ya
-- describía (SRS/04-domain-model.md) pero nunca se guardó en base. asiento
-- pasa a asociarse a una declaración (empresa_id + período AAAAMM); estado
-- es derivado por la app, no editado a mano por el usuario.
create table public.declaracion (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresa(id) on delete cascade,
  periodo text not null check (periodo ~ '^[0-9]{6}$'),
  estado text not null default 'abierta' check (estado in ('abierta', 'generada', 'con_errores')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (empresa_id, periodo)
);

alter table public.declaracion enable row level security;

-- Mismo patrón de RLS que asiento/plan_cuentas.
create policy declaracion_select_own on public.declaracion
  for select using (
    exists (
      select 1 from public.empresa e
      where e.id = declaracion.empresa_id
        and e.cuenta_id = (select auth.uid())
    )
  );

create policy declaracion_insert_own on public.declaracion
  for insert with check (
    exists (
      select 1 from public.empresa e
      where e.id = declaracion.empresa_id
        and e.cuenta_id = (select auth.uid())
    )
  );

-- estado se actualiza al generar el archivo PADI (TD-20) o al detectar
-- asientos sin resolver -- ambos casos son la propia empresa del usuario.
create policy declaracion_update_own on public.declaracion
  for update using (
    exists (
      select 1 from public.empresa e
      where e.id = declaracion.empresa_id
        and e.cuenta_id = (select auth.uid())
    )
  );

-- Nullable primero: hay 25 filas de asiento ya cargadas (verificación
-- manual de TD-13 contra staging) que no tienen período propio.
alter table public.asiento add column declaracion_id uuid references public.declaracion(id) on delete cascade;

-- Backfill: una declaración por empresa con asientos existentes. Período
-- inferido como 202506 -- coincide con el archivo de prueba real usado en
-- esa verificación ("ASIENTOS JUNIO 2026.TXT"). No se borra ningún dato.
insert into public.declaracion (empresa_id, periodo)
select distinct empresa_id, '202506'
from public.asiento
where declaracion_id is null;

update public.asiento a
set declaracion_id = d.id
from public.declaracion d
where a.empresa_id = d.empresa_id
  and d.periodo = '202506'
  and a.declaracion_id is null;

alter table public.asiento alter column declaracion_id set not null;
