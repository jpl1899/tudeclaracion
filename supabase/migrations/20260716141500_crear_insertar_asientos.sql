-- TD-13: inserta en una sola transacción todas las líneas ya parseadas y
-- validadas por parseAsientosTxt (src/modules/parser/parse-asientos.ts). Un
-- único insert/select es atómico en Postgres — si alguna fila viola una
-- constraint, no se escribe ninguna (regla de "abortar archivo completo").
create or replace function public.insertar_asientos(
  p_empresa_id uuid,
  p_lineas jsonb
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  insert into public.asiento (
    empresa_id, dia, debe, haber, concepto, rut, moneda, total, codigo_iva, iva, cotizacion, libro, tipo
  )
  select
    p_empresa_id,
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
