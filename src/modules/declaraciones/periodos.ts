export interface DeclaracionEstado {
  periodo: string
  estado: string
  updated_at: string
}

export interface PeriodoDeclaraciones {
  periodo: string
  estado2181: string
  estado1376: string
  completo: boolean
  updatedAt: string
}

const ESTADO_GENERADA = 'generada';
const ESTADO_PENDIENTE = 'abierta';

/**
 * TD-45 / TD-46: une por período el 2181 (anexo) con el 1376 de la empresa.
 * El período lo define el 2181 (se crea al importar el TXT); la fila del
 * 1376 recién se crea al abrir su revisión, así que si falta cuenta como
 * pendiente. Un período está completo cuando las dos están generadas.
 */
export function armarPeriodos(
  declaraciones2181: DeclaracionEstado[],
  declaraciones1376: DeclaracionEstado[],
): PeriodoDeclaraciones[] {
  const por1376 = new Map(declaraciones1376.map(d => [d.periodo, d]));

  return declaraciones2181.map((d2181) => {
    const d1376 = por1376.get(d2181.periodo);
    const estado1376 = d1376?.estado ?? ESTADO_PENDIENTE;
    const updatedAt = d1376 && d1376.updated_at > d2181.updated_at ? d1376.updated_at : d2181.updated_at;

    return {
      periodo: d2181.periodo,
      estado2181: d2181.estado,
      estado1376,
      completo: d2181.estado === ESTADO_GENERADA && estado1376 === ESTADO_GENERADA,
      updatedAt,
    };
  });
}
