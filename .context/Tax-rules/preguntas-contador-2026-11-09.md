# Preguntas para el contador (2026-11-09)

> Lista para enviar al contador. Cuando responda, registrar las respuestas en `contador-respuestas-<fecha>.md`, igual que las sesiones anteriores.

## A. Pendientes de sesiones anteriores

1. **Ejemplos reales.** Quedaste en pasarnos archivos TXT ya presentados en PADI, junto con el archivo que generó PADI (2181 y 1376). ¿Nos los podés mandar? Si tenés lo mismo para el 2183 y el 1050, mejor todavía.
2. **Empresas rurales.** Nos dijiste que un período rural puede ser de 12 meses o de 4. En ese caso, ¿la empresa sube un solo TXT con todos los meses? ¿Qué período lleva la declaración?
3. **Asientos de tipo `DIF`.** Los de tipo CIE, RES y APE ya no se toman en cuenta. ¿Los `DIF` deben contar para el 1376 o también se excluyen?
4. **Códigos del 1376 según el tipo de contribuyente.** El IRAE tiene los códigos 108, 126 y 128; el Impuesto al Patrimonio, 328, 320 y 323; la sobretasa, 335, 330 y 333. ¿Qué determina cuál corresponde a cada empresa?

## B. RUT

5. **Contrapartes sin RUT en el 2181.** ¿Se declaran proveedores del exterior, consumidores finales o personas con cédula? Si se declaran, ¿con qué identificador? Hoy, un asiento sin RUT se excluye y se muestra como "sin RUT".
6. **Consultas a la DGI.** La DGI ofrece servicios que, a partir de un RUT, devuelven la razón social y el domicilio, y también si la empresa tiene el Certificado Único vigente. ¿Te serviría que el sistema:
   - complete los datos al dar de alta una empresa?
   - muestre el nombre de cada contraparte en los asientos, para detectar un RUT mal escrito?
   - avise cuando una empresa tiene el Certificado Único vencido?

   Para usarlos necesitamos un certificado digital de persona jurídica y la habilitación de la DGI, así que sería para una versión futura.

## C. Formulario 2183 (retenciones y percepciones)

7. Conseguimos la tabla oficial de líneas del 2183 (67 líneas). ¿Cuáles usan tus clientes?
8. ¿Cómo se decide a qué línea va cada asiento? ¿Por cuenta del plan de cuentas, con una columna nueva como el código PADI del 2181? ¿O por otro dato del TXT?
9. ¿Es mensual? ¿Se presenta junto con el 2181 y el 1376 del mismo período?
10. ¿Tus clientes usan el Rubro 2 (importes sin detalle) o solo el detalle por RUT?
11. En el 2183, ¿el contribuyente informado puede tener cédula o NIE en lugar de RUT?

## D. Formulario 1050 (IRAE, Patrimonio e ICOSA, anual)

12. **Alcance.** ¿Querés el 1050 completo, o solo los anticipos? Los anticipos (líneas 901 a 906, 308, 343 y 365) salen de sumar los 1376 del año.
13. **De dónde salen los datos.** ¿De un TXT con todo el ejercicio, de los 12 TXT mensuales que ya se subieron o del balance?
14. **Cierre del ejercicio.** ¿Cada empresa tiene su propio mes de cierre? ¿Lo cargamos en la configuración de la empresa?
15. **Valores contables y fiscales.** El formulario pide las dos columnas. ¿Las dos salen del TXT, o los valores fiscales los ajustás vos a mano?
16. **Inmuebles.** ¿Tus clientes tienen inmuebles propios que haya que detallar en el 1050 (padrón, departamento, porcentaje)?
