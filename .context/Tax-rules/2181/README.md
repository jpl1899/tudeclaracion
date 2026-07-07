# Tax Rules — Formulario 2181

Documentación del **conocimiento tributario de dominio** para la DJ 2181 (DGI Uruguay): qué es cada casilla, cómo se calcula, qué la valida, y cómo se llega a ella desde un concepto fiscal. Es contenido de negocio, no de arquitectura de software.

> Distinto de `.context/SRS/` — SRS documenta los **módulos técnicos** (parser, tax engine, exporter, etc.); esta carpeta documenta las **reglas tributarias** que esos módulos ejecutan. `SRS/08-tax-engine.md` y `SRS/09-forms.md` referencian este contenido en vez de duplicarlo.

## Contenido

| Archivo | Qué documenta | Estado |
|---------|---------------|--------|
| `casillas.md` | Catálogo de casillas/códigos PADI del 2181 y su significado fiscal | Parcial (códigos conocidos, sin descripción aún) |
| `formulas.md` | Cómo se calcula el importe de cada casilla | Pendiente |
| `validations.md` | Reglas de validación tributarias (mínimos DGI, condiciones de aplicación) | Pendiente |
| `mapping.md` | Mapeo concepto fiscal → casilla (la regla de negocio central del tax engine) | Pendiente |

Ver también `../common/` para reglas transversales (IVA, RUT, fechas) que no son específicas del 2181 y aplicarán a futuros formularios.
