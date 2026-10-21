## El archivo TXT {#archivo-txt}

Es el archivo mensual de asientos que exporta tu sistema contable. Cada línea es un asiento y los campos van separados por comas. Si un campo trae comas adentro, tiene que ir entre comillas.

Si **cualquier** campo de **cualquier** línea es inválido, el archivo se rechaza completo: no se importa una parte. El mensaje indica el número de línea y cada campo con problema, para que puedas corregirlos todos de una vez.

### Orden de las columnas

El orden estándar de los 12 campos es:

`Día, Debe, Haber, Concepto, RUT, Moneda, Total, Código IVA, IVA, Cotización, Libro, Tipo`

- **2181:** las columnas se leen **por posición**, en ese orden. *Tipo* puede faltar por completo (líneas de 11 campos). Si la primera línea es una fila de títulos (empieza con `DIA`), se ignora.
- **1376:** si la primera línea trae los títulos, cada columna se lee **por su título**, aunque vengan en otro orden. Ver [Encabezado del 1376](#encabezado-1376).

### Encabezado del 1376 {#encabezado-1376}

La primera línea del archivo debe traer el título de cada columna. Así cada dato se lee por su título y no por su posición, aunque las columnas vengan en otro orden. Si tu archivo no la trae, agregá esta línea al principio:

`DIA,DEBE,HABER,CONCEPTO,RUT,MONEDA,TOTAL,CODIGOIVA,IVA,COTIZACION,LIBRO,TIPO`

Ordená los títulos igual que las columnas de tu archivo. RUC y RUT son el mismo campo. Las mayúsculas y las tildes no importan.

Sin encabezado, el importador avisa *"El archivo no trae la fila de encabezados."* y lee las columnas en el orden estándar: si tu archivo trae otro orden (por ejemplo RUC antes de Concepto), los datos quedan corridos.

### Columnas especiales {#columnas-especiales}

Algunos sistemas contables agregan columnas extra. Si el archivo trae más campos que el estándar, el importador muestra *"Este archivo no tiene el formato estándar."* y te pide marcar cuáles trae. Las opciones son: C.Costos, Comprobante, Número, Emisión, Vencimiento, Número Documento, Serie Documento, Serie y Número Asiento.

Estas columnas no se validan ni se usan: solo sirven para ubicar bien el resto de los campos. Marcá exactamente las que trae tu archivo; la cantidad marcada tiene que coincidir con los campos detectados. En el 1376 con encabezado no hace falta marcarlas: se reconocen por su título.

### Campos

#### Fila de encabezado {#campo-encabezado}

Solo en el 1376 con títulos. Mensajes posibles:

- *"… no es un título de campo conocido"*: hay un título que no corresponde a ningún campo. Revisá que esté bien escrito.
- *"… está repetido"*: el mismo campo aparece dos veces.
- *"Falta la columna: …"*: falta un campo obligatorio. Todos son obligatorios salvo *Tipo*.

#### Cantidad de campos {#campo-cantidad-de-campos}

- *"Se esperaban 11 o 12 campos, se encontraron N"*: la línea tiene más o menos campos que el estándar. Si sobran, puede faltar marcar [columnas especiales](#columnas-especiales); si faltan, el asiento está incompleto.
- *"El encabezado tiene N columnas, pero la línea trae M campos"* (1376): una línea no coincide con la fila de títulos. Suele pasar por una coma de más, o por un texto con comas sin comillas.

#### Día {#campo-dia}

Número del 1 al 31. Mensaje: *"… no es un día válido (1-31)"*.

#### Debe y Haber {#campo-debe-haber}

Código de cuenta contable, solo dígitos. Uno de los dos puede venir vacío, pero no ambos.

- *"Debe y Haber no pueden estar vacíos a la vez"*
- *"… no es un código de cuenta contable válido"*: el valor tiene letras, puntos u otros caracteres.

#### Concepto {#campo-concepto}

Texto libre, obligatorio. Mensaje: *"El concepto no puede estar vacío"*.

#### RUT {#campo-rut}

12 dígitos, sin puntos ni guiones. Solo se exige en los asientos que van al 2181: Tipo 504, Código IVA mapeado en el plan de cuentas, o Código IVA 0 con una cuenta del plan de cuentas en Debe o Haber. En el resto de los asientos (por ejemplo, un pago de anticipo de IRAE) puede venir con cualquier valor.

Mensaje: *"… no tiene el formato de 12 dígitos"*.

#### Moneda {#campo-moneda}

`0` para pesos, `1` para dólares. Mensaje: *"… debe ser 0 (pesos) o 1 (dólares)"*. Ver [Dólares y cotización](#dolares-y-cotizacion).

#### Total {#campo-total}

Importe numérico, con punto como separador decimal. Puede ser negativo. Mensaje: *"… no es un importe numérico válido"*.

#### Código IVA {#campo-codigo-iva}

Un dígito del 0 al 9. Mensaje: *"… debe ser un dígito entre 0 y 9"*.

- **Mayor que 0** (asientos en *formato rápido*): quien carga el asiento digita un código en Código IVA, y la columna IVA trae el monto del impuesto. Ese monto se vuelca a la cuenta contable mapeada a ese código en el plan de cuentas.
- **0** (asientos abiertos): el movimiento contable viene en al menos 3 líneas, con la cuenta del impuesto desglosada (en general IVA ventas o IVA compras). La cuenta se resuelve por las cuentas de Debe y Haber.

#### IVA {#campo-iva}

Importe numérico del IVA. Mensaje: *"… no es un importe numérico válido"*.

#### Cotización {#campo-cotizacion}

`0`, o un valor con dos dígitos enteros y los decimales que traiga (por ejemplo `38.45` o `39.60396039`). Mensaje: *"… debe ser 0 o un valor con dos dígitos enteros (ej. 38.45)"*. Ver [Dólares y cotización](#dolares-y-cotizacion).

#### Libro {#campo-libro}

Indica el libro al que pertenece el asiento. Todos se tienen en cuenta en los cálculos:

| Letra | Libro |
|---|---|
| `C` | Compras |
| `V` | Ventas |
| `E` | Egresos |
| `I` | Ingresos |
| `P` | P (no se controla contra el tipo de cuenta) |

Mensajes:

- *"… debe ser uno de: C, V, E, I, P"*
- *"… es inconsistente con la cuenta … (venta si empieza con 2, compra si empieza con 1)"*: el libro no coincide con la cuenta de IVA que resolvió el asiento. Revisá el Libro en el TXT de origen, o el código de IVA de esa cuenta en el plan de cuentas.
#### Tipo {#campo-tipo}

Abreviatura que identifica el asiento. Por ejemplo, `DIF` es una diferencia de cambio y `504` es una compra exenta para el 2181.

Uno de `504`, `CIE`, `RES`, `DIF`, `APE`, o vacío. Mensaje: *"… debe ser uno de: 504, CIE, RES, DIF, APE o estar vacío"*. Los asientos con Tipo distinto de 504 no entran en el 2181 (ver [Asientos excluidos](#asientos-excluidos)).
