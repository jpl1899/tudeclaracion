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

/**
 * TD-18: la rama `resolved: false` lleva `rut` + `dia` (identifica la línea)
 * y `valor` (el dato puntual que no resolvió -- tipo, libro o cuenta/código
 * IVA según la razón) para que el mensaje de error nombre exactamente qué
 * falló, en vez de un "no resolvió" genérico.
 */
export type NormalizedAsiento
  = | { resolved: true, codigoPadi: string, importe: number, rut: string }
    | { resolved: false, reason: 'tipo-fuera-de-alcance' | 'libro-fuera-de-alcance' | 'sin-mapeo', rut: string, dia: number, valor: string };

export function resolveAsientoFiscal(asiento: AsientoLine, planCuentas: PlanCuentaRow[]): NormalizedAsiento {
  if (asiento.tipo === TIPO_504) {
    return { resolved: true, codigoPadi: TIPO_504, importe: asiento.total, rut: asiento.rut };
  }

  if (asiento.tipo !== null && (TIPO_FUERA_DE_ALCANCE as readonly string[]).includes(asiento.tipo)) {
    return { resolved: false, reason: 'tipo-fuera-de-alcance', rut: asiento.rut, dia: asiento.dia, valor: asiento.tipo };
  }

  if (asiento.codigoIva > 0) {
    const match = planCuentas.find(row => row.codigoIva === asiento.codigoIva);
    if (!match) {
      return { resolved: false, reason: 'sin-mapeo', rut: asiento.rut, dia: asiento.dia, valor: `Código IVA ${asiento.codigoIva}` };
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
    return { resolved: false, reason: 'libro-fuera-de-alcance', rut: asiento.rut, dia: asiento.dia, valor: asiento.libro };
  }

  const match = planCuentas.find(row => row.cuentaContable === cuentaContable);
  if (!match) {
    return { resolved: false, reason: 'sin-mapeo', rut: asiento.rut, dia: asiento.dia, valor: `cuenta ${cuentaContable}` };
  }
  return { resolved: true, codigoPadi: match.codigoPadi, importe: asiento.total, rut: asiento.rut };
}
