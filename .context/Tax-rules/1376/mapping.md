# Mapping — Cuenta contable → Código de línea (1376)

> Estado: **estructura definida, contenido `[PLACEHOLDER]`.** Es la regla de negocio central del motor 1376 (`SRS/13-forms-1376.md`) — análoga al `tax-rules/2181/mapping.md` del 2181, pero con semántica distinta.

## Estructura de la matriz (por empresa)

Cada empresa configura una matriz de filas:

| Columna | Contenido | Ejemplo |
|---|---|---|
| `cuenta_contable` | código de cuenta del plan contable de la empresa | `4101`, `112511` |
| `tipo` | `Debe` o `Haber` — de qué lado se toma el movimiento de esa cuenta | `Haber` |
| `codigo_linea_1376` | código de línea del formulario al que se suma el saldo de esa cuenta | `101` |

Ejemplos dados por el usuario (`DJ 1376.xlsx`):

| cuenta_contable | tipo | concepto | codigo_linea_1376 (según ejemplo) |
|---|---|---|---|
| `4101` Ventas Plaza 22% | Haber | Ventas a tasa básica | 101 |
| `4102` Ventas Plaza 10% | Haber | Ventas a tasa mínima | 102 |
| `5101` Costo de Ventas | Debe | Costo de ventas gravadas | 201 |
| `1105` IVA Compras (Crédito) | Debe | Crédito fiscal IVA compras | 501 |
| `2105` IVA Ventas (Débito) | Haber | Débito fiscal IVA ventas | 502 |
| `1106` Anticipos IRAE | Debe | Anticipos de IRAE del período | 510 |

## Diferencia con el `plan_cuentas` del 2181

- El `plan_cuentas` del 2181 mapea `cuenta_contable → codigo_padi (+ codigo_iva opcional)` y se usa en los dos caminos de resolución por línea (`SRS/08-tax-engine.md`).
- La matriz del 1376 mapea `cuenta_contable + Debe/Haber → codigo_linea_1376` y se usa para **agregar saldos**, no para resolver líneas por RUT.
- Son tablas separadas. Una empresa que presenta ambos formularios tiene las dos configuraciones.

## Qué falta confirmar

- Tabla completa: cada cuenta contable relevante → código de línea 1376 (depende de tener `codigos.md` confirmado contra DGI).
- Cómo se computa el "saldo" de una cuenta desde el formato real del TXT del 2181 — donde `Debe`/`Haber` son códigos de cuenta y los importes están en `Total` / `IVA` (ver `formulas.md`).
- Si `tipo` (Debe/Haber) siempre viene de la configuración, o si se infiere del movimiento.
- Si una cuenta puede alimentar más de un código de línea (ej. base imponible + IVA asociado).
- Tratamiento de una cuenta con movimiento **no mapeada**: el 1376 la **advierte** (US M2.10), a diferencia del 2181 que la ignora en silencio. Confirmar el detalle (¿bloquea la descarga o solo advierte?).
- Si se ofrece un mapeo base sugerido (US M2.3).

No fabricar reglas de mapeo — este archivo se completa a medida que el usuario / la contadora las provean.
