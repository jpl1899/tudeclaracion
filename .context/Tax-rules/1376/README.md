# Tax Rules — Formulario 1376 (MVP 2 Track A)

Documentación del **conocimiento tributario de dominio** para la DJ 1376 (DGI Uruguay): qué declara cada panel/rubro, qué código de línea corresponde a cada concepto, cómo se totaliza, y cómo se llega desde una cuenta contable a un código de línea. Es contenido de negocio, no de arquitectura de software.

> Distinto de `.context/SRS/` — SRS documenta los **módulos técnicos** (`13-forms-1376.md` = el módulo/motor del 1376); esta carpeta documenta las **reglas tributarias** que ese módulo ejecuta. Misma separación que `tax-rules/2181/` ↔ `SRS/08-tax-engine.md` + `SRS/09-forms.md`.

## Contexto

Sembrado 2026-08-27 en la pasada incremental de `/project-foundation` para MVP 2 Track A. Fuentes: 2 páginas DGI sobre el 1376, `DJ 1376.xlsx` (marco teórico + diseño del motor, del usuario), y un archivo PADI de ejemplo real (`CODIGO;MONTO`).

**La mayor parte del contenido es `[PLACEHOLDER]`.** El catálogo detallado de líneas de DGI está publicado en imágenes, no capturado. El usuario dejó constancia de que la contadora aportará ejemplos reales de TXT ya procesados en PADI para fijar el catálogo y los resultados esperados. **No fabricar líneas, códigos ni fórmulas.**

## Contenido

| Archivo | Qué documenta | Estado |
|---------|---------------|--------|
| `codigos.md` | Catálogo de códigos de línea del 1376 y su significado fiscal | Solo el ejemplo de diseño del usuario, sin validar contra DGI |
| `panels.md` | Estructura paneles → rubros → líneas del formulario, según DGI | Esqueleto (paneles y rubros); líneas en imágenes DGI, `[PLACEHOLDER]` |
| `mapping.md` | Matriz cuenta contable + Debe/Haber → código de línea 1376 (regla de negocio central del motor 1376) | Estructura definida; contenido `[PLACEHOLDER]` |
| `formulas.md` | Cómo se computa el monto de cada código de línea (agregación de saldos, qué columna de importe) | `[PLACEHOLDER]` |
| `open-questions.md` | Preguntas abiertas específicas del 1376 para el usuario / la contadora | Activo |

Ver también `../common/` para reglas transversales (IVA, RUT, fechas) — a confirmar cuáles del `common/` aplican al 1376.

## Diferencia con el 2181 (define todo lo de esta carpeta)

| | 2181 | 1376 |
|---|---|---|
| Unidad | por RUT | por cuenta contable (sin RUT) |
| Naturaleza | informativa | liquidación (obligaciones del mes) |
| Motor | resolución por línea + consolidación por RUT+código | agregación de saldos por cuenta → totales por código de línea |
| Salida | `RUT_decl;02181;periodo;RUT_terc;periodo;codigo;importe;` | `codigo;monto` (solo totales) |
