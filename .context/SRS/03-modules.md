# 03 — Modules

Desglose de módulos del pipeline (`ADR-0001-modular-reusable-tax-platform.md`). Responsabilidad única por módulo — diseño pensado para agregar formularios futuros sin rediseñar los módulos genéricos (Upload Manager, Parser, Normalizer, Validator, Exporter).

| # | Módulo | Archivo | Responsabilidad | Genérico o específico del 2181 | Estado |
|---|--------|---------|------------------|-----------------------------|--------|
| 1 | Upload Manager | *(sin archivo propio aún)* | Recibe el archivo exportado de Memory | Genérico | Pendiente |
| 2 | Parser | `05-parser.md` | Interpreta el TXT exportado de Memory → modelo interno, sin decisiones tributarias | Genérico | Pendiente (falta formato de entrada) |
| 3 | Normalizer | `06-normalizer.md` | Mapea cuenta contable → concepto fiscal, según configuración por empresa | Genérico | Pendiente |
| 4 | Validator | `07-validator.md` | Valida RUTs, mínimos DGI, importes (corre ANTES del Tax Rules Engine) | Genérico | Parcial (formato RUT confirmado) |
| 5 | Tax Rules Engine | `08-tax-engine.md` | Aplica reglas tributarias: concepto fiscal → línea/código PADI (reglas en `.context/tax-rules/`) | Reglas específicas por formulario, motor genérico | Pendiente (reglas no definidas aún) |
| 6 | Forms / Form Builder (2181) | `09-forms.md` | Arma la declaración por formulario; catálogo de líneas/códigos del 2181 | Específico del 2181 | Parcial (códigos conocidos, lista incompleta) |
| 6b | Motor / Form Builder (1376) | `13-forms-1376.md` | DJ 1376: agregación de saldos por cuenta → matching cuenta→código de línea → totales por código (sin RUT). Reusa el Parser, no el resto del pipeline del 2181 | Específico del 1376 (MVP 2 Track A) | Estructura sembrada, contenido tributario `[PLACEHOLDER]` — ver `ADR-0006` |
| 7 | Exporter | `10-exporter.md` | Genera el TXT de salida compatible con PADI (2181). El 1376 tiene su propio formato de salida `CODIGO;MONTO`, documentado en `13-forms-1376.md` | Genérico (2181) / variante propia (1376) | **Confirmado** (2181) · Confirmado formato (1376) |
| 8 | API | `11-api.md` | Contrato de API expuesto al frontend | Genérico | Pendiente |
| 9 | Security | `12-security.md` | Requisitos de seguridad (datos tributarios/RUT = sensibles) | Genérico | Pendiente |

## Dominio compartido

Ver `04-domain-model.md` para las entidades comunes que atraviesan todos los módulos (Declarante, Tercero, Período, Línea PADI, Importe, Declaración).

## Estructura de carpetas del código

Confirmada en `ADR-0001` — aplicación bajo `src/`: `app/`, `components/`, `modules/{parser,normalizer,validator,tax-engine,forms,exporter}`, `domain/`, `infrastructure/`, `services/`, `shared/`. Detalle en `02-system-architecture.md`.
