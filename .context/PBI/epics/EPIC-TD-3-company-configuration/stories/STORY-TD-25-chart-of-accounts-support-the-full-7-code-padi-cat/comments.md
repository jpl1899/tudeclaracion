# Comments for TD-25

[View in Jira](https://lk-tudeclaracion.atlassian.net/browse/TD-25)

---

### Juan Leites - 16/7/2026, 17:08:55

## Contexto (creado 2026-07-16, al cerrar TD-22)

El catálogo completo del formulario 2181 tiene 7 códigos PADI (confirmado en `TD-22`'s comentario del 14/7): 502, 503, 504, 505, 506, 552, 553.

`plan*cuentas` (TD-7, `supabase/migrations/20260715120000*rediseno*plan*cuentas.sql`) solo permite 5 en su `check` constraint:

```sql
codigo*padi text not null check (codigo*padi in ('502', '503', '504', '505', '506'))
```

Faltan ***552**** (Venta por cuenta ajena tasa básica, por cuenta y orden) y ****553*** (Venta por cuenta ajena tasa mínima) — no se pueden cargar en el plan de cuentas de ninguna empresa hoy.

## Qué falta confirmar

- ¿552/553 están dentro del alcance del MVP, o son un caso de uso que no aplica a los clientes iniciales (venta por cuenta y orden de terceros)?
- Si están en scope: extender el `check` constraint de `plan_cuentas` + la UI de `/empresas/nueva` (selector de Código PADI) para incluir ambos códigos.

No se fabrica alcance acá — este ticket existe para que el gap no se pierda, no para asumir la respuesta. Bloquea la estimación hasta que el contador confirme si aplica.

---


_Synced from Jira by sync-jira-issues_
