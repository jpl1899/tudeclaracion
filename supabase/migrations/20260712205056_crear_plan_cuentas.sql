-- codigo_iva: global reference catalog (not tenant-scoped), per ADR-0001's
-- "reglas en DB, no hardcodeadas" principle. Seeded from the domain model
-- confirmed in the 2026-07-12 session (engram topic domain/parser-codigoiva-mapping).
create table public.codigo_iva (
  id smallint primary key,
  tipo text not null,
  tasa numeric not null,
  rubro_padi text not null,
  descripcion text not null
);

insert into public.codigo_iva (id, tipo, tasa, rubro_padi, descripcion) values
  (1, 'IVA Compras', 10, '506', 'Iva compras plaza tasa minima'),
  (2, 'IVA Compras', 22, '505', 'Iva compras plaza tasa basica'),
  (3, 'IVA Ventas', 10, '503', 'Iva ventas plaza tasa minima'),
  (4, 'IVA Ventas', 22, '502', 'Iva ventas plaza tasa basica'),
  (5, 'Compra Exenta', 0, '504', 'Total compra exenta de iva');

alter table public.codigo_iva enable row level security;

create policy codigo_iva_select_authenticated on public.codigo_iva
  for select to authenticated using (true);

-- plan_cuentas: per-empresa chart-of-accounts-to-fiscal-concept mapping
-- (TD-7, folded self-service into TD-8's onboarding flow, 2026-07-12).
create table public.plan_cuentas (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresa(id) on delete cascade,
  codigo_iva smallint not null references public.codigo_iva(id),
  numero_cuenta text not null,
  created_at timestamptz not null default now(),
  unique (empresa_id, codigo_iva)
);

alter table public.plan_cuentas enable row level security;

-- Same RLS pattern as empresa's own policies (verified live before writing this).
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

-- Atomic creation: company + its 5-row mapping in one transaction, so a
-- partial failure never leaves an empresa with an incomplete tax mapping.
-- security invoker keeps RLS enforced (runs as the calling user).
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

  insert into public.plan_cuentas (empresa_id, codigo_iva, numero_cuenta)
  select v_empresa_id, (item->>'codigo_iva')::smallint, item->>'numero_cuenta'
  from jsonb_array_elements(p_cuentas) as item;

  return v_empresa_id;
end;
$$;
