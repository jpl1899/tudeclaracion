# Comments for TD-39

[View in Jira](https://lk-tudeclaracion.atlassian.net/browse/TD-39)

---

### Juan Leites - 9/17/2026, 6:54:46 AM

## Cerrado sin desarrollo — cubierto por TD-38-D3

Al planificar esta historia se encontró que el AC quedó satisfecho como efecto colateral de la decisión TD-38-D3 (filas fijas por catálogo en vez del modelo "agregar fila por cuenta" que asumía el diseño original de esta historia).

### Verificación contra la app corriendo (dev server, empresa "Empresa Test TD-38")

| Escenario del AC | Resultado |
| --- | --- |
| Abrir una matriz existente con filas precargadas | OK — la pantalla ya carga `mapeo_1376` y precarga cada fila |
| Cambiar cuenta/lado/columna de una fila y guardar | OK — editado código 101 (cuenta, lado Debe→Haber), persistió tras recargar |
| Quitar una fila y guardar | OK — vaciar la cuenta contable y guardar deja el código sin mapear (el RPC omite filas sin cuenta) |
| Cancelar sin guardar | OK — "Volver sin guardar" descarta los cambios sin persistir |
| Fila incompleta bloquea el guardado | OK — cuenta sin lado/columna bloquea el guardado con mensaje "El código 101 tiene una cuenta asignada pero le falta el lado o la columna de importe." |

No se requiere código nuevo. No se creó PR.

***Nota de scope***: el AC original mencionaba "line code" como editable — en el modelo de filas fijas por catálogo (TD-38-D3) el código de línea es la clave de la fila, no un campo editable. Si en el futuro se necesita gestionar el catálogo de códigos en sí (agregar/quitar códigos del 1376), eso es responsabilidad del backoffice, no de esta pantalla — fuera de alcance según el plan de TD-38.

---


_Synced from Jira by sync-jira-issues_
