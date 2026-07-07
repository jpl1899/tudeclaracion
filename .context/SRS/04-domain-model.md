# 04 — Domain Model

> Confirmado a partir del análisis del TXT de salida real (`10-exporter.md`) + la conversación de dominio. Las entidades del lado de "entrada" (Memory) siguen pendientes.

## Entidades confirmadas

### RUT
- 12 dígitos.
- Aparece en dos roles distintos dentro de una misma declaración:
  - **RUT sujeto declarante** — el contribuyente que presenta la DJ.
  - **RUT cliente/proveedor** — el tercero de cada línea de la declaración.

### Período
- Formato `AAAAMM` (ej. `201612` = diciembre 2016).
- En el registro de salida aparece dos veces (período de la declaración + período asociado al tercero), y son **siempre iguales** (confirmado por el usuario) — no representan períodos distintos.

### Línea / Código PADI
- Identifica el concepto fiscal dentro del formulario 2181.
- Códigos conocidos hasta ahora: `502`, `503`, `504`, `505`, `506`, `552`, `553`.
- **Lista incompleta** — el usuario indicó explícitamente que faltan códigos por confirmar. Ver `09-forms.md`.

### Importe
- IVA o total de compra exenta, según el código de línea.
- Representado como 12 dígitos con ceros a la izquierda en el TXT de salida.
- **Pendiente**: confirmar si lleva decimales implícitos o es monto entero.

### Declaración (2181)
- Compuesta por N líneas (una por combinación RUT-tercero + código PADI + importe), todas bajo el mismo RUT declarante y período.

### Cuenta de contador / Empresa (cliente)

- **Confirmado**: una cuenta de contador gestiona **múltiples empresas/clientes** (multi-tenant dentro del MVP, ver `12-security.md`).
- Cada Empresa tiene su propio RUT, su propio plan de cuentas (configurable, ver `06-normalizer.md`) y sus propias declaraciones — es el nivel al que pertenecen los datos, no la cuenta de contador en sí.
- **Confirmado (2026-07-05)**: la relación es **1 Cuenta de contador → N Empresas**, estrictamente. Una Empresa pertenece a una única Cuenta de contador — no hay Empresas compartidas entre múltiples cuentas. Implica FK simple `empresa.cuenta_id` (no tabla intermedia N:N).

## Pendiente

- Entidades del lado de entrada (formato TXT de Memory: cuentas contables, asientos, conceptos).
- Entidad "Concepto fiscal" y su relación con la Línea/Código PADI (regla tributaria — ver `08-tax-engine.md`).
- Entidad "Plan de cuentas" (mapeo configurable por empresa; la UI de autoconfiguración queda fuera del MVP — ver `06-normalizer.md`).
