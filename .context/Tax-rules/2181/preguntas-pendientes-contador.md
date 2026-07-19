# Preguntas pendientes para el contador (2026-07-17)

> Compiladas para destrabar TD-16, TD-17, TD-18 y TD-25. Respondidas el 2026-07-17 — propagadas a `SRS/07-validator.md`, `SRS/05-parser.md`, `Tax-rules/2181/validations.md`, `Tax-rules/2181/formulas.md`, `SRS/10-exporter.md`. 2 quedan con seguimiento abierto (marcadas abajo).

## TD-16 — Validación de RUT

1. ¿Se valida el dígito verificador uruguayo del RUT? — **No.** Solo formato/longitud (12 dígitos numéricos).

## TD-17 — Validación de importes

2. ¿Existe un importe mínimo DGI? — **No.** No hay piso mínimo para el 2181.
3. ¿Un importe igual a cero es válido? — **No.**
4. ¿Un importe negativo es válido? — **No, jamás.**
5. ¿El período de cada asiento debe coincidir con el período de la declaración? — **En general sí, en rurales no.** ⚠️ **Seguimiento abierto**: qué significa "rurales" en este contexto (¿régimen tributario del contribuyente? ¿tipo de actividad?) y por qué el período no coincide en ese caso — no se fabrica la excepción, queda pendiente de una próxima sesión.
6. ¿Hay casillas condicionadas al tipo de contribuyente/tercero? — **No.**
7. ¿Se valida consistencia cruzada contra otro total declarado? — **No.**

## TD-18 — Guía de error / mecánica de bloqueo

8. ¿Un asiento sin regla de mapeo bloquea todo el archivo? — **No, pero el contador tiene dudas** — la respuesta tentativa es "excluye solo esa línea", pero no está confirmada con la misma certeza que el resto. No tratar como definitiva sin retomarla.

## Exportador — redondeo de importes

9. ¿El importe lleva decimales implícitos? — **No.** Monto entero en pesos — confirma el supuesto ya codificado en `generarArchivoPadi`.
10. ¿Cómo se redondea? — **Corregido 2026-07-19** (la respuesta original del 2026-07-17, "siempre hacia arriba" / `Math.ceil`, era incorrecta — encontrado en vivo durante testing de TD-26). Regla real: los importes vienen con 2 decimales; se comparan esos 2 decimales completos contra 0,50 — ≤0,50 redondea para abajo, ≥0,51 para arriba. Confirmado con los límites exactos: 180,50 → 180, 180,51 → 181. Código en `redondearImporte` (`generate-padi-file.ts`).

## TD-25 — Catálogo completo PADI (552/553)

11. ¿Los códigos 552/553 aplican a los clientes iniciales? — Respuesta inicial ("ni") no interpretable; **reconfirmado 2026-07-17: No aplican.** Los clientes iniciales no hacen venta por cuenta y orden de terceros. **TD-25 cerrada como no aplicable al MVP.**

## Parser (TD-13)

12. ¿El TXT viene en UTF-8? — **Sí** (corregido en un mensaje de seguimiento). Verificado además de forma independiente: los dos archivos reales de muestra en `Downloads/` (`ASIENTOS JUNIO 2026.TXT`, `Anexo2181 - 212583570018.txt`) son ASCII puro — subconjunto válido de UTF-8, sin conflicto.
13. ¿El volumen esperado está debajo de 1000 líneas? — **No** — el volumen puede superar 1000 líneas mensuales. Guardado como nota de performance para el parser, no bloquea nada hoy.
