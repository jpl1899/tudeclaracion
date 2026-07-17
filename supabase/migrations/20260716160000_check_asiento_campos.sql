-- TD-13 code review follow-up: la RPC insertar_asientos es invocable
-- directamente (bypaseando el parser TS) por cualquier usuario autenticado
-- para su propia empresa. Estas constraints replican, a nivel DB, las mismas
-- reglas que ya aplica src/modules/parser/parse-asientos.ts.
alter table public.asiento
  add constraint asiento_dia_check check (dia between 1 and 31),
  add constraint asiento_debe_check check (debe ~ '^[0-9]+$'),
  add constraint asiento_haber_check check (haber ~ '^[0-9]+$'),
  add constraint asiento_concepto_check check (length(trim(concepto)) > 0),
  add constraint asiento_rut_check check (rut ~ '^[0-9]{12}$'),
  add constraint asiento_tipo_check check (tipo is null or tipo in ('504', 'CIE', 'RES', 'DIF', 'APE'));
