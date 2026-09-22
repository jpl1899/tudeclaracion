/**
 * Motor de cálculo del Formulario 1376 — TD-41.
 *
 * Modelo confirmado con la contadora (`.context/Tax-rules/1376/formulas.md`,
 * 2026-09-01): por cada código de línea con cuenta mapeada (TD-38, relación
 * biyectiva), se juntan los asientos del período donde esa cuenta aparece del
 * lado configurado (Debe/Haber), se toma el importe de la columna configurada
 * (Total/IVA) y se suma con signo (las notas de crédito entran negativas). Un
 * código sin ningún asiento que lo toque no aparece en el resultado. Sin
 * apertura por RUT (a diferencia del 2181) y sin redondeo final a entero —
 * eso es responsabilidad del exportador (TD-44), igual que en el 2181
 * `consolidarLineasDeclaracion` vs `generarArchivoPadi`.
 */

import type { MapeoAsignacionInicial } from '@/modules/mapeo-1376/mapeo-1376';
import type { AsientoLine } from '@/modules/parser/parse-asientos';
import { convertirImporte } from '@/modules/normalizer/normalize-asiento';

export interface TotalLinea1376 {
  codigoLinea: string
  importe: number
}

function cuentaDelLado(asiento: AsientoLine, lado: MapeoAsignacionInicial['lado']): string {
  return lado === 'debe' ? asiento.debe : asiento.haber;
}

export function calcularTotalesLinea1376(
  asientos: AsientoLine[],
  mapeo: MapeoAsignacionInicial[],
): TotalLinea1376[] {
  const totales: TotalLinea1376[] = [];

  for (const fila of mapeo) {
    const movimientos = asientos.filter(asiento => cuentaDelLado(asiento, fila.lado) === fila.cuentaContable);
    if (movimientos.length === 0) {
      continue;
    }

    const importe = movimientos.reduce((acumulado, asiento) => {
      const importeBruto = fila.columnaImporte === 'total' ? asiento.total : asiento.iva;
      return acumulado + convertirImporte(importeBruto, asiento);
    }, 0);

    totales.push({ codigoLinea: fila.codigoLinea, importe });
  }

  return totales;
}
