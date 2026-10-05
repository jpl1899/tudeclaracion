import type { AsientoLine } from '@/modules/parser/parse-asientos';
import type { PlanCuentaRow } from '@/modules/plan-cuentas/resolver-cuenta-camino-2';
import { esConsistenteConLibro, resolverCuentaCamino2 } from '@/modules/plan-cuentas/resolver-cuenta-camino-2';

export type { PlanCuentaRow } from '@/modules/plan-cuentas/resolver-cuenta-camino-2';

const TIPO_504 = '504';
const TIPO_FUERA_DE_ALCANCE = ['CIE', 'RES', 'DIF', 'APE'] as const;
const RUT_RE = /^\d{12}$/;

/**
 * TD-18: la rama `resolved: false` lleva `rut` + `dia` (identifica la línea)
 * y `valor` (el dato puntual que no resolvió -- tipo, cuenta/código IVA o
 * importe según la razón) para que el mensaje de error nombre exactamente
 * qué falló, en vez de un "no resolvió" genérico.
 */
export type NormalizedAsiento
  = | { resolved: true, codigoPadi: string, importe: number, rut: string }
    | { resolved: false, reason: 'tipo-fuera-de-alcance' | 'sin-mapeo' | 'importe-invalido' | 'libro-inconsistente' | 'rut-invalido', rut: string, dia: number, valor: string };

function noResuelto(
  asiento: AsientoLine,
  reason: Extract<NormalizedAsiento, { resolved: false }>['reason'],
  valor: string,
): NormalizedAsiento {
  return { resolved: false, reason, rut: asiento.rut, dia: asiento.dia, valor };
}

/**
 * Redondeo de mitad hacia abajo: parte decimal <= 0.50 trunca, > 0.50
 * redondea al entero siguiente (confirmado con el contador 2026-08-19,
 * ej. 4115.50792 -> 4116; 4115.50 -> 4115) -- distinto del redondeo estándar
 * de JS (`Math.round`), que redondea 0.50 hacia arriba.
 */
export function redondearMitadAbajo(valor: number): number {
  const piso = Math.floor(valor);
  return valor - piso > 0.5 ? piso + 1 : piso;
}

/**
 * Los importes del TXT vienen en la moneda del asiento (`moneda`) — si es dólares (1), se convierten a pesos con la cotización cargada al importar (ver importar-asiento-dialog.tsx), redondeando el producto final a un entero.
 *
 * Exportada (además del 2181) para el motor del 1376 (TD-41) — misma conversión por cotización, confirmado en `.context/Tax-rules/1376/formulas.md`.
 */
export function convertirImporte(importe: number, asiento: AsientoLine): number {
  return asiento.moneda === 1 ? redondearMitadAbajo(importe * asiento.cotizacion) : importe;
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
    // Mismo cruce de Libro contra el prefijo de la cuenta que Camino 2
    // (2026-08-02, corregido -- se aplicaba antes solo a Camino 2, pero el
    // caso reportado por el contador era justamente uno resuelto por Código
    // IVA directo).
    if (!esConsistenteConLibro(match, asiento.libro, asiento.total)) {
      return noResuelto(asiento, 'libro-inconsistente', `cuenta ${match.cuentaContable} con Libro ${asiento.libro}`);
    }
    resolucion = { codigoPadi: match.codigoPadi, importe: convertirImporte(asiento.iva, asiento) };
  }
  else {
    // Camino 2 (asiento abierto): se prueba la cuenta contable de Debe
    // primero, Haber después, y entre los candidatos que matchean el plan de
    // cuentas se prefiere el consistente con Libro (revierte el 2026-07-21 --
    // Libro vuelve a ser decisorio, pero vía prefijo de cuenta, no posición).
    // Lógica compartida con el parser (2026-08-02) -- ver `resolver-cuenta-camino-2.ts`.
    const { candidatos, cuentaMatch } = resolverCuentaCamino2(asiento.debe, asiento.haber, asiento.libro, asiento.total, planCuentas);

    if (candidatos.length === 0) {
      const cuentasConDatos = [asiento.debe, asiento.haber].filter(cuenta => cuenta.length > 0);
      return noResuelto(asiento, 'sin-mapeo', `cuenta ${cuentasConDatos.join(' / ')}`);
    }

    if (!cuentaMatch) {
      return noResuelto(asiento, 'libro-inconsistente', `cuenta ${candidatos.map(c => c.cuentaContable).join(' / ')} con Libro ${asiento.libro}`);
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

  /**
   * ADR-0008: el RUT ya no se exige en la tabla `asiento` -- el 1376 no lo
   * usa y el parser solo lo valida en las líneas que el 2181 resuelve. Esta
   * es la segunda barrera: una línea que resuelve al 2181 con un RUT
   * inválido (ej. el plan de cuentas cambió después de importar) se excluye
   * en vez de llegar al archivo PADI.
   */
  if (!RUT_RE.test(asiento.rut)) {
    return noResuelto(asiento, 'rut-invalido', asiento.rut);
  }

  return { resolved: true, codigoPadi: resolucion.codigoPadi, importe: resolucion.importe, rut: asiento.rut };
}
