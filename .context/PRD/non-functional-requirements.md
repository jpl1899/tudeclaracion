# Non-Functional Requirements — tuDeclaracion.com

> Derivados de las 3 hipótesis del MVP (`business-model.md`), los 3 pilares de diferenciación (facilidad de uso, rapidez, confiabilidad) y `ADR-0001`. Donde no hay un valor numérico confirmado, se deja explícito como pendiente — no se fabrican SLAs ni cifras.

## Performance

- **NFR-01**: El tiempo total del flujo (carga del TXT → archivo PADI descargable) debe ser **menor a 5 minutos** (Hipótesis de tiempo, `business-model.md`). Es la métrica de producto más crítica del MVP.
- **Pendiente**: volumen máximo de líneas por archivo TXT soportado sin degradar ese tiempo objetivo (no confirmado).

## Usability

- **NFR-02**: La interfaz debe ser utilizable por personas con **conocimientos informáticos básicos**, minimizando la cantidad de acciones necesarias (hecho explícito del brief).
- **NFR-03**: Debe funcionar para un público de **22 a 65 años** con niveles de alfabetización digital heterogéneos (hecho explícito del brief) — no asumir familiaridad con jerga técnica en ningún mensaje de la interfaz, incluidos los de error (ver FR-12).

## Reliability

- **NFR-04**: El archivo generado debe ser válido para importar en PADI sin errores — es uno de los tres pilares de diferenciación declarados ("confiabilidad").
- **Pendiente**: definición formal de "válido" más allá de la estructura de campos confirmada (`SRS/10-exporter.md`) — depende de que se terminen de confirmar las reglas tributarias (`tax-rules/2181/`).

## Security & Multi-tenancy

- **NFR-05**: Los datos de una empresa/cliente deben estar aislados de los de otras empresas dentro de la misma cuenta de contador (confirmado, ver `SRS/12-security.md`, `FR-03`).
- **NFR-09**: Autenticación self-service (email + contraseña), un usuario = una cuenta, sin roles múltiples en el MVP; autorización por aislamiento de tenant vía `cuenta_id` (confirmado, ver `SRS/12-security.md`).
- **Pendiente**: cifrado en tránsito/reposo, política de retención de archivos — no definidos aún, no bloquean bootstrap (ver `SRS/12-security.md`).

## Maintainability & Extensibility

- **NFR-06**: El Tax Rules Engine y los módulos genéricos (Parser, Normalizer, Validator, Exporter) deben permitir agregar formularios DGI futuros sin rediseñar el sistema (`ADR-0001`) — es un invariante de arquitectura, no solo una aspiración.
- **NFR-07**: Las reglas tributarias deben poder actualizarse (nueva normativa DGI) sin requerir un despliegue de código — viven en `.context/tax-rules/`, separadas del motor.

## Compliance

- **NFR-08**: El archivo de salida debe cumplir exactamente el formato oficial PADI de DGI para la DJ 2181 — sin tolerancia a desviación de estructura (campos, delimitador, orden).

## Pendiente (sin definir, no inventar)

- SLA de disponibilidad del servicio.
- Cifrado y política de retención de datos.
- Requisitos regulatorios uruguayos específicos más allá de DGI/PADI (si existen).
