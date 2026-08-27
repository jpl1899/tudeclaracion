# Códigos de línea — Formulario 1376

> Estado: **NO confirmado contra DGI.** Los códigos de abajo salen del ejemplo de diseño del usuario en `DJ 1376.xlsx` + el archivo PADI de ejemplo. DGI publica el catálogo real por rubro en imágenes que no fueron capturadas. No fabricar códigos ni descripciones faltantes.

## Del ejemplo de diseño del usuario (`DJ 1376.xlsx` + archivo PADI de ejemplo)

| Código | Concepto (según el Excel del usuario) | Grupo contable de ejemplo | Monto en el archivo de ejemplo |
|---|---|---|---|
| 101 | Ventas e ingresos gravados a tasa básica (22%) | Ventas Plaza 22% | 1500000 |
| 102 | Ventas e ingresos gravados a tasa mínima (10%) | Ventas Plaza 10% | — |
| 103 | Ventas y rentas no gravadas / exentas | Ventas Exentas | — |
| 201 | Costo de ventas de bienes y servicios gravados | Costo de Ventas | 900000 |
| 301 | Gastos de personal / sueldos y leyes sociales | Sueldos y Cargas | 250000 |
| 302 | Arrendamientos pagados | Alquileres / Arriendos | 80000 |
| 501 | Crédito fiscal IVA compras | IVA Compras (Crédito) | 17600 |
| 502 | Débito fiscal IVA ventas | IVA Ventas (Débito) | 330000 |
| 510 | Anticipos de IRAE realizados en el ejercicio | Anticipos IRAE | 45000 |
| 601 | Disponibilidades (Activo) | Caja y Bancos | 1437400 |

## Líneas DGI conocidas sueltas (de las páginas DGI)

| Línea | Concepto |
|---|---|
| 30 | Tipo de anticipo IPAT ("DJ común", "Art. 31 Cód. Trib.", etc.) |
| 38 | Monto anticipo IPAT |
| 55 | Tipo de Sobretasa IPAT |
| 56 | Monto Sobretasa IPAT |
| 52 | Monto anticipo ICOSA |
| 53 | Tipo de anticipo ICOSA |
| 33 | IRAE Agropecuario |
| 36 | IPAT Agropecuario |
| 54 | Sobretasa IPAT Agropecuario |
| 322 | Saldo a pagar (resultado de la liquidación) |
| 970 | ¿El saldo se abona total/parcial con certificados de crédito aún no disponibles? (Si/No) |
| 971 | ¿Originados en proyectos de inversión? (Si/No) |
| 972 | ¿Con otros orígenes? (Si/No) |

## Códigos de impuesto / pago DGI (no son códigos de línea)

| Componente | Código(s) |
|---|---|
| IVA mensual | 545 |
| Anticipo IRAE | 108 (o 126 / 128 según contribuyente/sector) |
| Anticipo IPAT | 328 (o 320 / 323) |
| Anticipo Sobretasa IPAT | 335 (o 330 / 333) |
| Anticipo ICOSA | 606 |
| IRPF retiro de utilidades | 143 |

## Pendiente

- Catálogo completo y **real** de códigos de línea por rubro/panel (hoy solo el ejemplo de diseño).
- Validar que los códigos del ejemplo (101/201/301/302/501/502/510/601) sean los números de línea reales que espera PADI.
- Descripción fiscal precisa de cada línea.
- Regla de selección de código "según tipo de contribuyente/sector" (IRAE 108/126/128, IPAT 328/320/323, Sobretasa 335/330/333).
- Si existen líneas mutuamente excluyentes o dependientes.
