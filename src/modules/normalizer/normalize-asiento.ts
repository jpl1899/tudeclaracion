import type { AsientoLine } from '@/modules/parser/parse-asientos';

const TIPO_504 = '504';
const TIPO_FUERA_DE_ALCANCE = ['CIE', 'RES', 'DIF', 'APE'] as const;

export interface PlanCuentaRow {
  cuentaContable: string
  codigoPadi: string
  codigoIva: number | null
}

export type NormalizedAsiento
  = | { resolved: true, codigoPadi: string, importe: number, rut: string }
    | { resolved: false, reason: 'tipo-fuera-de-alcance' | 'sin-mapeo' };

/** Los importes del TXT vienen en la moneda del asiento (`moneda`) — si es dólares (1), se convierten a pesos con la cotización cargada al importar (ver importar-asiento-dialog.tsx). */
function convertirImporte(importe: number, asiento: AsientoLine): number {
  return asiento.moneda === 1 ? importe * asiento.cotizacion : importe;
}

export function resolveAsientoFiscal(asiento: AsientoLine, planCuentas: PlanCuentaRow[]): NormalizedAsiento {
  if (asiento.tipo === TIPO_504) {
    return { resolved: true, codigoPadi: TIPO_504, importe: convertirImporte(asiento.total, asiento), rut: asiento.rut };
  }

  if (asiento.tipo !== null && (TIPO_FUERA_DE_ALCANCE as readonly string[]).includes(asiento.tipo)) {
    return { resolved: false, reason: 'tipo-fuera-de-alcance' };
  }

  if (asiento.codigoIva > 0) {
    const match = planCuentas.find(row => row.codigoIva === asiento.codigoIva);
    if (!match) {
      return { resolved: false, reason: 'sin-mapeo' };
    }
    return { resolved: true, codigoPadi: match.codigoPadi, importe: convertirImporte(asiento.iva, asiento), rut: asiento.rut };
  }

  // Camino 2 (asiento abierto): se prueba la cuenta contable de Debe primero,
  // Haber después — no depende de Libro (revertido 2026-07-21, ver 08-tax-engine.md).
  const cuentaMatch = [asiento.debe, asiento.haber]
    .filter(cuenta => cuenta.length > 0)
    .map(cuenta => planCuentas.find(row => row.cuentaContable === cuenta))
    .find(match => match !== undefined);

  if (!cuentaMatch) {
    return { resolved: false, reason: 'sin-mapeo' };
  }
  return { resolved: true, codigoPadi: cuentaMatch.codigoPadi, importe: convertirImporte(asiento.total, asiento), rut: asiento.rut };
}
