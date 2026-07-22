-- TD-13/TD-15: los asientos abiertos (multilínea, una cuenta por línea)
-- traen legítimamente Debe o Haber vacío (nunca ambos) — la constraint
-- original de 20260716160000 exigía dígitos en los dos, rebotando el insert
-- aun después de relajar el parser TS. Ver .context/SRS/05-parser.md.
alter table public.asiento
  drop constraint asiento_debe_check,
  drop constraint asiento_haber_check,
  add constraint asiento_debe_check check (debe ~ '^[0-9]*$'),
  add constraint asiento_haber_check check (haber ~ '^[0-9]*$'),
  add constraint asiento_debe_haber_no_vacios_check check (debe <> '' or haber <> '');
