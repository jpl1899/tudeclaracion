# Fórmulas — Formulario 1376

> Estado: **confirmado con la contadora 2026-09-01** (sesión de verificación de TD-41, con Rosana presente). Quedan dos puntos abiertos, marcados abajo.

## Modelo de agregación (confirmado)

- El contador configura, **por empresa**, una matriz de mapeo biyectiva (TD-38): **un código de línea 1376 ↔ una única cuenta contable**. Cada fila lleva además:
  - **lado**: Debe o Haber.
  - **columna de importe**: `Total` o `IVA` — de qué columna del TXT sale el saldo de esa cuenta.
- Regla de la columna de importe: depende del **formato del asiento**, no del tipo de línea.
  - Asiento **abierto** (multilínea, una cuenta por línea) → `Total`.
  - **Formato rápido** de Memory Conty (asiento colapsado, IVA en su columna dedicada) → `IVA`.
  - El contador elige el valor correcto por fila al armar el mapeo.
- Por cada cuenta mapeada: se juntan sus movimientos del período en el TXT, se toma el importe de la columna configurada y se hace la **suma simple con signo** (positivos y negativos juntos — devoluciones / notas de crédito entran como importes negativos).
- Cada código de línea acumula el saldo de su única cuenta mapeada (biyección → no hay suma de varias cuentas por código).
- **Conversión de moneda**: para movimientos en dólares (`Moneda = 1`), misma conversión por cotización que el 2181.
- **Redondeo**: mismo criterio que el 2181 (2 decimales, mitad hacia abajo).
- **Salida**: un monto entero por código de línea con al menos una cuenta mapeada con movimiento — archivo `código; monto`, un renglón por código. Sin apertura por RUT.

## Puntos todavía abiertos

1. **Determinación de la liquidación.** Si el motor además calcula el saldo a pagar (líneas 322/970/971/972, boleto 2908) o se limita a totales por código. Diferido el 2026-09-01 — "lo vemos en la marcha". Por ahora TD-41 = solo totales por código (consistente con ADR-0006).
2. **Acumulados del ejercicio (Panel 1).** Fórmula y fuente del dato "ventas/compras acumuladas del ejercicio" — el TXT mensual no lo trae. Sin resolver.

## Catálogo de códigos de línea

Provisorio — ver `codigos.md` y `open-questions.md`. TD-38 lo sembró como tabla configurable `codigo_linea_1376` con los 10 códigos del diseño del usuario (101/102/103/201/301/302/501/502/510/601). Se reemplaza cuando llegue el catálogo real de DGI, sin tocar código.
