-- Threat model item 4 (2026-10-17): the bulk-write RPCs took a jsonb array of
-- any size. Any self-service account could call them directly through
-- supabase-js with a huge array and degrade the database shared by every
-- tenant. Each RPC now rejects arrays above a generous cap before touching
-- any table. The caps cut the pathological case only: the largest real TXT
-- seen so far has 2455 lines.
--
-- Bodies are unchanged from their latest versions (insertar_asientos:
-- 20260719061500, crear/editar_empresa_con_plan_cuentas: 20261001121317,
-- guardar_mapeo_1376: 20261015120000); only the size check is added.

create or replace function public.insertar_asientos(
  p_empresa_id uuid,
  p_periodo text,
  p_lineas jsonb,
  p_reemplazar boolean default false
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_declaracion_id uuid;
  v_asientos_existentes integer;
begin
  -- The client maps this message to a user-facing error (dashboard-client.tsx).
  if jsonb_array_length(p_lineas) > 20000 then
    raise exception 'demasiadas_lineas' using errcode = 'P0001';
  end if;

  select id into v_declaracion_id
  from public.declaracion
  where empresa_id = p_empresa_id and periodo = p_periodo;

  if v_declaracion_id is not null then
    select count(*) into v_asientos_existentes
    from public.asiento
    where declaracion_id = v_declaracion_id;

    if v_asientos_existentes > 0 and not p_reemplazar then
      raise exception 'periodo_ya_procesado' using errcode = 'P0001';
    end if;

    if p_reemplazar then
      delete from public.asiento where declaracion_id = v_declaracion_id;
    end if;
  end if;

  -- Reemplazar invalida cualquier PADI ya generado con los datos viejos --
  -- vuelve la declaración a "abierta" para forzar regenerarlo.
  insert into public.declaracion (empresa_id, periodo, estado)
  values (p_empresa_id, p_periodo, 'abierta')
  on conflict (empresa_id, periodo)
    do update set estado = 'abierta'
  returning id into v_declaracion_id;

  insert into public.asiento (
    empresa_id, declaracion_id, dia, debe, haber, concepto, rut, moneda, total, codigo_iva, iva, cotizacion, libro, tipo
  )
  select
    p_empresa_id,
    v_declaracion_id,
    (item->>'dia')::smallint,
    item->>'debe',
    item->>'haber',
    item->>'concepto',
    item->>'rut',
    (item->>'moneda')::smallint,
    (item->>'total')::numeric,
    (item->>'codigoIva')::smallint,
    (item->>'iva')::numeric,
    (item->>'cotizacion')::numeric,
    item->>'libro',
    item->>'tipo'
  from jsonb_array_elements(p_lineas) as item;
end;
$$;

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
  if jsonb_array_length(p_cuentas) > 2000 then
    raise exception 'demasiadas_cuentas' using errcode = 'P0001';
  end if;

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
  if jsonb_array_length(p_cuentas) > 2000 then
    raise exception 'demasiadas_cuentas' using errcode = 'P0001';
  end if;

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

create or replace function public.guardar_mapeo_1376(
  p_empresa_id uuid,
  p_filas jsonb
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_owns boolean;
begin
  if jsonb_array_length(p_filas) > 500 then
    raise exception 'demasiadas_filas' using errcode = 'P0001';
  end if;

  select exists (
    select 1 from public.empresa e
    where e.id = p_empresa_id
      and e.cuenta_id = (select auth.uid())
  ) into v_owns;

  if not v_owns then
    raise exception 'Empresa % no encontrada o no pertenece a la cuenta actual', p_empresa_id;
  end if;

  delete from public.mapeo_1376 where empresa_id = p_empresa_id;

  insert into public.mapeo_1376 (empresa_id, codigo_iva, codigo_linea, cuenta_contable, lado)
  select
    p_empresa_id,
    (item->>'codigo_iva')::smallint,
    item->>'codigo_linea',
    item->>'cuenta_contable',
    item->>'lado'
  from jsonb_array_elements(p_filas) as item;
end;
$$;
