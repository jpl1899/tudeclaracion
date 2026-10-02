-- Threat-model item 5: any authenticated user could INSERT/UPDATE the shared
-- BCU cache and poison the USD rate used in other tenants' declarations.
-- The cache now holds public BCU data written only by the server through the
-- admin client (src/infrastructure/supabase/admin.ts, secret key bypasses
-- RLS). Users keep SELECT only.
--
-- Apply AFTER the app version that writes with the admin client is deployed;
-- an older build would fail its cache upserts.
drop policy if exists cotizacion_bcu_cache_insert on public.cotizacion_bcu_cache;
drop policy if exists cotizacion_bcu_cache_update on public.cotizacion_bcu_cache;
