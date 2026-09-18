-- TD-40 prerequisite fix (2026-09-18): `plan_cuentas.codigo_padi` still had a
-- CHECK restricting values to the 5 original 2181 codes (`502-506`), left
-- over from the TD-7 migration (20260715120000). PR #34 (TD-38, merged
-- 2026-09-16) extended the company-creation dropdown to also offer the 10
-- 1376 codes from `codigo_linea_1376`, but no migration ever widened this
-- constraint — selecting a 1376 code today makes `crear_empresa_con_plan_cuentas`
-- / `editar_empresa_con_plan_cuentas` fail outright (rolls back the whole call).
--
-- The TD-7 migration's own comment already states the intended design:
-- "Código de IVA, cuenta contable y código PADI son datos libres que carga
-- el usuario, no un catálogo cerrado" — a closed CHECK contradicts that.
-- `cuenta_contable` already has no such constraint; `codigo_padi` follows
-- the same precedent. App-layer validation stays the safety net: the
-- combined dropdown (`buildOpcionesCodigoPadi`, 2181 fixed list + 1376
-- config-driven catalog) is still the only source users pick from.
alter table public.plan_cuentas
  drop constraint plan_cuentas_codigo_padi_check;
