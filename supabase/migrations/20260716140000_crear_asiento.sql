-- TD-13: tabla para las líneas de asiento parseadas del TXT de Memory.
-- Sin columna de período — el formato de entrada confirmado (SRS/05-parser.md)
-- no trae período; el dominio de salida (10-exporter.md) sí lo tiene, pero
-- asignarlo del lado de entrada queda sin definir (no se inventa acá, ver
-- implementation-plan.md Technical Decisions).
create table public.asiento (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresa(id) on delete cascade,
  dia smallint not null,
  -- Código de cuenta contable debitada/acreditada, NO un importe (05-parser.md).
  debe text not null,
  haber text not null,
  concepto text not null,
  rut text not null,
  moneda smallint not null check (moneda in (0, 1)),
  total numeric not null,
  codigo_iva smallint not null check (codigo_iva between 0 and 9),
  iva numeric not null,
  cotizacion numeric not null,
  libro text not null check (libro in ('C', 'V', 'E', 'I', 'P')),
  tipo text,
  created_at timestamptz not null default now()
);

alter table public.asiento enable row level security;

-- Mismo patrón de RLS que plan_cuentas (verificado en vivo antes de escribir esto).
create policy asiento_select_own on public.asiento
  for select using (
    exists (
      select 1 from public.empresa e
      where e.id = asiento.empresa_id
        and e.cuenta_id = (select auth.uid())
    )
  );

create policy asiento_insert_own on public.asiento
  for insert with check (
    exists (
      select 1 from public.empresa e
      where e.id = asiento.empresa_id
        and e.cuenta_id = (select auth.uid())
    )
  );
