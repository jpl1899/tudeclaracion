# Fórmulas — Formulario 1376

> Estado: **confirmado con la contadora 2026-09-01** (sesión de verificación de TD-41, con Rosana presente). Quedan dos puntos abiertos, marcados abajo.

## Modelo de agregación (confirmado)

- El contador configura, **por empresa**, una matriz de mapeo biyectiva (TD-38): **un código de línea 1376 ↔ una única cuenta contable**. Cada fila lleva además:
  - **código de IVA** (opcional): el código de formato rápido de Memory Conty.
  - **lado**: Debe o Haber.
- **Mismos dos criterios que el 2181, por movimiento** (ADR-0010, 2026-10-15 — reemplaza la "columna de importe por fila" del 2026-09-01):
  - **Formato rápido** de Memory Conty (Código IVA > 0) → el movimiento entra si su Código IVA es el de la fila, y se toma la columna `IVA`.
  - Asiento **abierto** (Código IVA = 0) → el movimiento entra si la cuenta de la fila aparece del lado configurado, y se toma la columna `Total`.
  - Una misma línea recibe los dos formatos en el mismo período. El formato de cada movimiento decide por qué criterio entra, así que nunca se cuenta dos veces.
- Por cada fila: se juntan los movimientos de los dos criterios y se hace la **suma simple con signo** (positivos y negativos juntos — devoluciones / notas de crédito entran como importes negativos).
- Cada código de línea acumula el saldo de su única cuenta mapeada (biyección → no hay suma de varias cuentas por código).
- **Conversión de moneda**: para movimientos en dólares (`Moneda = 1`), misma conversión por cotización que el 2181.
- **Redondeo**: mismo criterio que el 2181 (2 decimales, mitad hacia abajo).
- **Salida**: un monto entero por código de línea con al menos una cuenta mapeada con movimiento — archivo `código; monto`, un renglón por código. Sin apertura por RUT.

## Puntos todavía abiertos

1. **Determinación de la liquidación.** Si el motor además calcula el saldo a pagar (líneas 322/970/971/972, boleto 2908) o se limita a totales por código. Diferido el 2026-09-01 — "lo vemos en la marcha". Por ahora TD-41 = solo totales por código (consistente con ADR-0006).
2. **Acumulados del ejercicio (Panel 1).** Fórmula y fuente del dato "ventas/compras acumuladas del ejercicio" — el TXT mensual no lo trae. Sin resolver.

## Catálogo de códigos de línea

Provisorio — ver `codigos.md` y `open-questions.md`. TD-38 lo sembró como tabla configurable `codigo_linea_1376` con los 10 códigos del diseño del usuario (101/102/103/201/301/302/501/502/510/601). Se reemplaza cuando llegue el catálogo real de DGI, sin tocar código.
