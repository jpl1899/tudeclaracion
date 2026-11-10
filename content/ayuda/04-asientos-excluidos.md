## Asientos excluidos del 2181 {#asientos-excluidos}

> *Hay N exclusiones en este período. No se incluyen en el archivo PADI generado.*

El archivo se importó bien, pero algunos asientos o líneas no pueden ir al 2181. Es una advertencia: el archivo PADI se puede descargar igual. Cada asiento se lista con su día, su RUT y el motivo:

| Motivo en pantalla | Qué significa | Qué hacer |
|---|---|---|
| *no está mapeado en el plan de cuentas* | Ni su código de IVA ni sus cuentas de Debe y Haber están en el plan de cuentas de la empresa. | Nada, si el asiento no va al 2181. Si debería ir, agregá su código de IVA o su cuenta, con el código PADI que corresponde, en el plan de cuentas (detalle de la empresa) y volvé a importar el TXT. |
| *tiene un tipo fuera del alcance de esta declaración* | El asiento tiene un Tipo distinto de 504 (por ejemplo CIE o APE). | Nada, si el Tipo es correcto. Si no, corregilo en el TXT de origen. |
| *tiene un importe inválido (no puede ser cero)* | El Total es 0. | Revisá el importe en el TXT de origen. |
| *tiene un Libro equivocado para esa cuenta* | Asiento abierto (Código IVA 0) cuyo Libro no coincide con su cuenta: las que empiezan con 2 son de venta y las que empiezan con 1 son de compra. | Corregí el Libro en el TXT de origen. |
| *tiene un Código IVA que no coincide con el Libro* | Asiento en formato rápido cuyo Código IVA lleva a una cuenta de venta con un Libro de compra, o al revés. | Corregí el Código IVA o el Libro en el TXT de origen, o la cuenta de ese Código IVA en el plan de cuentas. |
| *tiene un RUT que no es de 12 dígitos (revisar el TXT de origen)* | El asiento va al 2181 pero su RUT no tiene 12 dígitos. | Corregí el RUT en el TXT de origen. |

Además, se listan las **líneas que quedaron en negativo o en 0**: el 2181 suma los asientos de un mismo RUT y código PADI, y si el neto da 0 o negativo (por ejemplo, una nota de crédito mayor que la venta del período) esa línea no va en el archivo. Se muestra con su RUT, su código PADI y el importe neto. Si el resultado es correcto, no hace falta hacer nada.

Lo único que decide qué entra en el 2181 es el plan de cuentas de la empresa: el código de IVA, la cuenta contable y el código PADI que cargaste. Lo que no está ahí no va al 2181.

Después de corregir, importá de nuevo el TXT del período y elegí **Sí, reemplazar**.
