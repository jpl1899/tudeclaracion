# Comments for TD-24

[View in Jira](https://lk-tudeclaracion.atlassian.net/browse/TD-24)

---

### Juan Leites - 15/7/2026, 8:08:49

## Rediseño implementado 2026-07-15 — reemplaza el modelo de esta historia

Se validó con el contador (ficha de validación + boceto interactivo) que el modelo original (catálogo fijo de 5 filas, una cuenta por concepto) no soportaba las reglas reales del negocio. Se reemplazó por completo:

- ***Antes***: `codigo*iva` catálogo fijo (5 filas) + `plan*cuentas` con `unique(empresa*id, codigo*iva)` — una sola cuenta contable por concepto fiscal.
- ***Ahora***: dos tablas libres en `/empresas/nueva` —

Migración: `supabase/migrations/20260715120000*rediseno*plan_cuentas.sql`. Frontend reescrito en `nueva-empresa-client.tsx`. Probado end-to-end (login + alta de empresa + verificación en base) contra staging.

***Esto reemplaza el alcance original de TD-24*** ("agregar columna Código de IVA") — ya no aplica como historia separada, quedó absorbida en este rediseño.

Pendiente: pasar de nuevo por QA — el flujo cambió de raíz respecto a lo que ya se había probado.

---

### Juan Leites - 16/7/2026, 18:05:38

## Cerrado 2026-07-16 — confirmado superado por el rediseño de TD-7

El comentario del 15/7 en este mismo ticket ya lo declaraba: **"Esto reemplaza el alcance original de TD-24 ('agregar columna Código de IVA') — ya no aplica como historia separada, quedó absorbida en este rediseño."** Quedó sin cerrar formalmente.

Verificado contra el código real (`src/app/empresas/nueva/nueva-empresa-client.tsx`, migración `20260715120000*rediseno*plan_cuentas.sql`): las filas de "Códigos de formato rápido de IVA" ya capturan `codigoIva` junto con `cuentaContable` y `codigoPadi` en un único paso al alta de la empresa — no existe una tabla previa de "Nombre de Impuesto ↔ Número de Cuenta" a la que TD-24 le faltara agregar una columna. El modelo que TD-24 describe nunca se construyó; el rediseño de TD-7 lo reemplazó directamente.

A diferencia de TD-22, acá no se encontró ningún gap residual (no hay equivalente al 552/553) — el alcance original de TD-24 está 100% cubierto por lo que TD-7 ya implementó.

Detalle: `.context/dev-roadmap.md` §3/§6 (2026-07-16).

---


_Synced from Jira by sync-jira-issues_
