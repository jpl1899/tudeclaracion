# Formulario 1050 — line catalog and import format

> Source: official PADI form installer `Instalacion_Formulario_1050_Version_02R12.exe` (DGI, form version **1050v02**), downloaded 2026-10-26 from <https://www.gub.uy/direccion-general-impositiva/politicas-y-gestion/aplicacion-padi-version-30>. Line numbers and labels were read from the form's `f1050v02cargolineadesc` class; the import format from the bundled `f1050v02_ayuda_importacion.pdf`. **Not validated with the accountant.** Lines already published by DGI (901, 903–906, 306, 308, 340, 343, 344, 365, 322, 970–972) match.

## Import file

Same shape as the 1376 file the app already generates: one row per line with data, `linea;importe`, integers without thousands or decimal separators.

```
8;100000
51;150000000
807;15000
91;2
```

Yes/no questions are lines too (e.g. `91;2`). Optionally, after the lines, one 8-row block per owned property (`TIPO`, `DEPARTAMENTO`, `LOCALIDAD`, `PADRON`, `BLOCK`, `ENTSUB`, `UNIDAD`, `PORCENTAJE`), e.g. `TIPO;1` (1 = urbano, 2 = rural), `PORCENTAJE;5.50`.

## Columns

Balance and income-statement panels have two columns, **Valores contables** and **Valores fiscales**; some result rows split each into **Debe / Haber**. So a row lists one line number per column:

- 2 numbers → contable, fiscal (inferred: `TOTAL DE ACTIVO` = 13, 21 and line 21 is "Activo fiscalmente valuado").
- 4 numbers → contable debe, contable haber, fiscal debe, fiscal haber (inferred from the column headers; to confirm).

Section headers have no line (—). Many totals and the whole liquidation are most likely computed by PADI (`f1050v02actualizocalculos`); which lines are input vs. computed is still to confirm.

## Balance — Activo corriente

| Description | Line(s) |
|---|---|
| ACTIVO | — |
| ACTIVO CORRIENTE | — |
| Efectivo y cuentas bancarias, de plaza | 8, 601 |
| Efectivo y cuentas bancarias en el exterior | 650, 602 |
| Cuentas comerciales por cobrar, de plaza | 51, 603 |
| Cuentas comerciales por cobrar, del exterior | 52, 604 |
| Otras cuentas por cobrar, de plaza | 53, 605 |
| Otras cuentas por cobrar, del exterior | 651, 606 |
| Ctas. Socios, directores y/o accionistas | 55, 607 |
| Créditos fiscales y Anticipos de Impuestos | 54, 608 |
| Inventarios | 57, 609 |
| Importaciones en trámite | 652, 610 |
| Inventario en el Exterior | 67, 647 |
| Otros activos de plaza | 58, 611 |
| Otros activos del exterior | 653, 612 |
| TOTAL Activo Corriente | 59, 613 |

## Balance — Activo no corriente

| Description | Line(s) |
|---|---|
| ACTIVO | — |
| ACTIVO NO CORRIENTE | — |
| Cuentas comerciales por cobrar, de plaza | 654, 614 |
| Cuentas comerciales por cobrar, del exterior | 655, 615 |
| Otras cuentas por cobrar, de plaza | 656, 616 |
| Otras cuentas por cobrar, del exterior | 657, 617 |
| Inventarios | 658, 618 |
| Inventario en el Exterior | 71, 648 |
| Propiedades, planta y equipo | 61, 619 |
| Amortización acumulada de propiedades, planta y equipo | 659, 620 |
| Propiedades, planta y equipo promovidos | 660, 621 |
| Amortización acumulada de propiedades, planta y equipo promovidos | 661, 622 |
| ¿Tiene inmuebles propios? | 60 |
| Activos intangibles | 62, 623 |
| Participaciones en otras empresas Residentes | 662, 624 |
| Participaciones en otras empresas No Residentes | 663, 625 |
| Otros activos de plaza | 63, 626 |
| Otros activos del exterior | 664, 627 |
| TOTAL Activo No Corriente | 64, 628 |
| TOTAL DE ACTIVO | 13, 21 |

## Balance — Pasivo corriente

