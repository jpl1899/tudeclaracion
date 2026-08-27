# Fórmulas — Formulario 1376

> Estado: **`[PLACEHOLDER]`.** Nada confirmado. Este archivo describe cómo se computa el monto de cada código de línea del 1376 a partir de los asientos del período. Se completa cuando el usuario / la contadora aporten las reglas y ejemplos reales.

## Modelo de agregación (según el diseño del usuario, sin confirmar el detalle)

- Para cada cuenta contable con movimiento en el período: **saldo de la cuenta**.
- El saldo se asigna al código de línea 1376 configurado en la matriz de mapeo (`mapping.md`).
- Un código de línea acumula (suma) los saldos de todas las cuentas mapeadas a él.
- Salida: un monto entero por código de línea (`codigo;monto`).

## Preguntas abiertas críticas

1. **Cómo se computa el saldo de una cuenta desde el TXT.** El Excel del usuario asume un formato `(Fecha, Cuenta, Debe, Haber)` con `Saldo = Debe − Haber` donde Debe/Haber son **importes**. Pero el TXT real del 2181 (`SRS/05-parser.md`) trae `Debe`/`Haber` como **códigos de cuenta**, y los importes en `Total` / `IVA`. Falta definir la fórmula real: por cada línea del TXT, ¿qué importe (`Total`? `IVA`?) se imputa a la cuenta de `Debe` y cuál a la de `Haber`? ¿Depende del código de línea destino (análogo a los dos caminos del 2181)?
2. **Qué columna de importe alimenta cada tipo de línea.** Líneas de base imponible (ventas, costos) probablemente `Total`; líneas de IVA (débito/crédito fiscal) probablemente `IVA`. Sin confirmar.
3. **Conversión de moneda.** Si `Moneda = 1` (dólares), ¿se aplica la misma conversión por cotización que el 2181 (`SRS/08-tax-engine.md`, `tax-rules/common/`)? Presumiblemente sí, pero sin confirmar.
4. **Signo / notas de crédito.** Cómo entran los movimientos negativos (devoluciones, NC) en la agregación.
5. **Redondeo.** ¿Mismo criterio que el 2181 (2 decimales contra 0,50) o distinto? El ejemplo real muestra enteros.
6. **Acumulados del ejercicio (Panel 1).** Fórmula y fuente del dato — el TXT mensual no lo trae.
7. **Determinación de la liquidación.** Si el motor calcula saldo a pagar / crédito (líneas 322 y siguientes) o se limita a totales por código.

No fabricar fórmulas — este archivo, junto con `mapping.md`, es el contenido más crítico y menos definido de `tax-rules/1376/`.
