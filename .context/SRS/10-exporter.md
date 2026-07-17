# 10 — Exporter

> Estado: **confirmado**. Formato validado por el usuario campo a campo, a partir de un ejemplo real (`c:\Users\DISCO\Downloads\2181.txt`).

## Responsabilidad

Genera el archivo TXT de salida de la Declaración Jurada 2181, compatible con el formato de importación **PADI** de DGI.

## Formato del archivo

- Texto plano, delimitado por `;`.
- Una línea por registro.
- Sin encabezado.
- Cada línea termina en `;`.

## Estructura de campos (7 campos, en orden)

| # | Campo | Formato | Ejemplo | Notas |
|---|-------|---------|---------|-------|
| 1 | RUT sujeto declarante | 12 dígitos | `212583570018` | El contribuyente que presenta la DJ |
| 2 | Número de declaración | 5 dígitos, cero a la izquierda | `02181` | Fijo en `02181` — único formulario en scope del MVP |
| 3 | Período de la declaración | `AAAAMM` | `201612` | Diciembre 2016 |
| 4 | RUT cliente/proveedor | 12 dígitos | `101593570014` | El tercero de esta línea |
| 5 | Añomes | `AAAAMM` | `201612` | **Siempre igual al campo 3** (confirmado por el usuario — no es un período distinto) |
| 6 | Código PADI | numérico | `502` | Línea del formulario — ver catálogo en `09-forms.md` (incompleto) |
| 7 | Importe | 12 dígitos, cero a la izquierda | `000000002322` | IVA o total de compra exenta, según el código. **Confirmado 2026-07-17: monto entero, sin decimales implícitos.** Redondeo siempre hacia arriba (`Math.ceil`, no al más cercano) — ver `Tax-rules/2181/formulas.md`. |

## Ejemplo real

```
212583570018;02181;201612;101593570014;201612;502;000000002322;
212583570018;02181;201612;121593570012;201612;503;000000001104;
```

## Pendiente

- Confirmar si existen otros formularios/variantes de salida fuera del 2181 (fuera de scope MVP, pero relevante para el diseño del Exporter a futuro).