| Description | Line(s) |
|---|---|
| PASIVO | — |
| PASIVO CORRIENTE | — |
| Cuentas comerciales por pagar, de plaza | 65, 629 |
| Acreedores por importaciones | 66, 630 |
| Acreedores del Exterior por servicios | 665, 631 |
| Anticipo de Clientes | 666, 632 |
| Deudas financieras contraídas con bancos y similares | 72, 633 |
| Otras deudas financieras | 73, 634 |
| Acreedores Fiscales | 69, 635 |
| Ctas. Socios, directores y/o accionistas | 70, 636 |
| Otras cuentas por pagar | 68, 637 |
| TOTAL Pasivo Corriente | 74, 638 |

## Balance — Pasivo no corriente y patrimonio contable

| Description | Line(s) |
|---|---|
| PASIVO | — |
| PASIVO NO CORRIENTE | — |
| Deudas financieras contraidas con bancos y similares | 75, 639 |
| Otras deudas financieras | 76, 640 |
| Ctas. Socios, directores y/o accionistas | 667, 641 |
| Otras cuentas por pagar | 77, 642 |
| TOTAL Pasivo No Corriente | 78, 643 |
| TOTAL PASIVO | 30, 38 |
| PATRIMONIO CONTABLE | 79, 80 |

## Impuesto al Patrimonio — Activo y pasivo fiscal

| Description | Line(s) |
|---|---|
| ACTIVO FISCALMENTE VALUADO | 21 |
| ACTIVOS EXENTOS, GRAVADOS A EFECTOS DEL COMPUTO DEL PASIVO | 46 |
| Bienes muebles del Equipo Industrial | 644 |
| Bienes comprendidos en Ley de Inversiones y Proyectos de Inversión | 645 |
| Otros activos exonerados, gravados a efectos del computo del pasivo | 646 |
| ACTIVOS EXENTOS | 24 |
| ACTIVOS EN EL EXTERIOR | 22 |
| ACTIVOS EN EL EXTERIOR, GRAVADOS A EFECTOS DEL COMPUTO DEL | — |
| PASIVO (inc.8 art.15 T14) | 45 |
| ACTIVO COMPUTABLE | 25 |
| PASIVO ADMITIDO | 38 |

## Impuesto al Patrimonio — Patrimonio fiscal

| Description | Line(s) |
|---|---|
| ACTIVOS EN EL EXTERIOR | 22 |
| ACTIVOS EXENTOS | 24 |
| PASIVO COMPUTABLE | 39 |
| PATRIMONIO FISCAL | 40, 41 |
| PATRIMONIO EXONERADO | 42, 47 |
| PATRIMONIO IMPUTABLE A SOCIOS | 43 |
| PATRIMONIO AGROPECUARIO EXONERADO | 44, 49 |
| *(no label in the form — internal id `IRAEAgro`)* | 50 |
| *(no label in the form — internal id `IRAEAgro`)* | 48 |

## Impuesto al Patrimonio — Agropecuario

| Description | Line(s) |
|---|---|
| ¿Impuesto al patrimonio agropecuario? | 98 |
| ¿Integrante de unidad económico administrativa?  (Art.38 y 53 T14) | 91 |
| ¿Entidad incluida en el art. 52 T14? | 92 |
| VALOR DE LOS ACTIVOS PARA DETERMINAR SI CORRES- | — |
| PONDE I.PAT.AGROPECUARIO Y SOBRETASA (ART.38 T14) | — |
| Valor de los inmuebles rurales propios | 93 |
| Valor de los bienes muebles y semovientes  de inmuebles rurales propios | 94 |
| Valor de los bienes muebles y semovientes  de inmuebles rurales NO propios | 95 |
| TOTAL | 96 |
| MONTO TOTAL DE LOS ACTIVOS EN UI | 97 |
| PATRIMONIO AGROPECUARIO PARA SOBRETASA | 230, 236 |
| PATRIMONIO EXONERADO | 231, 232 |

## Estado de resultados — Ingresos y costo de ventas

