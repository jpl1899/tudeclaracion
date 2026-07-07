# RUT — Reglas comunes

## Confirmado

- Formato: **12 dígitos** (confirmado por el usuario y visible en el ejemplo real, `.context/SRS/10-exporter.md`).
- Aparece en dos roles dentro de una misma línea de la DJ 2181: RUT del sujeto declarante y RUT del cliente/proveedor (ver `.context/SRS/04-domain-model.md`).

## Pendiente de confirmar

- Algoritmo de dígito verificador del RUT uruguayo — `(especulativo / conocimiento general, no verificado)`: es común que el RUT uruguayo incluya un dígito verificador calculado con un algoritmo específico (similar en espíritu al de la Cédula de Identidad), pero el algoritmo exacto **no está confirmado** acá y no debe asumirse sin verificarlo.
- Si el sistema debe validar el dígito verificador, o solo la longitud/formato numérico (ver `.context/SRS/07-validator.md`).
- Tratamiento de RUTs de no residentes o casos especiales, si el 2181 los contempla.

No fabricar el algoritmo de validación — confirmar con el usuario o fuente oficial DGI antes de implementarlo.
