-- TD-30 (2026-08-05): habilita editar una empresa existente (nombre, RUT y su
-- plan de cuentas de IVA/Compras Exentas) desde /empresas/[id]. Hasta ahora
-- solo existía el camino de creación (crear_empresa_con_plan_cuentas) — no
-- había forma de actualizar una empresa ya dada de alta.
--
-- `plan_cuentas` solo tenía policies de select/insert (ver
-- 20260715120000_rediseno_plan_cuentas.sql); esta migración agrega la policy
-- de delete que la estrategia de reconciliación "delete-then-reinsert" del
-- RPC nuevo necesita. No se agrega policy de update: el RPC nunca corre un
-- UPDATE sobre plan_cuentas, solo DELETE + INSERT.
create policy plan_cuentas_delete_own on public.plan_cuentas
  for delete using (
    exists (
      select 1 from public.empresa e
      where e.id = plan_cuentas.empresa_id
        and e.cuenta_id = (select auth.uid())
    )
  );

-- Mismo shape de p_cuentas que crear_empresa_con_plan_cuentas
-- ({cuenta_contable, codigo_padi, codigo_iva?}). Reconciliación de
-- plan_cuentas vía delete-then-reinsert (no diff fila a fila) — ambos
-- statements corren en la transacción implícita de la función, así que un
-- fallo en el reinsert (p.ej. cuenta_contable duplicada) revierte también el
-- delete. La empresa nunca queda con el plan de cuentas vacío por un error a
-- mitad de camino.
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

  -- RLS (empresa_update_own) hace que un p_empresa_id ajeno o inexistente
  -- resulte en un UPDATE que no afecta ninguna fila, en vez de un error. Sin
  -- este guard, un id robado/inventado en la URL se "guardaría" en silencio
  -- sin cambiar nada — este chequeo convierte ese caso en un error explícito.
  if v_updated_rows = 0 then
    raise exception 'Empresa % no encontrada o no pertenece a la cuenta actual', p_empresa_id;
  end if;

  delete from public.plan_cuentas where empresa_id = p_empresa_id;

  insert into public.plan_cuentas (empresa_id, cuenta_contable, codigo_padi, codigo_iva)
  select
    p_empresa_id,
    item->>'cuenta_contable',
    item->>'codigo_padi',
    nullif(item->>'codigo_iva', '')::smallint
  from jsonb_array_elements(p_cuentas) as item;
end;
$$;
