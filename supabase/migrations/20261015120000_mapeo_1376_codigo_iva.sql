-- ADR-0010 (2026-10-15): el 1376 aplica los dos criterios del 2181 por
-- movimiento. El formato rápido (Código IVA > 0) entra por el código de IVA
-- de la fila y toma la columna IVA; el asiento abierto (Código IVA = 0) entra
-- por la cuenta del lado configurado y toma Total. La columna de importe por
-- fila deja de tener sentido y se elimina.
--
-- `codigo_iva` es opcional: una fila sin código solo junta asientos abiertos.
-- Mismo rango que `asiento.codigo_iva` sin el 0 (que significa asiento
-- abierto). Único por empresa: un movimiento de formato rápido alimenta a lo
-- sumo una línea. Postgres admite varios null en un unique.
alter table public.mapeo_1376
  add column codigo_iva smallint check (codigo_iva between 1 and 9),
  add constraint mapeo_1376_empresa_codigo_iva_key unique (empresa_id, codigo_iva);

alter table public.mapeo_1376 drop column columna_importe;

-- `p_filas`: array de {codigo_iva, codigo_linea, cuenta_contable, lado}.
-- `codigo_iva` viene null cuando la fila no tiene código.
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
