-- TD-20 (ADR-0003): insertar_asientos ahora recibe el período de la
-- declaración, resuelve-o-crea la fila de declaracion para
-- (empresa_id, periodo) y estampa declaracion_id en cada asiento insertado,
-- dentro de la misma transacción atómica.
--
-- `create or replace` no reemplaza una función cuando cambia la lista de
-- parámetros -- crea un overload nuevo y deja el viejo vivo. Se borra
-- explícitamente la firma anterior (2 argumentos) para que no quede
-- ambigüedad de cuál invoca el cliente.
drop function if exists public.insertar_asientos(uuid, jsonb);

create or replace function public.insertar_asientos(
  p_empresa_id uuid,
  p_periodo text,
  p_lineas jsonb
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_declaracion_id uuid;
begin
  insert into public.declaracion (empresa_id, periodo)
  values (p_empresa_id, p_periodo)
  on conflict (empresa_id, periodo) do update set periodo = excluded.periodo
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
