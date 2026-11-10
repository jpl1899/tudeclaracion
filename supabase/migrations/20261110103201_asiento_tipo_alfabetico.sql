-- Accountant rule (2026-11-09): any Tipo containing letters is ignored by the
-- engine, not only CIE/RES/DIF/APE. The parser now accepts those values, so
-- the DB check must too. Mirrors esTipoIgnorado in
-- src/modules/parser/parse-asientos.ts: null, '504' or a value with a letter.
alter table public.asiento
  drop constraint asiento_tipo_check,
  add constraint asiento_tipo_check check (tipo is null or tipo = '504' or tipo ~ '[[:alpha:]]');
