## Errores al importar {#errores-al-importar}

Si el error menciona un campo (*Campo "RUT": …*), la explicación de ese campo está en [El archivo TXT](#archivo-txt). Abajo están los casos que afectan al archivo completo.

### Muchos campos inválidos en la misma línea {#columnas-desordenadas}

> *Este archivo no cumple las reglas básicas del TXT. … se detectaron N campos inválidos a la vez -- es probable que las columnas no coincidan con el orden esperado.*

Cuando 3 o más campos de una misma línea fallan juntos, casi nunca son varios errores de tipeo: lo más probable es que las columnas estén corridas. Por ejemplo, un RUT de 12 dígitos colado después de Haber hace fallar todos los campos siguientes.

Qué revisar:

- Que el archivo siga el [orden de las columnas](#archivo-txt).
- Que los textos con comas (por ejemplo, en Concepto) vengan entre comillas.
- En el 1376, que traiga la [fila de encabezado](#encabezado-1376).
- Si tu sistema agrega columnas extra, que estén marcadas como [columnas especiales](#columnas-especiales).

### Faltan columnas {#faltan-columnas}

> *Faltan N columnas, por favor revisa los asientos.*

El archivo trae menos campos por línea que los 11 obligatorios. El mensaje lista los campos esperados en orden. Revisá la configuración de exportación de tu sistema contable.

### Período ya procesado {#reemplazar-periodo}

> *Este asiento del MM/AAAA ya fue procesado. ¿Deseás reemplazarlo?*

Ya hay un TXT importado para ese período y esa empresa.

- **Sí, reemplazar:** se borran los asientos cargados antes para ese período y se cargan los del archivo nuevo. La declaración vuelve a quedar pendiente de generar.
- **Cancelar:** no cambia nada.

No dividas un TXT grande en dos archivos para el mismo período: el segundo se detecta como período ya procesado y reemplazaría al primero.

Para eliminar un período entero, sin reemplazarlo, usá el ícono de papelera en *Actividad reciente* del panel. Se borran los asientos y las dos declaraciones del período, el 2181 y el 1376.

### Archivo demasiado grande {#limite-de-lineas}

> *El archivo supera el máximo de 20.000 líneas por período.*

Es un límite de seguridad. Un mes real suele tener bastante menos. Si te aparece, revisá que el archivo corresponda a un solo período.

### No se pudo guardar

> *No se pudo guardar el archivo. Intentá nuevamente en unos minutos.*

Fue un problema temporal al guardar, no un problema del archivo. Volvé a intentar; si persiste, contactá a soporte.
