# PADI — Formato de importación de datos (instructivo oficial DGI)

> **Fuente**: `sources/DGI-Importacion-PADI-2024-11-21.pdf` — "Programa de ayuda PADI · Importación de datos", Ministerio de Economía y Finanzas / DGI (rev. 2024-11-21).
> Provisto por el usuario/contador el 2026-09-03. Transcripción de referencia; ante duda, el PDF manda.

El PADI acepta ingreso de datos por importación de un archivo `.txt`. El layout depende de cada
formulario. Reglas comunes a todas las familias:

- Nombre de archivo: cualquiera es válido.
- Extensión: `.txt`.
- **Toda importación borra automáticamente todos los datos ingresados previamente** en ese formulario.
- El separador de campos es siempre `;` (punto y coma).

El instructivo cubre 8 familias. Para esta plataforma la relevante es la **§4 (2142/2181/2183/2185)**;
las demás se resumen al final por completitud.

---

## §4 — Formularios 2142, 2181, 2183 y 2185

Layout **posicional** con `;` en offsets fijos. Una línea por registro del Rubro 5.

| Posición | Tipo    | Campo           | Observación |
| -------- | ------- | --------------- | ----------- |
| 1–12     | Num 12  | RUT Informante  | Si tiene menos de 12 dígitos se completa con `0` a la izquierda |
| 13       | `;`     | separador       | |
| 14–18    | Num 5   | Formulario      | `02142` / `02181` / `02183` / `02185` |
| 19       | `;`     | separador       | |
| 20–25    | Num 6   | Período         | `AAAAMM` (ej. `200306`) |
| 26       | `;`     | separador       | |
| 27–38    | Num 12  | RUT Informado   | Ídem RUT Informante (relleno con `0` a la izquierda) |
| 39       | `;`     | separador       | |
| 40–45    | Num 6   | Factura         | `AAAAMM` (ej. `200305`) |
| 46       | `;`     | separador       | |
| 47–49    | Num 3   | Línea           | Línea del Rubro 5 del formulario |
| 50       | `;`     | separador       | |
| 51–62    | Num 12  | Importe         | Ej. `2750` ó `-2750` |
| 63       | `;`     | separador       | cierra la línea |

### Controles que aplica el PADI al importar

- **RUT Sujeto Pasivo / Formulario / Período**: deben coincidir con el cabezal de la declaración.
  El RUT del sujeto pasivo puede ser RUC, CI o NIE.
- **RUT Informado**:
  - En **2181** y **2183**: puede ser RUC, CI o NIE.
  - En **2142** y **2185**: únicamente RUC. El 2142 además acepta `0`.
- **Factura `AAAAMM`**: menor o igual al período declarado.
- **Línea**: debe existir dentro de la tabla de líneas de la aplicación.
- **Decimales**: si el archivo trae importes con decimales, **el PADI toma la parte entera**
  (trunca; no redondea).
- **2185**: no acepta cantidades negativas. El 2181 sí admite negativos.

### Notas para esta plataforma

- El exporter (`src/modules/exporter/generate-padi-file.ts`) genera esta línea de 63 posiciones para
  el 2181. Ver `../../SRS/10-exporter.md` y `../2181/`.
- La app **redondea** el importe antes de escribir el archivo (regla contador confirmada 2026-07-19,
  ver `../2181/formulas.md`: mitad-hacia-abajo contra 0,50) — decisión propia, distinta del truncado
  que haría el PADI si recibiera decimales. El archivo exportado nunca lleva decimales.
- Relacionado: `BUG-TD-27` (padi export importe rounds up on every non-zero decimal).

---

## Otras familias (resumen)

- **§1 — Formulario 1474 (IMESI)**: 3 tipos de línea (Bebidas, Cigarrillos, Automotores), campos
  separados por `;`. Última columna "Parte del mes" (`A` = antes / `D` = después de un cambio de
  valores predefinidos durante el mes; `A` si no hubo cambios o no se tiene el dato).
- **§2 — Formulario 3011** (soportes lógicos / I+D): 2 tipos de línea (Panel 1 y Anexo Panel 2),
  separados por `;`. Tabla "Tipo de documento": `1` NIE, `2` RUC, `3` CI, `5` Pasaporte, `6` DNI,
  `8` NIFE. Códigos de país: ISO 3166-1 alfa-2.
- **§3 — Formulario 1050** (IRAE / Imp. Patrimonio / ICOSA): archivo `.txt`, separador `;`
  (el PDF corta la tabla de campos).
- **§5 — Formularios 1144 y 1146**: layout posicional con `;` (75 posiciones). Tipo y país de
  Responsable Sustituto e Informado; documentos con relleno de `0` a la izquierda a 12 dígitos.
  Controles análogos a §4 (cabezal, `AAAAMM` ≤ período, línea válida, decimales → parte entera).
  1146: informado RUC/CI/NIE. 1144: informado CI/NIE/Pasaporte/DNI, con reglas de país por tipo de
  documento (DNI ⇒ AR/BR/PY/CL; Pasaporte ⇒ cualquier país excepto UY).
