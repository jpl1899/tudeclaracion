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
 * y `valor` (el dato puntual que no resolvió -- tipo, libro, cuenta/código
 * IVA o importe según la razón) para que el mensaje de error nombre
 * exactamente qué falló, en vez de un "no resolvió" genérico.
 */
export type NormalizedAsiento
  = | { resolved: true, codigoPadi: string, importe: number, rut: string }
    | { resolved: false, reason: 'tipo-fuera-de-alcance' | 'libro-fuera-de-alcance' | 'sin-mapeo' | 'importe-invalido', rut: string, dia: number, valor: string };

function noResuelto(
  asiento: AsientoLine,
  reason: Extract<NormalizedAsiento, { resolved: false }>['reason'],
  valor: string,
): NormalizedAsiento {
  return { resolved: false, reason, rut: asiento.rut, dia: asiento.dia, valor };
}

export function resolveAsientoFiscal(asiento: AsientoLine, planCuentas: PlanCuentaRow[]): NormalizedAsiento {
  let resolucion: { codigoPadi: string, importe: number };

  if (asiento.tipo === TIPO_504) {
    resolucion = { codigoPadi: TIPO_504, importe: asiento.total };
  }
  else if (asiento.tipo !== null && (TIPO_FUERA_DE_ALCANCE as readonly string[]).includes(asiento.tipo)) {
    return noResuelto(asiento, 'tipo-fuera-de-alcance', asiento.tipo);
  }
  else if (asiento.codigoIva > 0) {
    const match = planCuentas.find(row => row.codigoIva === asiento.codigoIva);
    if (!match) {
      return noResuelto(asiento, 'sin-mapeo', `Código IVA ${asiento.codigoIva}`);
    }
    resolucion = { codigoPadi: match.codigoPadi, importe: asiento.iva };
  }
  else {
    let cuentaContable: string;
    if ((LIBRO_COMPRA as readonly string[]).includes(asiento.libro)) {
      cuentaContable = asiento.debe;
    }
    else if ((LIBRO_VENTA as readonly string[]).includes(asiento.libro)) {
      cuentaContable = asiento.haber;
    }
    else {
      return noResuelto(asiento, 'libro-fuera-de-alcance', asiento.libro);
    }

    const match = planCuentas.find(row => row.cuentaContable === cuentaContable);
    if (!match) {
      return noResuelto(asiento, 'sin-mapeo', `cuenta ${cuentaContable}`);
    }
    resolucion = { codigoPadi: match.codigoPadi, importe: asiento.total };
  }

  /**
   * TD-17: confirmado 2026-07-17 (SRS/07-validator.md) -- un importe 0 no se
   * declara, un importe negativo nunca es válido. Se excluye solo esta
   * línea, no se aborta la declaración entera (misma mecánica que sin-mapeo).
   */
  if (resolucion.importe <= 0) {
    return noResuelto(asiento, 'importe-invalido', resolucion.importe.toString());
  }

  return { resolved: true, codigoPadi: resolucion.codigoPadi, importe: resolucion.importe, rut: asiento.rut };
}
