import type { LineaDeclaracion } from '@/modules/tax-engine/consolidate-lines';

const NUMERO_DECLARACION_2181 = '02181';

export interface DatosDeclarante {
  rut: string
  periodo: string
}

/**
 * Redondeo confirmado por el contador (2026-07-19, corrige la respuesta
 * "siempre hacia arriba" del 2026-07-17): decide mirando únicamente el
 * primer decimal, el resto se descarta -- 1-5 redondea para abajo, 6-9
 * para arriba. Ej: 180.549 -> 180 (no 181, aunque .549 > .50).
 */
function redondearImporte(valor: number): number {
  const parteEntera = Math.floor(valor);
  const primerDecimal = Math.floor((valor - parteEntera) * 10 + 1e-9);
  return primerDecimal <= 5 ? parteEntera : parteEntera + 1;
}

/**
 * Formato confirmado en SRS/10-exporter.md: 7 campos delimitados por `;`,
 * sin encabezado, cada línea termina en `;`. El campo 7 (importe) es un
 * monto entero sin decimales (ver `redondearImporte`). Un importe negativo
 * nunca es válido de por sí (confirmado 2026-07-17) -- TD-17 (todavía no
 * construido) es quien debe rechazarlo antes de llegar acá; `Math.abs`
 * queda como red de seguridad para nunca emitir un archivo con un signo
 * corrompiendo el campo de ancho fijo.
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