| Description | Line(s) |
|---|---|
| INGRESOS OPERATIVOS | — |
| Ingresos por actividades de Plaza | 160, 701 |
| Ingresos por actividades de exportación y asimiladas | 161, 702 |
| Otros ingresos operativos | 162, 703 |
| TOTAL Ingresos Operativos | 100, 704 |
| COSTO DE LOS BIENES VENDIDOS Y SERVICIOS PRESTADOS | — |
| Inventario inicial | 102, 705 |
| Compras materia prima, productos de reventa | 103, 706 |
| Remuneraciones | 195, 707 |
| Cargas sociales | 196, 708 |
| Servicios personales fuera de la rel. de dependencia | 750, 709 |
| Otros gastos de producción y/o costo de servicios | 751, 710 |
| Inventario Final | 106, 749 |
| TOTAL Costo de los bienes vendidos y servicios prestados | 177, 711 |
| UTILIDAD BRUTA | 753, 752, 713, 712 |

## Estado de resultados — Gastos de administración y ventas

| Description | Line(s) |
|---|---|
| GASTOS DE ADMINISTRACIÓN, DISTRIBUCIÓN Y VENTAS | — |
| Remuneraciones | 178, 714 |
| Cargas Sociales | 179, 715 |
| Servicios personales fuera de la relación de dependencia | 164, 716 |
| Publicidad y propaganda prestada por contribuyentes de IRAE | 165, 717 |
| Publicidad y propaganda prestada por no contribuyentes de IRAE | 754, 718 |
| Agua, energía y telecomunicaciones | 166, 719 |
| Transporte y locomoción | 167, 720 |
| Arrendamientos | 168, 721 |
| Gastos en el exterior | 171, 722 |
| Comisiones de exportación | 172, 723 |
| Deudores incobrables | 173, 724 |
| Otros gastos | 175, 725 |
| TOTAL Gastos de administración, distribución y ventas | 176, 726 |

## Estado de resultados — Otros ingresos y egresos

| Description | Line(s) |
|---|---|
| OTROS INGRESOS Y EGRESOS | — |
| Venta de Propiedades, planta y equipo | 180, 727 |
| Costo de Venta de propiedades, planta y equipo | 181, 728 |
| Venta Inmuebles Rurales (Ley 18.876) | 225 |
| Costo de Ventas Inmuebles Rurales (Ley 18.876) | 226 |
| Amortizaciones | 163, 729 |
| Donaciones | 755, 730 |
| Sanciones tributarias CT | 756, 731 |
| Impuestos DGI | 174, 732 |
| Otros ingresos | 182, 733 |
| Otros egresos | 183, 734 |
| TOTAL Otros ingresos y egresos | 185, 184, 736, 735 |

## Estado de resultados — Resultados financieros y rentas del exterior

| Description | Line(s) |
|---|---|
| RESULTADOS FINANCIEROS | — |
| Diferencia de cambio Ganada | 186, 737 |
| Diferencia de Cambio Perdida | 188, 738 |
| Intereses Ganados | 187, 739 |
| Intereses Perdidos | 189, 740 |
| RDM | 194, 193, 742, 741 |
| Otros ingresos financieros | 191, 743 |
| Otros egresos financieros | 192, 744 |
| TOTAL Resultados financieros | 109, 108, 746, 745 |
| RENTAS DEL EXTERIOR LEY 20.095 | — |
| Ingresos del num.6 art.7 T.4 | 132, 110, 771, 761 |
| Ingresos del num.7 art.7 T.4 (excepto marcas) | 133, 111, 772, 762 |
| Ingresos del exterior por Marcas | 134, 112, 773, 763 |
| TOTAL Rentas del exterior Ley 20.095 | 135, 113, 774, 764 |
| RESULTADO DEL EJERCICIO | 758, 757, 748, 747 |
| AJUSTES INTEGRALES A LA CONTABILIDAD | 760, 759 |
| RESULTADO INTEGRAL | 115, 114 |

## IRAE — Ajustes fiscales

