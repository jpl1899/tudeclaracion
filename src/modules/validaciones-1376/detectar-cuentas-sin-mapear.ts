/**
 * Cuentas sin mapear del Formulario 1376 — versión mínima adelantada en TD-43
 * (formalmente pertenece a TD-47).
 *
 * Una cuenta es relevante para el 1376 cuando su `codigo_padi` en el plan de
 * cuentas coincide con un código del catálogo `codigo_linea_1376` (mismo
 * mecanismo que la sugerencia de mapeo base de TD-40). Queda "sin mapear"
 * cuando es relevante, tuvo movimiento en el período (Debe o Haber) y no está
 * asignada a ningún código en `mapeo_1376` — su importe no entra en ningún
 * total calculado por TD-41.
 */

import type { AsientoLine } from '@/modules/parser/parse-asientos';

export interface CuentaPlan1376 {
  cuentaContable: string
  codigoPadi: string
}

export interface CuentaSinMapear {
  cuentaContable: string
  codigoLinea: string
}

export interface DetectarCuentasSinMapearInput {
  asientos: AsientoLine[]
  planCuentas: CuentaPlan1376[]
  codigosLinea: string[]
  cuentasMapeadas: string[]
}

export function detectarCuentasSinMapear({
  asientos,
  planCuentas,
  codigosLinea,
  cuentasMapeadas,
}: DetectarCuentasSinMapearInput): CuentaSinMapear[] {
  const codigos = new Set(codigosLinea);
  const mapeadas = new Set(cuentasMapeadas);
  const conMovimiento = new Set(asientos.flatMap(asiento => [asiento.debe, asiento.haber]));

  return planCuentas
    .filter(cuenta =>
      codigos.has(cuenta.codigoPadi)
      && conMovimiento.has(cuenta.cuentaContable)
      && !mapeadas.has(cuenta.cuentaContable))
    .map(cuenta => ({ cuentaContable: cuenta.cuentaContable, codigoLinea: cuenta.codigoPadi }))
    .sort((a, b) => a.cuentaContable.localeCompare(b.cuentaContable));
}
