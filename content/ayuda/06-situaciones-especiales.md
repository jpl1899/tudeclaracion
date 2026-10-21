## Situaciones especiales {#situaciones-especiales}

### Dólares y cotización {#dolares-y-cotizacion}

Los asientos con Moneda `1` están en dólares y se convierten a pesos con la cotización:

- Si la columna **Cotización** trae un valor (por ejemplo `38.45`), se usa ese valor.
- Si trae **0**, se usa la cotización del BCU del **día hábil anterior** al día del asiento.

Mensajes posibles al importar:

- *No se pudo obtener la cotización del BCU para este período. Intentá nuevamente en unos minutos.*: el servicio del BCU no respondió. Es temporal.
- *No se encontró cotización del BCU para el día hábil anterior al N del período.*: el BCU no publicó cotización para esa fecha. Cargá la cotización a mano en la columna Cotización de esos asientos y volvé a importar.

Podés consultar las cotizaciones usadas en el panel → *Cotizaciones*.

### Resultados negativos {#resultados-negativos}

> *Archivo con resultado negativo en algunos asientos. El archivo puede incluir líneas vacías.*

Algún asiento tiene Total o IVA negativo, por ejemplo una nota de crédito. Es un aviso, no un error: el archivo se importa igual. Revisá que esos importes sean correctos antes de presentar la declaración.

El archivo PADI nunca lleva importes negativos:

- **2181:** una nota de crédito se descuenta de las ventas del mismo RUT y código. Si el neto da 0 o negativo (por ejemplo, una nota de crédito mayor que la venta del período), esa línea no va en el archivo.
- **1376:** un código de línea cuyo total da negativo no va en el archivo.
