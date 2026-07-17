import type { LineaDeclaracion } from '@/modules/tax-engine/consolidate-lines';

const NUMERO_DECLARACION_2181 = '02181';

export interface DatosDeclarante {
  rut: string
  periodo: string
}

/**
 * Formato confirmado en SRS/10-exporter.md: 7 campos delimitados por `;`,
 * sin encabezado, cada línea termina en `;`. El campo 7 (importe) es un
 * monto entero sin decimales, redondeado siempre hacia arriba (confirmado
 * 2026-07-17). Un importe negativo nunca es válido de por sí (confirmado
 * el mismo día) -- TD-17 (todavía no construido) es quien debe rechazarlo
 * antes de llegar acá; `Math.abs` queda como red de seguridad para nunca
 * emitir un archivo con un signo corrompiendo el campo de ancho fijo.
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
        Math.ceil(Math.abs(linea.importe)).toString().padStart(12, '0'),
      ];
      return `${campos.join(';')};`;
    })
    .join('\n');
}
