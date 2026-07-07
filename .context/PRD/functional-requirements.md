# Functional Requirements — tuDeclaracion.com

> Requisitos atómicos y testeables (`FR-XX`), derivados de las épicas en `mvp-scope.md`. Relación: `mvp-scope.md` define QUÉ se construye y con qué prioridad (épicas/historias); este documento define el comportamiento esperado con el detalle necesario para escribir criterios de aceptación. Evitar duplicar contenido — si cambia una épica, revisar los FR asociados.

## Autenticación y cuenta (EPIC-TD-01)

- **FR-01**: El sistema debe permitir a un contador crear una cuenta y autenticarse para acceder a la plataforma. *(mecanismo exacto de autenticación: pendiente, ver `SRS/12-security.md`)*
- **FR-02**: Una cuenta de contador debe poder gestionar **múltiples empresas/clientes** (multi-tenant, confirmado en el MVP).
- **FR-03**: Los datos de una empresa/cliente deben estar completamente aislados de los de otras empresas dentro de la misma cuenta.

## Empresa y plan de cuentas (EPIC-TD-02)

- **FR-04**: El sistema debe permitir asociar un plan de cuentas configurable a cada empresa. *(sin UI de autoconfiguración en el MVP — mecanismo de carga inicial pendiente, ver `SRS/06-normalizer.md`)*
- **FR-05**: El contador debe poder seleccionar la empresa activa antes de cargar un archivo, para asegurar que el procesamiento use el RUT y plan de cuentas correctos.

## Carga y parsing (EPIC-TD-03)

- **FR-06**: El sistema debe permitir cargar un archivo TXT exportado del software contable Memory.
- **FR-07**: El sistema debe interpretar el TXT cargado y transformarlo en un modelo de datos interno, **sin aplicar reglas tributarias en este paso** (invariante del Parser, `ADR-0001`).
- **FR-08**: El sistema debe confirmar al usuario que el archivo se cargó correctamente antes de continuar el procesamiento.

## Normalización (EPIC-TD-04)

- **FR-09**: El sistema debe mapear cada cuenta contable del archivo a un concepto fiscal, usando el plan de cuentas de la empresa activa (FR-04).

## Validación (EPIC-TD-04)

- **FR-10**: El sistema debe validar que los RUTs (declarante y terceros) tengan 12 dígitos. *(validación de dígito verificador: pendiente, ver `tax-rules/common/rut.md`)*
- **FR-11**: El sistema debe validar los importes y demás reglas estructurales antes de aplicar el motor tributario. *(reglas exactas — mínimos DGI, rangos de importe — pendientes, ver `SRS/07-validator.md`)*
- **FR-12**: Ante cualquier error de validación, el sistema debe mostrar un mensaje que identifique el dato/línea problemático **junto con una guía clara de cómo resolverlo** — nunca un error genérico sin indicación de próximos pasos. *(confirmado como requisito de MVP, no diferible)*

## Motor de reglas tributarias (EPIC-TD-05)

- **FR-13**: El sistema debe aplicar reglas tributarias **configurables** (almacenadas en base de datos, no hardcodeadas) para determinar la línea/código PADI correspondiente a cada concepto fiscal. *(contenido de las reglas: pendiente, ver `tax-rules/2181/mapping.md`)*
- **FR-14**: El sistema debe calcular el importe correspondiente a cada línea (IVA o total de compra exenta, según el código). *(fórmulas exactas: pendiente, ver `tax-rules/2181/formulas.md`)*

## Exportación (EPIC-TD-06)

- **FR-15**: El sistema debe generar un archivo TXT de salida compatible con el formato PADI, con la estructura de 7 campos confirmada en `SRS/10-exporter.md`.
- **FR-16**: El contador debe poder descargar el archivo generado una vez completado el procesamiento sin errores.

## Historial y gestión de declaraciones (EPIC-TD-07)

- **FR-17**: El sistema debe listar las declaraciones generadas por cliente/período, para la empresa activa.
- **FR-18**: El sistema debe mostrar el estado de cada declaración (validado / pendiente / generado).

## Pendiente

- Requisitos funcionales de la persona secundaria ("usuario sin contador") — no definidos, ver `user-personas.md`.
- Requisitos funcionales del alta de empresa nueva y su plan de cuentas inicial (Journey 3, `user-journeys.md`).
- Comportamiento exacto ante múltiples errores en un mismo archivo (¿todos juntos, o de a uno?).
