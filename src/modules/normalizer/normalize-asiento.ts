import type { AsientoLine } from '@/modules/parser/parse-asientos';

const TIPO_504 = '504';
const TIPO_FUERA_DE_ALCANCE = ['CIE', 'RES', 'DIF', 'APE'] as const;

export interface PlanCuentaRow {
  cuentaContable: string
  codigoPadi: string
  codigoIva: number | null
}

/**
 * TD-18: la rama `resolved: false` lleva `rut` + `dia` (identifica la línea)
 * y `valor` (el dato puntual que no resolvió -- tipo, cuenta/código IVA o
 * importe según la razón) para que el mensaje de error nombre exactamente
 * qué falló, en vez de un "no resolvió" genérico.
 */
export type NormalizedAsiento
  = | { resolved: true, codigoPadi: string, importe: number, rut: string }
    | { resolved: false, reason: 'tipo-fuera-de-alcance' | 'sin-mapeo' | 'importe-invalido', rut: string, dia: number, valor: string };

function noResuelto(
  asiento: AsientoLine,
  reason: Extract<NormalizedAsiento, { resolved: false }>['reason'],
  valor: string,
): NormalizedAsiento {
  return { resolved: false, reason, rut: asiento.rut, dia: asiento.dia, valor };
}

/** Los importes del TXT vienen en la moneda del asiento (`moneda`) — si es dólares (1), se convierten a pesos con la cotización cargada al importar (ver importar-asiento-dialog.tsx). */
function convertirImporte(importe: number, asiento: AsientoLine): number {
  return asiento.moneda === 1 ? importe * asiento.cotizacion : importe;
}

export function resolveAsientoFiscal(asiento: AsientoLine, planCuentas: PlanCuentaRow[]): NormalizedAsiento {
  let resolucion: { codigoPadi: string, importe: number };

  if (asiento.tipo === TIPO_504) {
    resolucion = { codigoPadi: TIPO_504, importe: convertirImporte(asiento.total, asiento) };
  }
  else if (asiento.tipo !== null && (TIPO_FUERA_DE_ALCANCE as readonly string[]).includes(asiento.tipo)) {
    return noResuelto(asiento, 'tipo-fuera-de-alcance', asiento.tipo);
  }
  else if (asiento.codigoIva > 0) {
    const match = planCuentas.find(row => row.codigoIva === asiento.codigoIva);
    if (!match) {
      return noResuelto(asiento, 'sin-mapeo', `Código IVA ${asiento.codigoIva}`);
    }
    resolucion = { codigoPadi: match.codigoPadi, importe: convertirImporte(asiento.iva, asiento) };
  }
  else {
    // Camino 2 (asiento abierto): se prueba la cuenta contable de Debe
    // primero, Haber después — no depende de Libro (revertido 2026-07-21,
    // ver 08-tax-engine.md).
    const cuentaMatch = [asiento.debe, asiento.haber]
      .filter(cuenta => cuenta.length > 0)
      .map(cuenta => planCuentas.find(row => row.cuentaContable === cuenta))
      .find(match => match !== undefined);

    if (!cuentaMatch) {
      const cuentasIntentadas = [asiento.debe, asiento.haber].filter(cuenta => cuenta.length > 0).join(' / ');
      return noResuelto(asiento, 'sin-mapeo', `cuenta ${cuentasIntentadas}`);
    }
    resolucion = { codigoPadi: cuentaMatch.codigoPadi, importe: convertirImporte(asiento.total, asiento) };
  }

  /**
   * TD-17: confirmado 2026-07-17 (SRS/07-validator.md) -- un importe 0 no se
   * declara. Se excluye solo esta línea, no se aborta la declaración entera
   * (misma mecánica que sin-mapeo).
   *
   * **Corregido 2026-07-27**: un importe negativo ya NO se rechaza acá --
   * representa una nota de crédito/devolución. Resuelve normal (`resolved:
   * true` con importe negativo) para que `consolidarLineasDeclaracion` lo
   * neteé contra el asiento positivo del mismo RUT+código PADI. El
   * descarte de un neto final ≤ 0 pasa a vivir en esa función, no acá.
   */
  if (resolucion.importe === 0) {
    return noResuelto(asiento, 'importe-invalido', resolucion.importe.toString());
  }

  return { resolved: true, codigoPadi: resolucion.codigoPadi, importe: resolucion.importe, rut: asiento.rut };
}
