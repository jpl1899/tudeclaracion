# BUG: PADI export: importe rounds up on every non-zero decimal instead of only >5

**Jira Key:** [TD-27](https://lk-tudeclaracion.atlassian.net/browse/TD-27)
**Priority:** Medium
**Status:** Deployed
**Components:** None

---

## Description

## Bug

El campo importe del archivo PADI se redondea con \`Math.ceil\` (siempre hacia arriba), pero la regla confirmada por el contador es distinta: se mira únicamente el primer decimal — si es ≤ 5, redondea para abajo; si es > 5, redondea para arriba. Ejemplo confirmado: 180,549 → 180 (no 181).

## Root Cause

La respuesta original del contador (2026-07-17, TD-17 pregunta 10) decía "siempre hacia arriba" y así se implementó en PR #12. Esa respuesta era incorrecta — corregida en vivo durante testing de TD-26.

## Fix

Reemplazar \`Math.ceil(Math.abs(importe))\` en \`generate-padi-file.ts\` por una función que mira solo el primer decimal (descarta el resto).

## Impact

Cualquier importe con primer decimal 1-5 salía redondeado hacia arriba de más en el archivo PADI ya generado para 202606 y cualquier otro período. Hace falta regenerar los archivos ya descargados con la regla vieja.

---

## Related Issues

- relates to: [TD-20](https://lk-tudeclaracion.atlassian.net/browse/TD-20) - PADI Export | Download the generated PADI-compatible file

---

## Metadata

- **Created:** 19/7/2026
- **Updated:** 19/7/2026
- **Reporter:** Juan Leites
- **Assignee:** Juan Leites

---

_Synced from Jira by sync-jira-issues_
