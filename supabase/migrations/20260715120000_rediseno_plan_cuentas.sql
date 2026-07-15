-- TD-7/TD-24 rework (2026-07-15): el modelo anterior (catálogo fijo de 5 filas,
-- codigo_iva como FK, unique(empresa_id, codigo_iva)) no soportaba las reglas
-- confirmadas con el contador contra un archivo real (engram topic
-- tax-rules/2181-amount-resolution-two-paths, SRS/06-normalizer.md,
-- SRS/08-tax-engine.md):
--   - Código de IVA, cuenta contable y código PADI son datos libres que carga
--     el usuario, no un catálogo cerrado.
--   - Varias cuentas contables pueden resolver al mismo código PADI (no solo
--     para Compras exentas).
drop table if exists public.plan_cuentas;
drop table if exists public.codigo_iva;

create table public.plan_cuentas (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresa(id) on delete cascade,
  cuenta_contable text not null,
  codigo_padi text not null check (codigo_padi in ('502', '503', '504', '505', '506')),
  -- Dígito 0-9 del "formato rápido" (Camino 1, ver 08-tax-engine.md). Null para
  -- las cuentas de Compras exentas, que matchean solo por cuenta contable
  -- (Camino 2) — el unique de abajo permite múltiples null por empresa.
  codigo_iva smallint check (codigo_iva between 0 and 9),
  created_at timestamptz not null default now(),
  unique (empresa_id, cuenta_contable),
  unique (empresa_id, codigo_iva)
);

alter table public.plan_cuentas enable row level security;

create policy plan_cuentas_select_own on public.plan_cuentas
  for select using (
    exists (
      select 1 from public.empresa e
      where e.id = plan_cuentas.empresa_id
        and e.cuenta_id = (select auth.uid())
    )
  );

create policy plan_cuentas_insert_own on public.plan_cuentas
  for insert with check (
    exists (
      select 1 from public.empresa e
      where e.id = plan_cuentas.empresa_id
        and e.cuenta_id = (select auth.uid())
    )
  );

-- Firma sin cambios (p_rut, p_nombre, p_cuentas) — solo cambia la forma de
-- cada elemento de p_cuentas: {cuenta_contable, codigo_padi, codigo_iva?}.
create or replace function public.crear_empresa_con_plan_cuentas(
  p_rut text,
  p_nombre text,
  p_cuentas jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_empresa_id uuid;
begin
  insert into public.empresa (cuenta_id, rut, nombre)
  values ((select auth.uid()), p_rut, p_nombre)
  returning id into v_empresa_id;

  insert into public.plan_cuentas (empresa_id, cuenta_contable, codigo_padi, codigo_iva)
  select
    v_empresa_id,
    item->>'cuenta_contable',
    item->>'codigo_padi',
    nullif(item->>'codigo_iva', '')::smallint
  from jsonb_array_elements(p_cuentas) as item;

  return v_empresa_id;
end;
$$;