| Description | Line(s) |
|---|---|
| ALTA | — |
| BAJA | — |
| OTROS AJUSTES | — |
| Ajuste por inflación | 130, 131 |
| Deducciones incrementadas | 780 |
| Intereses fictos | 218 |
| Precios de transferencia | 781 |
| RESULTADO FISCAL AJUSTADO | 139, 138 |
| Rentas exentas | 140 |
| Gastos correspondientes a rentas exentas | 141 |
| Rentas no comprendidas | 782 |
| Gastos correspondientes a rentas no comprendidas | 783 |
| Rentas del exterior no comprendidas num.6 art.7 T.4 | 775, 765 |
| Gastos asociados a Rentas del exterior no comprendidas num.6 art.7 T.4 | 766 |
| Rentas del exterior no comprendidas num.7 art.7 T.4 | 776, 767 |
| Gastos asociados a Rentas del exterior no comprendidas num.7 art.7 T.4 | 768 |
| Ajustes Ventas Inmuebles Rurales (Ley 18.876) | 227 |
| Ajustes de Ventas Inmuebles Rurales (Ley 18.876) | 228 |
| Renta Ficta Vta. Inm. Rurales (Ley 18.876) | 251 |
| Ingresos por aplicación Res. 51/97 | 784 |
| Precio de compra Res. 51/97 | 785 |

## IRAE — Resultado fiscal

| Description | Line(s) |
|---|---|
| ALTA | — |
| BAJA | — |
| RESULTADO FISCAL AJUSTADO | — |
| Otros gastos  Res. 51/97 | 786, 787 |
| Otras rentas con determinación ficta | 250 |
| Gastos correspondientes a  otras rentas fictas | 788 |
| Renta determinada en forma ficta | 789 |
| RESULTADO FISCAL NETO | 143, 142 |
| Línea 151 de formulario 1006 | 158 |
| SUBTOTAL | 150, 149 |
| Pérdidas fiscales de ejercicios anteriores | 144 |
| Utilidades diferidas | 148, 147 |
| Exoneración por inversiones | 154 |
| RESULTADO FISCAL | 156, 155 |

## IRAE — Total de ingresos

| Description | Line(s) |
|---|---|
| INGRESOS OPERATIVOS | — |
| Ingresos por actividades de Plaza | 160 |
| Ingresos por actividades de exportación y asimiladas | 161 |
| Otros ingresos operativos | 162 |
| TOTAL Ingresos Operativos | 100 |
| OTROS INGRESOS | — |
| Ingresos No Operativos | 198 |
| RENTAS DEL EXTERIOR LEY 20.095 | — |
| Ingresos del num.6 art.7 T.4 | 110 |
| Rentas del exterior no comprendidas num.6 art.7 T.4 | 765 |
| Ingresos del num.7 art.7 T.4 (excepto Marcas) | 111 |
| Rentas del exterior no comprendidas num.7 art.7 T.4 | 767 |
| Ingresos del exterior por Marcas | 112 |
| TOTAL Rentas del Exterior Ley 20.095 | 197 |
| TOTAL DE INGRESOS | 199 |

## IRAE — Renta bruta y neta (régimen de rentas)

| Description | Line(s) |
|---|---|
| DETERMINACIÓN DE RENTA BRUTA | — |
| INGRESOS | — |
| RENTA | — |
| Rentas combinación de Capital y Trabajo | — |
| Combinación de Capital y Trabajo - Gravadas | 263, 283 |
| Otros ingresos Regímenes Fictos y Especiales | 265, 285 |
| Exentas y No comprendidas | 272 |
| Rentas Puras de Trabajo | — |
| Puras de Trabajo - Gravadas | 264, 284 |
| Exentas y No comprendidas | 273 |
| Rentas Puras de Capital | — |
| Puras de Capital - Gravadas | 270, 271 |
| Exentas y No comprendidas | 274 |
| Venta de Inmuebles Rurales (Ley 18.876) | 294, 295 |
| TOTAL DE RENTA BRUTA | 290 |
| DETERMINACIÓN DE RENTA NETA | — |
| Sueldos Fictos de Dueño o socios | 291 |
| Otros Gastos Admitidos | 292 |
| Total de deducciones | 293 |
| RESULTADO FISCAL | 156, 155 |

## Liquidación — IRAE

