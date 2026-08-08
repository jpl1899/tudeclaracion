# ADR-0005 — Configuración manual de layout de campos para variantes del TXT de asientos (2181)

- **Status:** Accepted
- **Date:** 2026-08-07
- **Deciders:** Juan Leites, validado con el contador
- **Tags:** parser, tax-engine, cross-cutting-invariant, data-ingestion
- **Supersedes:** —
- **Superseded by:** —

---

## Context

El parser (`src/modules/parser/parse-asientos.ts`) asume hoy una línea de 12 campos fijos, con una única variante tolerada: un 13er campo sin uso agregado siempre *después* de Tipo (fix del 2026-08-04, caso proveedor FMSSRL). Esa solución fue ad-hoc — resuelve un solo caso real observado, no el problema general.

El contador y el usuario analizaron en conjunto el archivo `DJ 2181.xlsx`, que documenta el ítem pendiente "Resolver títulos hoja 3": distintos proveedores contables exportan el TXT con hasta 9 columnas adicionales conocidas (C.Costos, Comprobante, Número, Emisión, Vencimiento, Número Documento, Serie Documento, Serie, Número Asiento), en cualquier combinación, intercaladas en posiciones fijas del orden canónico junto con los 12 campos obligatorios (Día, Debe, Haber, Concepto, RUT, Moneda, Total, Código IVA, IVA, Cotización, Libro, Tipo). El TXT casi nunca trae fila de encabezado, y varios de esos campos comparten tipo de dato y cantidad de dígitos entre sí — por lo tanto **no hay forma de inferir, mirando solo los valores de una línea, cuáles columnas adicionales están presentes ni en qué posición**.

La pestaña "3 - Títulos de los campos" del Excel se estableció como única fuente de verdad para esta regla (se descartaron las pestañas 1/2, bitácora histórica de pruebas, cuando contradicen la 3).

## Decision

Vamos a resolver la ambigüedad con **configuración manual explícita, por archivo, hecha por el usuario antes de subirlo** — no con detección automática ni con fila de encabezado en el TXT.

- Si el archivo tiene exactamente 11 o 12 campos por línea (modelo clásico), se procesa igual que hoy, sin ninguna configuración adicional.
- Si la cantidad de campos no calza con el modelo clásico, la subida queda **bloqueada** hasta que el usuario complete una pantalla de configuración: checklist de los 21 campos posibles (12 verdes/obligatorios siempre habilitados, 9 rojos/especiales deshabilitados por defecto). El usuario habilita solo los especiales que su archivo puntual trae.
- La posición de cada campo (verde o rojo) se deriva matemáticamente de dos datos ya conocidos: cuáles están habilitados + el orden canónico fijo que define la pestaña 3 ("modelo con todas las columnas posibles"). Nunca se infiere por el contenido/forma del valor.
- La configuración aplica al **archivo completo**, no a líneas individuales. El ancho de línea (cantidad de campos separados por coma) es fijo para todas las líneas del archivo: 12 + la cantidad de rojos habilitados — nunca 21 fijo, nunca variable línea a línea.
- Si una línea puntual no tiene dato aplicable en un campo especial habilitado, esa posición viene vacía (celda vacía, no campo ausente) — esto es lo que permite que dos líneas del mismo archivo "se vean" distintas en contenido sin requerir esquemas distintos.
- Un campo que no está en ninguna de las dos listas (ni verde ni rojo) se reporta al usuario como campo desconocido.
- **Invariante**: la cantidad de campos de cada línea de un archivo debe ser exactamente igual a la declarada por su configuración. Una línea con una cantidad distinta es un campo estructuralmente inválido (mismo tratamiento que hoy: aborta el archivo completo, ver `SRS/05-parser.md` §"Manejo de líneas inválidas").

**Explícitamente fuera de este alcance, para siempre** (decisión del usuario, no reabrir sin evidencia real nueva): tope de longitud en Debe/Haber, tope de importe en Total/IVA, tabla de monedas configurable, ampliación del rango de Tipo. Código IVA no cambia — `0` sigue siendo el sentinel que dispara la resolución por cuenta contable ("Camino 2"); la pestaña 3 describe el código solo cuando ya viene asignado explícitamente (1-9).

## Consequences

- **Positive:** Generaliza y reemplaza el fix ad-hoc del 04/08 (FMSSRL) — cualquier combinación futura de las 9 columnas conocidas se resuelve con la misma mecánica, sin parches puntuales por proveedor. El bloqueo de subida sin configuración evita procesar un archivo a ciegas con un layout mal asumido.
- **Negative / trade-offs:** Requiere una pantalla nueva (configuración pre-subida) y probablemente una tabla nueva en Supabase para persistir la configuración por archivo/empresa — no es un cambio aislado al parser. Depende de que el contador (usuario final) sepa identificar correctamente qué columnas trae su propio archivo; si se equivoca, el motor procesa mal sin poder detectarlo — se decidió explícitamente que esto queda fuera del alcance de la app (ver alternativas).
- **Neutral / follow-ups:** Validado por el contador (2026-08-07, sobre el resumen en PDF enviado). La implementación concreta (esquema de la tabla de configuración, componente de UI) es un detalle de historia, no de este ADR.

## Alternatives considered

- **Detección automática por cantidad de campos** — contar comas por línea y asumir una combinación de columnas rojas conocida. Rechazada: con 9 campos rojos posibles hay muchas más combinaciones que valores distintos de "cantidad total de campos", así que distintas combinaciones pueden coincidir en el mismo conteo — ambiguo por diseño, no por falta de datos.
- **Exigir fila de encabezado en el TXT** — resolvería la ambigüedad de forma estándar (como cualquier CSV con headers), pero depende de que el software contable del proveedor genere esa fila con los nombres exactos que nuestro dominio espera — algo que no controlamos y que la mayoría de los proveedores reales analizados no hace.
- **Configuración por línea individual** — se consideró en profundidad (ver `mem_save` "Diseño: campos especiales en TXT del motor DJ 2181"), motivada por la posibilidad de que dos líneas de un mismo asiento tuvieran distinta estructura. Rechazada: no hay evidencia real de que esto ocurra (los dos casos reales analizados, FMSSRL y Cambio Fénix, agregan un campo extra consistente en todo el archivo), y no escala — el propio usuario confirmó que configurar más de ~20 líneas a mano ya es incómodo, contra archivos reales que superan 1000 líneas mensuales.
- **Marcador explícito de cambio de formato dentro del TXT** (fila separadora u otra convención) — requeriría cooperación del proveedor contable para generar algo que hoy no genera. Descartada por la misma razón que la fila de encabezado.

## References

- `.context/SRS/05-parser.md` §"Confirmado 2026-08-04 — variante de 13 campos (proveedor FMSSRL)" (fix ad-hoc que este ADR generaliza y reemplaza)
- `DJ 2181.xlsx` (aportado por el usuario/contador), pestaña "3 - Títulos de los campos"
- Memoria de sesión (Engram): "Diseño: campos especiales en TXT del motor DJ 2181" — `architecture/2181-parser-campos-especiales`
