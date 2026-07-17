import type { AsientoLine } from '@/modules/parser/parse-asientos';

const TIPO_504 = '504';
const TIPO_FUERA_DE_ALCANCE = ['CIE', 'RES', 'DIF', 'APE'] as const;
const LIBRO_COMPRA = ['C', 'E'] as const;
const LIBRO_VENTA = ['V', 'I'] as const;

export interface PlanCuentaRow {
  cuentaContable: string
  codigoPadi: string
  codigoIva: number | null
}

export type NormalizedAsiento
  = | { resolved: true, codigoPadi: string, importe: number, rut: string }
    | { resolved: false, reason: 'tipo-fuera-de-alcance' | 'libro-fuera-de-alcance' | 'sin-mapeo' };

export function resolveAsientoFiscal(asiento: AsientoLine, planCuentas: PlanCuentaRow[]): NormalizedAsiento {
  if (asiento.tipo === TIPO_504) {
    return { resolved: true, codigoPadi: TIPO_504, importe: asiento.total, rut: asiento.rut };
  }

  if (asiento.tipo !== null && (TIPO_FUERA_DE_ALCANCE as readonly string[]).includes(asiento.tipo)) {
    return { resolved: false, reason: 'tipo-fuera-de-alcance' };
  }

  if (asiento.codigoIva > 0) {
    const match = planCuentas.find(row => row.codigoIva === asiento.codigoIva);
    if (!match) {
      return { resolved: false, reason: 'sin-mapeo' };
    }
    return { resolved: true, codigoPadi: match.codigoPadi, importe: asiento.iva, rut: asiento.rut };
  }

  let cuentaContable: string;
  if ((LIBRO_COMPRA as readonly string[]).includes(asiento.libro)) {
    cuentaContable = asiento.debe;
  }
  else if ((LIBRO_VENTA as readonly string[]).includes(asiento.libro)) {
    cuentaContable = asiento.haber;
  }
  else {
    return { resolved: false, reason: 'libro-fuera-de-alcance' };
  }

  const match = planCuentas.find(row => row.cuentaContable === cuentaContable);
  if (!match) {
    return { resolved: false, reason: 'sin-mapeo' };
  }
  return { resolved: true, codigoPadi: match.codigoPadi, importe: asiento.total, rut: asiento.rut };
}
