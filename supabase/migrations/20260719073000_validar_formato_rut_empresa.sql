-- TD-16: RUT del declarante (empresa) debe tener el mismo formato de 12
-- dígitos numéricos que ya se exige en asiento.rut (asiento_rut_check,
-- 20260716160000_check_asiento_campos.sql). La tabla empresa no tenía
-- ninguna restricción de formato -- solo se validaba client-side que no
-- estuviera vacío. Verificados los 2 RUT existentes antes de este cambio:
-- ambos ya cumplen el formato, no hace falta backfill.
alter table public.empresa
  add constraint empresa_rut_check check (rut ~ '^[0-9]{12}$');
