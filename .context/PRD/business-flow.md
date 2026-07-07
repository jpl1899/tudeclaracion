# Business Flow — tuDeclaracion.com

> Flujo desde la perspectiva del **usuario/producto** (qué hace y qué ve el contador). Distinto del pipeline técnico de módulos en `.context/SRS/01-system-overview.md` (Upload Manager → Parser → Normalizer → Validator → Tax Rules Engine → Form Builder → Exporter) — ambos deben mantenerse consistentes; si uno cambia, revisar el otro.

## Flujo principal (happy path, nivel producto)

1. **Autenticación**: el contador inicia sesión en su cuenta.
2. **Selección de empresa**: el contador selecciona la empresa/cliente para la que va a generar la declaración (una cuenta puede tener varias empresas — multi-tenant, confirmado).
3. **Carga del archivo**: el contador sube el TXT mensual exportado de Memory correspondiente al período.
4. **Procesamiento** (transparente para el usuario): el sistema interpreta el archivo, normaliza las cuentas contables a conceptos fiscales, valida los datos, y aplica las reglas tributarias del formulario correspondiente (2181 en el MVP).
5. **Resultado**:
   - Si todo es válido → el sistema genera el archivo de salida compatible con PADI y lo pone disponible para descarga.
   - Si hay un error → el sistema lo muestra junto con una guía clara de cómo resolverlo (confirmado como requisito de MVP, no un error genérico).
6. **Descarga**: el contador descarga el archivo y lo importa directamente en PADI.

**Objetivo de tiempo total** (paso 3 a paso 6): menos de 5 minutos (Hipótesis de tiempo, `business-model.md`).

## Qué NO hace el usuario en el MVP

- No configura el plan de cuentas de una empresa desde una UI de autoservicio (fuera de scope MVP, ver `mvp-scope.md` y `future-roadmap.md`) — el mecanismo de carga inicial está pendiente de definir.
- No corrige errores de forma asistida/automática (el sistema avisa y guía, pero no autocorrige).
- No gestiona formularios DGI distintos al 2181 (aunque la arquitectura ya está preparada para soportarlo a futuro, `ADR-0001`).

## Pendiente

- Paso exacto de alta de una empresa nueva bajo una cuenta (¿wizard, formulario, carga asistida por el equipo?).
- Cómo se comunica al usuario el resultado de la validación cuando hay múltiples errores en el mismo archivo (¿lista completa, uno por vez?) — ver `user-journeys.md`.
