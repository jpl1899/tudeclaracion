-- Cotización BCU (dato informativo, no vinculado al motor ni a la
-- generación de PADI -- el usuario decide qué tipo de cambio usar en el
-- flujo de importación). Guarda el último valor obtenido con éxito para
-- poder mostrarlo como fallback cuando el fetch del día falla. No está
-- scoped a una empresa: es el mismo valor de mercado para todas.
create table public.cotizacion_bcu_cache (
  moneda_codigo integer primary key,
  fecha date not null,
  valor numeric not null,
  updated_at timestamptz not null default now()
);

alter table public.cotizacion_bcu_cache enable row level security;

create policy cotizacion_bcu_cache_select on public.cotizacion_bcu_cache
  for select to authenticated using (true);

create policy cotizacion_bcu_cache_insert on public.cotizacion_bcu_cache
  for insert to authenticated with check (true);

create policy cotizacion_bcu_cache_update on public.cotizacion_bcu_cache
  for update to authenticated using (true);
