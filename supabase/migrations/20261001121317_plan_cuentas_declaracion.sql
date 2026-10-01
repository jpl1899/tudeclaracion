-- TD-50 (2026-10-01), ADR-0007: each plan_cuentas row belongs to one
-- declaration. Until now only the plain PADI code was stored, so a code shared
-- by both catalogs (502) lost whether the user chose it for the 2181 or the
-- 1376, and every consumer had to guess. From here on the 2181 pipeline reads
-- only declaracion = '2181' rows and every 1376 consumer only '1376' rows.
alter table public.plan_cuentas
  add column declaracion text not null default '2181'
  check (declaracion in ('2181', '1376'));

-- Backfill: a code that exists only in the 1376 catalog can only be a 1376
-- account. Shared codes stay 2181 -- until TD-49 the edit screen only offered
-- 2181 codes, so a pre-existing 502 row came from the 2181 list.
update public.plan_cuentas
set declaracion = '1376'
where codigo_padi in (select codigo from public.codigo_linea_1376)
  and codigo_padi not in ('502', '503', '504', '505', '506');

-- Same p_cuentas shape plus an optional `declaracion` (defaults to '2181' so
-- an older client that does not send it keeps the previous behaviour).
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

  insert into public.plan_cuentas (empresa_id, cuenta_contable, codigo_padi, codigo_iva, declaracion)
  select
    v_empresa_id,
    item->>'cuenta_contable',
    item->>'codigo_padi',
    nullif(item->>'codigo_iva', '')::smallint,
    coalesce(nullif(item->>'declaracion', ''), '2181')
  from jsonb_array_elements(p_cuentas) as item;

  return v_empresa_id;
end;
$$;

create or replace function public.editar_empresa_con_plan_cuentas(
  p_empresa_id uuid,
  p_rut text,
  p_nombre text,
  p_cuentas jsonb
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_updated_rows int;
begin
  update public.empresa
  set rut = p_rut,
      nombre = p_nombre,
      updated_at = now()
  where id = p_empresa_id;

  get diagnostics v_updated_rows = row_count;

  -- See 20260805100000: an RLS-filtered UPDATE affects no rows instead of
  -- raising, so a foreign or unknown id becomes an explicit error here.
  if v_updated_rows = 0 then
    raise exception 'Empresa % no encontrada o no pertenece a la cuenta actual', p_empresa_id;
  end if;

  delete from public.plan_cuentas where empresa_id = p_empresa_id;

  insert into public.plan_cuentas (empresa_id, cuenta_contable, codigo_padi, codigo_iva, declaracion)
  select
    p_empresa_id,
    item->>'cuenta_contable',
    item->>'codigo_padi',
    nullif(item->>'codigo_iva', '')::smallint,
    coalesce(nullif(item->>'declaracion', ''), '2181')
  from jsonb_array_elements(p_cuentas) as item;
end;
$$;
