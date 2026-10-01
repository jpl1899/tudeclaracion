import type { LineaDeclaracion } from '@/modules/tax-engine/consolidate-lines';

const NUMERO_DECLARACION_2181 = '02181';

export interface DatosDeclarante {
  rut: string
  periodo: string
}

/**
 * Redondeo confirmado por el contador (2026-07-19, corrige la respuesta
 * "siempre hacia arriba" del 2026-07-17): los importes vienen con 2
 * decimales -- se comparan esos 2 decimales completos contra 0,50: ≤0,50
 * redondea para abajo, ≥0,51 para arriba. Ej: 180,50 -> 180; 180,51 -> 181.
 */
export function redondearImporte(valor: number): number {
  const parteEntera = Math.floor(valor);
  const decimales = Math.round((valor - parteEntera) * 100) / 100;
  return decimales <= 0.5 ? parteEntera : parteEntera + 1;
}

/**
 * Formato confirmado en SRS/10-exporter.md: 7 campos delimitados por `;`,
 * sin encabezado, cada línea termina en `;`. El campo 7 (importe) es un
 * monto entero sin decimales (ver `redondearImporte`), sin campo de signo.
 * Corregido 2026-07-27: un importe negativo puede resolver más arriba en el
 * pipeline (nota de crédito), pero `consolidarLineasDeclaracion` ya excluye
 * toda línea cuyo neto sea ≤ 0 antes de que llegue acá -- a esta altura
 * `linea.importe` siempre es positivo. `Math.abs` queda como red de
 * seguridad, no como mecanismo esperado.
 */
export function generarArchivoPadi(declarante: DatosDeclarante, lineas: LineaDeclaracion[]): string {
  return lineas
    .map((linea) => {
      const campos = [
        declarante.rut,
        NUMERO_DECLARACION_2181,
        declarante.periodo,
        linea.rut,
        declarante.periodo,
        linea.codigoPadi,
        redondearImporte(Math.abs(linea.importe)).toString().padStart(12, '0'),
      ];
      return `${campos.join(';')};`;
    })
    .join('\n');
}
