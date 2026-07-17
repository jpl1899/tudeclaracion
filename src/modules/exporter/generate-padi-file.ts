import type { LineaDeclaracion } from '@/modules/tax-engine/consolidate-lines';

const NUMERO_DECLARACION_2181 = '02181';

export interface DatosDeclarante {
  rut: string
  periodo: string
}

/**
 * Formato confirmado en SRS/10-exporter.md: 7 campos delimitados por `;`,
 * sin encabezado, cada línea termina en `;`. El campo 7 (importe) asume
 * monto entero -- SRS/10-exporter.md deja pendiente si lleva decimales
 * implícitos, no se inventa esa regla acá.
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
        Math.abs(Math.round(linea.importe)).toString().padStart(12, '0'),
      ];
      return `${campos.join(';')};`;
    })
    .join('\n');
}
