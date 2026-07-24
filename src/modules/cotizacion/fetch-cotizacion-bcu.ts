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
 * cotizaciones vienen ordenadas por fecha ascendente -- se toma el último
 * bloque `datoscotizaciones.dato` como el día hábil más reciente del rango.
 */
export function parsearRespuestaBcu(xml: string): CotizacionBcu | null {
  const status = xml.match(/<status>(\d+)<\/status>/)?.[1];
  if (status !== '1') {
    return null;
  }

  const bloques = [...xml.matchAll(/<datoscotizaciones\.dato[^>]*>([\s\S]*?)<\/datoscotizaciones\.dato>/g)];
  if (bloques.length === 0) {
    return null;
  }

  const ultimoBloque = bloques[bloques.length - 1][1];
  const fecha = ultimoBloque.match(/<Fecha>([\d-]+)<\/Fecha>/)?.[1];
  const valor = ultimoBloque.match(/<TCC>([\d.]+)<\/TCC>/)?.[1];

  if (fecha === undefined || valor === undefined) {
    return null;
  }

  return { fecha, valor: Number(valor) };
}

export async function obtenerCotizacionBcu(hoy: Date = new Date()): Promise<CotizacionBcu> {
  const { fechaDesde, fechaHasta } = calcularRangoConsulta(hoy);

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

  const cotizacion = parsearRespuestaBcu(await respuesta.text());
  if (!cotizacion) {
    throw new Error('La respuesta del BCU no trajo cotizaciones para el rango consultado');
  }

  return cotizacion;
}
