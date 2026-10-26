import type { TotalLinea1376 } from '@/modules/generacion-1376/calcular-totales-1376';
import { redondearImporte } from './generate-padi-file';

/**
 * Exportador del Formulario 1376 — TD-44. Formato confirmado con el contador
 * (2026-10-01, SRS/13-forms-1376.md "Exporter 1376"): un renglón
 * `codigo;importe` por código de línea, sin encabezado, importe entero sin
 * separador de miles (mismo redondeo que el 2181), sin RUT ni período.
 * Un código cuyo total da negativo no se exporta (decisión del usuario,
 * 2026-10-01), ni uno cuyo importe redondeado da 0 (confirmado con el
 * contador 2026-10-26).
 */
export function generarArchivoPadi1376(totales: TotalLinea1376[]): string {
  return totales
    .map(total => ({ codigoLinea: total.codigoLinea, importe: redondearImporte(total.importe) }))
    .filter(total => total.importe > 0)
    .map(total => `${total.codigoLinea};${total.importe}`)
    .join('\n');
}
