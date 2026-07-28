const BCU_ENDPOINT = 'https://cotizaciones.bcu.gub.uy/wscotizaciones/servlet/awsbcucotizaciones';
const BCU_SOAP_ACTION = 'Cotizaaction/AWSBCUCOTIZACIONES.Execute';
export const CODIGO_DOLAR_INTERBANCARIO_FONDO = 2230;
const DIAS_DE_BUSQUEDA_HACIA_ATRAS = 10;

export interface CotizacionBcu {
  fecha: string
  valor: number
}

function formatearFecha(fecha: Date): string {
  return fecha.toISOString().slice(0, 10);
}

/**
 * DGI exige el valor del día hábil ANTERIOR al de uso (confirmado
 * 2026-07-24), nunca el del día corriente. El webservice del BCU ya omite
 * fines de semana y feriados en el rango consultado (confirmado en vivo),
 * así que alcanza con pedir una ventana de 10 días hacia atrás y tomar la
 * fecha más reciente que venga en la respuesta.
 */
export function calcularRangoConsulta(hoy: Date): { fechaDesde: string, fechaHasta: string } {
  const fechaHasta = new Date(hoy);
  fechaHasta.setDate(fechaHasta.getDate() - 1);

  const fechaDesde = new Date(fechaHasta);
  fechaDesde.setDate(fechaDesde.getDate() - DIAS_DE_BUSQUEDA_HACIA_ATRAS);

  return { fechaDesde: formatearFecha(fechaDesde), fechaHasta: formatearFecha(fechaHasta) };
}

/**
 * TD-27 (2026-07-28): rango a consultar para poblar el caché de un período
 * completo (formato `AAAAMM`). `fechaDesde` arranca `DIAS_DE_BUSQUEDA_HACIA_ATRAS`
 * antes del primer día del período -- un asiento del día 1 necesita el día
 * hábil anterior, que puede caer en el mes previo. `fechaHasta` nunca supera
 * "ayer": el BCU no tiene cotización del día corriente ni de fechas futuras.
 */
export function calcularRangoConsultaPeriodo(periodo: string, hoy: Date = new Date()): { fechaDesde: string, fechaHasta: string } {
  const anio = Number(periodo.slice(0, 4));
  const mes = Number(periodo.slice(4, 6));

  const primerDiaMes = new Date(Date.UTC(anio, mes - 1, 1));
  const fechaDesde = new Date(primerDiaMes);
  fechaDesde.setUTCDate(fechaDesde.getUTCDate() - DIAS_DE_BUSQUEDA_HACIA_ATRAS);

  const ultimoDiaMes = new Date(Date.UTC(anio, mes, 0));
  const ayer = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate() - 1));
  const fechaHasta = ultimoDiaMes < ayer ? ultimoDiaMes : ayer;

  return { fechaDesde: formatearFecha(fechaDesde), fechaHasta: formatearFecha(fechaHasta) };
}

function construirSolicitudSoap(fechaDesde: string, fechaHasta: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:cot="Cotiza">
<soapenv:Header/>
<soapenv:Body>
<cot:wsbcucotizaciones.Execute>
<cot:Entrada>
<cot:Moneda>
<cot:item>${CODIGO_DOLAR_INTERBANCARIO_FONDO}</cot:item>
</cot:Moneda>
<cot:FechaDesde>${fechaDesde}</cot:FechaDesde>
<cot:FechaHasta>${fechaHasta}</cot:FechaHasta>
<cot:Grupo>0</cot:Grupo>
</cot:Entrada>
</cot:wsbcucotizaciones.Execute>
</soapenv:Body>
</soapenv:Envelope>`;
}

/**
 * El schema de respuesta es fijo (WSDL confirmado 2026-07-24) y las
 * cotizaciones vienen ordenadas por fecha ascendente -- un bloque
 * `datoscotizaciones.dato` por día hábil del rango consultado (fines de
 * semana/feriados no aparecen, confirmado en vivo contra un rango de un mes
 * completo el 2026-07-28).
 */
export function parsearCotizacionesBcu(xml: string): CotizacionBcu[] {
  const status = xml.match(/<status>(\d+)<\/status>/)?.[1];
  if (status !== '1') {
    return [];
  }

  const bloques = [...xml.matchAll(/<datoscotizaciones\.dato[^>]*>([\s\S]*?)<\/datoscotizaciones\.dato>/g)];

  return bloques.flatMap(([, bloque]) => {
    const fecha = bloque.match(/<Fecha>([\d-]+)<\/Fecha>/)?.[1];
    const valor = bloque.match(/<TCC>([\d.]+)<\/TCC>/)?.[1];
    return fecha === undefined || valor === undefined ? [] : [{ fecha, valor: Number(valor) }];
  });
}

/** Usado por el card informativo del dashboard -- toma el día hábil más reciente del rango (nunca el actual, ver `calcularRangoConsulta`). */
export function parsearRespuestaBcu(xml: string): CotizacionBcu | null {
  const cotizaciones = parsearCotizacionesBcu(xml);
  return cotizaciones.length === 0 ? null : cotizaciones[cotizaciones.length - 1];
}

async function consultarBcu(fechaDesde: string, fechaHasta: string): Promise<string> {
  const respuesta = await fetch(BCU_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': BCU_SOAP_ACTION,
    },
    body: construirSolicitudSoap(fechaDesde, fechaHasta),
  });

  if (!respuesta.ok) {
    throw new Error(`El BCU respondió con estado ${respuesta.status}`);
  }

  return respuesta.text();
}

export async function obtenerCotizacionBcu(hoy: Date = new Date()): Promise<CotizacionBcu> {
  const { fechaDesde, fechaHasta } = calcularRangoConsulta(hoy);
  const cotizacion = parsearRespuestaBcu(await consultarBcu(fechaDesde, fechaHasta));

  if (!cotizacion) {
    throw new Error('La respuesta del BCU no trajo cotizaciones para el rango consultado');
  }

  return cotizacion;
}

/**
 * TD-27 (2026-07-28): trae el histórico día-a-día para un rango arbitrario --
 * usado para poblar `cotizacion_bcu_cache` y poder resolver la cotización de
 * un asiento en dólares por su día hábil anterior, en vez de un único valor
 * manual por importación.
 */
export async function obtenerCotizacionesBcuRango(fechaDesde: string, fechaHasta: string): Promise<CotizacionBcu[]> {
  return parsearCotizacionesBcu(await consultarBcu(fechaDesde, fechaHasta));
}
