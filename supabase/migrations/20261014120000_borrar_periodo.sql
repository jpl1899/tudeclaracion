-- v1.0 (2026-10-14): borrar un período entero desde "Actividad reciente".
-- El 2181 es el anexo del 1376 y ambos se calculan sobre los mismos asientos,
-- así que se borran juntos: declaracion_1376, declaracion (2181) y, por el
-- `on delete cascade` de asiento.declaracion_id, todos sus asientos. La
-- empresa, el plan de cuentas y el mapeo del 1376 no se tocan.

-- Mismo patrón de RLS que asiento_delete_own: solo el dueño de la empresa.
create policy declaracion_delete_own on public.declaracion
  for delete using (
    exists (
      select 1 from public.empresa e
      where e.id = declaracion.empresa_id
        and e.cuenta_id = (select auth.uid())
    )
  );

create policy declaracion_1376_delete_own on public.declaracion_1376
  for delete using (
    exists (
      select 1 from public.empresa e
      where e.id = declaracion_1376.empresa_id
        and e.cuenta_id = (select auth.uid())
    )
  );

-- Una sola transacción: o se borra el período completo, o nada.
create or replace function public.borrar_periodo(
  p_empresa_id uuid,
  p_periodo text
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  delete from public.declaracion_1376
  where empresa_id = p_empresa_id and periodo = p_periodo;

  delete from public.declaracion
  where empresa_id = p_empresa_id and periodo = p_periodo;
end;
$$;