| Description | Line(s) |
|---|---|
| Exoneración Decreto 455/007, 02/012 143/18 y proyectos de inversión | 346 |
| Exoneración Decreto 324/011 CFE | 348 |
| IRAE luego de exoneraciones | 347 |
| IRAE mínimo | 901 |
| IRAE (el mayor entre IRAE luego de exoneraciones e IRAE mínimo) | 902 |
| Anticipos de IRAE | 903 |
| Retenciones y percepciones no deducidas en form. 2176/2178/1376 | 904 |
| IMEBA pagos no deducidos en formularios 2176/2178/1376 | 905 |
| IMEBA retenciones no deducidos en formularios 2176/2178/1376 | 906 |
| Crédito fiscal por convenio de doble imposición | 907 |
| Crédito fiscal por beneficios específicos - IRAE | 915 |
| Créditos fiscales a imputar por impuestos pagados en el exterior Art.94 bis T.4 num.6 art.7 T.4 | 916 |
| Créditos fiscales a imputar por impuestos pagados en el exterior Art.94 bis T.4 num.7 art.7 T.4 | 917 |
| Créditos fiscales a imputar por impuestos pagados en el exterior - Marcas | 918 |
| Saldo de IRAE | 303 |
| Crédito de IRAE | 304 |

## Liquidación — ICOSA e Impuesto al Patrimonio

| Description | Line(s) |
|---|---|
| ICOSA | 340 |
| Anticipos de ICOSA | 343 |
| Saldo de ICOSA | 344 |
| Crédito de ICOSA | 345 |
| IMPUESTO AL PATRIMONIO | 330 |
| Impuesto al Patrimonio liquidado en otro cierre | 306 |
| Impuesto al Patrimonio o complemento | 307 |
| Abatimiento art. 7 Decreto 30/015 | 331 |
| Abatimiento art. 7 Decreto 30/015 Formulario 1006 | 380 |
| Impuesto al Patrimonio abatido | 305 |
| ICOSA | 341 |
| Impuesto al Patrimonio deducido ICOSA | 342 |
| Anticipos de Impuesto al Patrimonio | 308 |
| Crédito Fiscal por beneficios específicos | 914 |
| Crédito fiscal por convenio de doble imposición | 912 |
| Saldo de Impuesto al Patrimonio | 309 |
| Crédito de Impuesto al Patrimonio | 310 |

## Liquidación — Sobretasa del Patrimonio y totales

| Description | Line(s) |
|---|---|
| SOBRETASA DE IMPUESTO AL PATRIMONIO | 360 |
| Sobretasa de Imp. al Patrimonio liquidada en otro cierre del ejercicio | 361 |
| Sobretasa de impuesto al Patrimonio o complemento | 362 |
| Abatimiento art. 7 Decreto 30/015 | 363 |
| Abatimiento art. 7 Decreto 30/015 Formulario 1006 | 381 |
| Sobretasa de Impuesto al Patrimonio abatida | 364 |
| ICOSA | 368 |
| Sobretasa de Impuesto al Patrimonio deducido ICOSA | 369 |
| Anticipos de Sobretasa de Impuesto al Patrimonio | 365 |
| Saldo de Sobretasa de Impuesto al Patrimonio | 366 |
| Crédito de Sobretasa de Impuesto al Patrimonio | 367 |
| TOTAL DE DÉBITOS | 320 |
| TOTAL DE CRÉDITOS | 321 |
| TOTAL A PAGAR | 322 |
| TOTAL DE CRÉDITO A SOLICITAR | 323 |

## Información adicional y pagos a cuenta del ejercicio siguiente

| Description | Line(s) |
|---|---|
| SOLICITUD AUTOMÁTICA DE CERTIFICADOS DE CRÉDITO (Tipo A) | 325 |
| CRÉDITOS A SOLICITAR POR APLICATIVO DELTA | 326 |
| INFORMACIÓN ADICIONAL | — |
| ¿El saldo a pagar se abonará, total o parcialmente, con Certificados de | — |
| crédito aún no disponibles? | 970 |
| ¿Originados en proyectos de inversión? | 971 |
| ¿Con otros orígenes? | 972 |
| Total de Operaciones Cap. VIII PT - T4 TO 1996 | 356 |
| Retiro de utilidades de Entidades Unipersonales | 358 |
| Saldo actualizado de pérdidas acumuladas de ejercicios anteriores | 913 |
| PAGOS A CUENTA PARA EL EJERCICIO SIGUIENTE | — |
| Coeficiente de IRAE | 390 |
| IRAE mínimo | 908 |
| Impuesto al Patrimonio | 909 |
| ICOSA | 910 |
| Sobretasa de Impuesto al Patrimonio | 911 |
