-- TD-38 (2026-09-01): matriz de mapeo del Formulario 1376, una por empresa.
--
-- Relación BIYECTIVA código de línea 1376 <-> cuenta contable: un código mapea
-- a lo sumo una cuenta, y una cuenta se usa a lo sumo en un código (las dos
-- uniques de abajo). Cada fila lleva además el lado (Debe/Haber) y la columna
-- de importe del TXT (`total` para asientos abiertos, `iva` para el "formato
-- rápido" de Memory Conty) de donde el motor de la 1376 (TD-41) lee el saldo
-- de esa cuenta — confirmado con la contadora, ver
-- `.context/tax-rules/1376/formulas.md`.
--
-- Espeja el modelo de `plan_cuentas` (20260715120000, 20260805100000): RLS
-- scopeada vía `empresa.cuenta_id = auth.uid()` y guardado por RPC con
-- reconciliación delete-then-reinsert (sin policy de update).
create table public.mapeo_1376 (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresa(id) on delete cascade,
  codigo_linea text not null references public.codigo_linea_1376(codigo),
  cuenta_contable text not null,
  lado text not null check (lado in ('debe', 'haber')),
  columna_importe text not null check (columna_importe in ('total', 'iva')),
  created_at timestamptz not null default now(),
  unique (empresa_id, codigo_linea),
  unique (empresa_id, cuenta_contable)
);

alter table public.mapeo_1376 enable row level security;

create policy mapeo_1376_select_own on public.mapeo_1376
  for select using (
    exists (
      select 1 from public.empresa e
      where e.id = mapeo_1376.empresa_id
        and e.cuenta_id = (select auth.uid())
    )
  );

create policy mapeo_1376_insert_own on public.mapeo_1376
  for insert with check (
    exists (
      select 1 from public.empresa e
      where e.id = mapeo_1376.empresa_id
        and e.cuenta_id = (select auth.uid())
    )
  );

create policy mapeo_1376_delete_own on public.mapeo_1376
  for delete using (
    exists (
      select 1 from public.empresa e
      where e.id = mapeo_1376.empresa_id
        and e.cuenta_id = (select auth.uid())
    )
  );

-- `p_filas`: array de {codigo_linea, cuenta_contable, lado, columna_importe}.
-- Los códigos de línea sin cuenta asignada simplemente no vienen en el array.
-- Reconciliación delete-then-reinsert dentro de la transacción implícita de la
-- función: si el reinsert viola una de las uniques de biyección (23505), el
-- delete también se revierte y la empresa nunca queda con el mapeo a medias.
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

  -- Un `p_empresa_id` ajeno o inexistente: sin este guard el delete/insert no
  -- afectarían filas (RLS) y el guardado "tendría éxito" en silencio sin
  -- cambiar nada. Lo convertimos en un error explícito.
  if not v_owns then
    raise exception 'Empresa % no encontrada o no pertenece a la cuenta actual', p_empresa_id;
  end if;

  delete from public.mapeo_1376 where empresa_id = p_empresa_id;

  insert into public.mapeo_1376 (empresa_id, codigo_linea, cuenta_contable, lado, columna_importe)
  select
    p_empresa_id,
    item->>'codigo_linea',
    item->>'cuenta_contable',
    item->>'lado',
    item->>'columna_importe'
  from jsonb_array_elements(p_filas) as item;
end;
$$;
