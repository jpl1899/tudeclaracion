import type { NormalizedAsiento } from '@/modules/normalizer/normalize-asiento';

export interface LineaDeclaracion {
  rut: string
  codigoPadi: string
  importe: number
}

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

  return [...lineasPorClave.values()];
}
