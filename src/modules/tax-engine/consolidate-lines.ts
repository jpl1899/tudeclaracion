import type { NormalizedAsiento } from '@/modules/normalizer/normalize-asiento';

export interface LineaDeclaracion {
  rut: string
  codigoPadi: string
  importe: number
}

/**
 * Corregido 2026-07-27: una nota de crédito/devolución resuelve con importe
 * negativo (ver `normalize-asiento.ts`) y se netea acá contra el asiento
 * positivo del mismo RUT+código PADI (suma simple). Confirmado con el
 * contador: si el neto da 0 (venta cancelada por su NC) o negativo (NC mayor
 * a la venta del período), esa línea no va en el archivo PADI.
 */
export function consolidarLineasDeclaracion(resueltos: NormalizedAsiento[]): LineaDeclaracion[] {
  const lineasPorClave = new Map<string, LineaDeclaracion>();

  for (const asiento of resueltos) {
    if (!asiento.resolved) {
      continue;
    }

    const clave = `${asiento.rut}:${asiento.codigoPadi}`;
    const lineaExistente = lineasPorClave.get(clave);

    if (lineaExistente) {
      lineaExistente.importe += asiento.importe;
    }
    else {
      lineasPorClave.set(clave, { rut: asiento.rut, codigoPadi: asiento.codigoPadi, importe: asiento.importe });
    }
  }

  return [...lineasPorClave.values()].filter(linea => linea.importe > 0);
}
