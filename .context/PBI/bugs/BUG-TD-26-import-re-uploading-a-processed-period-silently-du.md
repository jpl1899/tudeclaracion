# BUG: Import: re-uploading a processed period silently duplicates asientos

**Jira Key:** [TD-26](https://lk-tudeclaracion.atlassian.net/browse/TD-26)
**Priority:** Medium
**Status:** Deployed
**Components:** None

---

## Description

## Bug

Al subir un TXT para un período (AAAA/mm) que ya tiene asientos cargados, `insertar_asientos` (RPC) los vuelve a insertar sin ningún chequeo. No hay `unique` constraint en `asiento`, así que cada reimportación duplica todas las líneas silenciosamente — sin error, sin aviso.

## Root Cause

`supabase/migrations/20260717171500*insertar*asientos*con*periodo.sql` hace upsert de `declaracion` (que sí tiene `unique(empresa_id, periodo)`) pero el `insert into public.asiento` que sigue no verifica si esa declaración ya tiene líneas.

## Impact

Si el usuario carga el mismo archivo dos veces, TD-23 (consolidación) suma los importes duplicados y el archivo PADI exportado a DGI queda con montos incorrectos. Encontrado en vivo durante testing en staging con el contador.

## Confirmed business rule

Al subir un TXT para un período que ya tiene asientos: bloquear el import automático y mostrar "Este asiento del AAAA/mm, ya fue procesado, ¿desea reemplazarlo? Sí/No/Cancelar". Si confirma reemplazo: borrar los asientos viejos e insertar los nuevos. Si no: abortar sin tocar datos existentes.

## Bundled in this ticket

Related UI bug found in the same session: after a successful import, the dashboard's "Actividad reciente" table doesn't reflect the new declaración — the Server Component only fetches on initial render and nothing calls `router.refresh()` after a successful import. Fixed in the same PR (same component, one-line fix).

---

## Related Issues

- relates to: [TD-12](https://lk-tudeclaracion.atlassian.net/browse/TD-12) - File Upload | Confirm successful upload before processing starts

---

## Metadata

- **Created:** 19/7/2026
- **Updated:** 19/7/2026
- **Reporter:** Juan Leites
- **Assignee:** Juan Leites

---

_Synced from Jira by sync-jira-issues_
