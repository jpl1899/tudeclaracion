/**
 * Motor de cálculo del Formulario 1376 — TD-41.
 *
 * Modelo confirmado con la contadora (`.context/Tax-rules/1376/formulas.md`):
 * por cada código de línea mapeado (TD-38, relación biyectiva) se juntan los
 * movimientos del período con los dos criterios del 2181 (ADR-0010):
 * - Formato rápido (Código IVA > 0): el Código IVA es el de la fila → columna IVA.
 * - Asiento abierto (Código IVA = 0): la cuenta de la fila aparece del lado
 *   configurado (Debe/Haber) → columna Total.
 * El formato de cada movimiento decide el criterio, así que ninguno se cuenta
 * dos veces. Todo se suma con signo (las notas de crédito entran negativas).
 * Un código sin ningún movimiento que lo toque no aparece en el resultado.
 * Sin apertura por RUT (a diferencia del 2181) y sin redondeo final a entero —
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

/**
 * Tipos que el motor no tiene en cuenta: cierre, resultados y apertura
 * (confirmado con el contador 2026-10-26). Se filtran antes del cálculo y de
 * las advertencias de mapeo, para que una cuenta tocada solo por estos
 * asientos no aparezca como "sin mapear".
 */
const TIPOS_FUERA_DEL_MOTOR = ['CIE', 'RES', 'APE'];

export function asientosDelMotor1376(asientos: AsientoLine[]): AsientoLine[] {
  return asientos.filter(asiento => asiento.tipo === null || !TIPOS_FUERA_DEL_MOTOR.includes(asiento.tipo));
}

function cuentaDelLado(asiento: AsientoLine, lado: MapeoAsignacionInicial['lado']): string {
  return lado === 'debe' ? asiento.debe : asiento.haber;
}

/** Importe con el que un movimiento alimenta la fila, o `null` si no la toca. */
function importeDelMovimiento(asiento: AsientoLine, fila: MapeoAsignacionInicial): number | null {
  if (asiento.codigoIva > 0) {
    return asiento.codigoIva === fila.codigoIva ? asiento.iva : null;
  }
  return cuentaDelLado(asiento, fila.lado) === fila.cuentaContable ? asiento.total : null;
}

export function calcularTotalesLinea1376(
  asientos: AsientoLine[],
  mapeo: MapeoAsignacionInicial[],
): TotalLinea1376[] {
  const totales: TotalLinea1376[] = [];

  for (const fila of mapeo) {
    let tocada = false;
    let importe = 0;
    for (const asiento of asientos) {
      const importeBruto = importeDelMovimiento(asiento, fila);
      if (importeBruto === null) {
        continue;
      }
      tocada = true;
      importe += convertirImporte(importeBruto, asiento);
    }

    if (tocada) {
      totales.push({ codigoLinea: fila.codigoLinea, importe });
    }
  }

  return totales;
}
