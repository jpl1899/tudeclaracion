# Preguntas pendientes para el contador (2026-07-17)

> Compiladas para destrabar TD-16, TD-17, TD-18 y TD-25 — las 4 únicas historias del MVP que no se pueden avanzar sin esta sesión. Formato sí/no donde es posible; cuando la respuesta es "sí", se deja el dato puntual a completar al lado.

## TD-16 — Validación de RUT

1. ¿Se valida el dígito verificador uruguayo del RUT, además del formato (12 dígitos numéricos)? **Sí / No**

## TD-17 — Validación de importes (`SRS/07-validator.md`, `Tax-rules/2181/validations.md`)

2. ¿Existe un importe mínimo DGI por debajo del cual una línea no se declara en el 2181? **Sí / No** — si Sí: monto mínimo = ____
3. ¿Un importe igual a cero es válido para declarar? **Sí / No**
4. ¿Un importe negativo es válido para alguna casilla? **Sí / No**
5. ¿El período de cada asiento debe coincidir exactamente con el período de la declaración que se está presentando? **Sí / No**
6. ¿Hay casillas que solo aplican bajo ciertas condiciones del contribuyente o del tercero (ej. tipo de contribuyente, régimen de IVA)? **Sí / No** — si Sí: ¿cuáles y qué condición? ____
7. ¿Debe validarse que la suma de las líneas coincida con algún total declarado en otro lado (ej. libro de compras/IVA)? **Sí / No**

## TD-18 — Guía de error / mecánica de bloqueo

8. Ante un asiento cuyo código IVA o cuenta contable no está configurado en el plan de cuentas (sin regla de mapeo conocida), ¿el sistema debe bloquear TODO el archivo — igual que ya hace el Parser (TD-13) ante un dato inválido? **Sí / No** — si No: ¿excluye solo esa línea con un reporte de error?

## Exportador — redondeo de importes (afecta TD-20, ya construido asumiendo lo de abajo)

9. ¿El campo de importe del archivo PADI lleva decimales implícitos (ej. `"2322"` = $23,22)? **Sí / No** — si No: confirma que siempre es un monto entero en pesos (supuesto actual del código).
10. Si hay que redondear el importe antes de exportarlo, ¿el redondeo es siempre hacia el entero más cercano (nunca trunca)? **Sí / No**

## TD-25 — Catálogo completo PADI (552/553)

11. ¿Los códigos PADI 552 y 553 (venta por cuenta ajena) aplican a los clientes iniciales del estudio? **Sí / No**

## Parser (TD-13) — no bloquea, mejora robustez

12. ¿El TXT que exporta Memory siempre viene en UTF-8? **Sí / No**
13. ¿El volumen mensual esperado de líneas por archivo está, en general, por debajo de 1000? **Sí / No** (solo relevante para performance del parser)

---

_Fuente de cada pregunta: `SRS/07-validator.md` §"Validaciones pendientes de confirmar", `SRS/05-parser.md` §"Qué falta confirmar", `Tax-rules/2181/validations.md`, `Tax-rules/2181/formulas.md`, `SRS/10-exporter.md`, `STORY-TD-25/comments.md`. Actualizar los SRS/Tax-rules correspondientes apenas se registren las respuestas — no dejarlas solo acá._
