-- TD-38 (2026-09-01): catálogo configurable de códigos de línea del Formulario
-- 1376. La pantalla de mapeo (`mapeo_1376`, siguiente migración) usa estas filas
-- como esqueleto fijo: el contador engancha una cuenta contable a cada código.
--
-- Sembrado provisorio con los 10 códigos del diseño del usuario (`DJ 1376.xlsx`).
-- DGI publica el catálogo real por rubro en imágenes que todavía no fueron
-- capturadas (`.context/tax-rules/1376/open-questions.md`). Cuando llegue, se
-- reemplaza el seed sin tocar código — dato config-driven (ADR-0001).
create table public.codigo_linea_1376 (
  codigo text primary key,
  concepto text not null,
  orden smallint not null,
  created_at timestamptz not null default now()
);

alter table public.codigo_linea_1376 enable row level security;

-- Catálogo de solo lectura para cualquier usuario autenticado. Sin policies de
-- insert/update/delete: el mantenimiento del catálogo lo hará el backoffice
-- (fuera de MVP 2), no la app.
create policy codigo_linea_1376_select_authenticated on public.codigo_linea_1376
  for select
  to authenticated
  using (true);

insert into public.codigo_linea_1376 (codigo, concepto, orden) values
  ('101', 'Ventas gravadas tasa básica (22%)', 1),
  ('102', 'Ventas gravadas tasa mínima (10%)', 2),
  ('103', 'Ventas no gravadas / exentas', 3),
  ('201', 'Costo de ventas gravadas', 4),
  ('301', 'Gastos de personal / sueldos', 5),
  ('302', 'Arrendamientos pagados', 6),
  ('501', 'Crédito fiscal IVA compras', 7),
  ('502', 'Débito fiscal IVA ventas', 8),
  ('510', 'Anticipos de IRAE del ejercicio', 9),
  ('601', 'Disponibilidades (Activo)', 10);
