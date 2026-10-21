## Asientos excluidos del 2181 {#asientos-excluidos}

> *Hay N asientos de este período que no se pudo resolver a un código PADI. Estas líneas no se incluyen en el archivo PADI generado.*

El archivo se importó bien, pero algunos asientos no pueden ir al 2181. Cada uno se lista con su día, su RUT y el motivo:

| Motivo en pantalla | Qué significa | Qué hacer |
|---|---|---|
| *no está mapeado en el plan de cuentas* | Ni su código de IVA ni sus cuentas de Debe y Haber están en el plan de cuentas de la empresa. | Nada, si el asiento no va al 2181. Si debería ir, agregá su código de IVA o su cuenta, con el código PADI que corresponde, en el plan de cuentas (detalle de la empresa) y volvé a importar el TXT. |
| *tiene un tipo fuera del alcance de esta declaración* | El asiento tiene un Tipo distinto de 504 (por ejemplo CIE o APE). | Nada, si el Tipo es correcto. Si no, corregilo en el TXT de origen. |
| *tiene un importe inválido (no puede ser cero)* | El Total es 0. | Revisá el importe en el TXT de origen. |
| *tiene un Libro que no coincide con el tipo de cuenta resuelta (revisar el TXT de origen)* | El Libro no coincide con la cuenta: las que empiezan con 2 son de venta y las que empiezan con 1 son de compra. | Corregí el Libro en el TXT, o el código de IVA de la cuenta en el plan de cuentas. |
| *tiene un RUT que no es de 12 dígitos (revisar el TXT de origen)* | El asiento va al 2181 pero su RUT no tiene 12 dígitos. | Corregí el RUT en el TXT de origen. |

Lo único que decide qué entra en el 2181 es el plan de cuentas de la empresa: el código de IVA, la cuenta contable y el código PADI que cargaste. Lo que no está ahí no va al 2181.

Después de corregir, importá de nuevo el TXT del período y elegí **Sí, reemplazar**.
