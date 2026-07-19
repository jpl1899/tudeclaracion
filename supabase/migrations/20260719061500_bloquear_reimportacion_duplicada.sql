-- TD-26: insertar_asientos rechaza reinsertar líneas para un período que ya
-- tiene asientos cargados, salvo que el caller pase p_reemplazar=true (borra
-- los asientos previos antes de insertar los nuevos). Antes, resubir el mismo
-- TXT duplicaba cada línea silenciosamente -- sin unique constraint en
-- asiento, cada reimportación insertaba de nuevo todo el batch, duplicando
-- los montos consolidados por TD-23 en el archivo PADI (TD-20).
drop function if exists public.insertar_asientos(uuid, text, jsonb);

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
