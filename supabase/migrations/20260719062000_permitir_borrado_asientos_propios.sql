-- TD-26: insertar_asientos corre `security invoker`, así que el DELETE que
-- hace al reemplazar un período (p_reemplazar=true) necesita su propia
-- política RLS -- sin esto, RLS bloquea el borrado silenciosamente (0 filas,
-- sin error) y el flujo de reemplazo terminaría insertando datos nuevos
-- encima de los viejos, reproduciendo el bug original.
-- Mismo patrón que asiento_select_own / asiento_insert_own.
create policy asiento_delete_own on public.asiento
  for delete using (
    exists (
      select 1 from public.empresa e
      where e.id = asiento.empresa_id
        and e.cuenta_id = (select auth.uid())
    )
  );
