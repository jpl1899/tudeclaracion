import { describe, expect, it } from 'vitest';
import { calcularRangoConsulta, calcularRangoConsultaPeriodo, parsearCotizacionesBcu, parsearRespuestaBcu } from './fetch-cotizacion-bcu';

const RESPUESTA_OK = `<?xml version="1.0" encoding="utf-8"?>
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">
<SOAP-ENV:Body>
<wsbcucotizaciones.ExecuteResponse xmlns="Cotiza">
<Salida xmlns="Cotiza">
<respuestastatus>
<status>1</status>
<codigoerror>0</codigoerror>
<mensaje/>
</respuestastatus>
<datoscotizaciones>
<datoscotizaciones.dato xmlns="Cotiza">
<Fecha>2024-01-02</Fecha>
<Moneda>2230</Moneda>
<Nombre>DLS.PROMED.FONDO</Nombre>
<CodigoISO>U$A</CodigoISO>
<Emisor>URUGUAY</Emisor>
<TCC>39.092000</TCC>
<TCV>39.092000</TCV>
<ArbAct>1.000000</ArbAct>
<FormaArbitrar>0</FormaArbitrar>
</datoscotizaciones.dato>
<datoscotizaciones.dato xmlns="Cotiza">
<Fecha>2024-01-05</Fecha>
<Moneda>2230</Moneda>
<Nombre>DLS.PROMED.FONDO</Nombre>
<CodigoISO>U$A</CodigoISO>
<Emisor>URUGUAY</Emisor>
<TCC>39.325000</TCC>
<TCV>39.325000</TCV>
<ArbAct>1.000000</ArbAct>
<FormaArbitrar>0</FormaArbitrar>
</datoscotizaciones.dato>
</datoscotizaciones>
</Salida>
</wsbcucotizaciones.ExecuteResponse>
</SOAP-ENV:Body>
</SOAP-ENV:Envelope>`;

const RESPUESTA_SIN_DATOS = `<?xml version="1.0" encoding="utf-8"?>
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">
<SOAP-ENV:Body>
<wsbcucotizaciones.ExecuteResponse xmlns="Cotiza">
<Salida xmlns="Cotiza">
<respuestastatus>
<status>1</status>
<codigoerror>0</codigoerror>
<mensaje/>
</respuestastatus>
<datoscotizaciones/>
</Salida>
</wsbcucotizaciones.ExecuteResponse>
</SOAP-ENV:Body>
</SOAP-ENV:Envelope>`;

const RESPUESTA_ERROR = `<?xml version="1.0" encoding="utf-8"?>
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/">
<SOAP-ENV:Body>
<wsbcucotizaciones.ExecuteResponse xmlns="Cotiza">
<Salida xmlns="Cotiza">
<respuestastatus>
<status>0</status>
<codigoerror>99</codigoerror>
<mensaje>Error interno</mensaje>
</respuestastatus>
<datoscotizaciones/>
</Salida>
</wsbcucotizaciones.ExecuteResponse>
</SOAP-ENV:Body>
</SOAP-ENV:Envelope>`;

describe('parsearRespuestaBcu', () => {
  it('takes the most recent cotización when the range returns several business days', () => {
    expect(parsearRespuestaBcu(RESPUESTA_OK)).toEqual({ fecha: '2024-01-05', valor: 39.325 });
  });

  it('returns null when the BCU reports an error status', () => {
    expect(parsearRespuestaBcu(RESPUESTA_ERROR)).toBeNull();
  });

  it('returns null when the range has no cotizaciones (e.g. all non-business days)', () => {
    expect(parsearRespuestaBcu(RESPUESTA_SIN_DATOS)).toBeNull();
  });
});

describe('calcularRangoConsulta', () => {
  it('asks for the 10 days before yesterday, never including today', () => {
    const hoy = new Date('2026-07-24T12:00:00Z');

    expect(calcularRangoConsulta(hoy)).toEqual({ fechaDesde: '2026-07-13', fechaHasta: '2026-07-23' });
  });
});

describe('parsearCotizacionesBcu', () => {
  it('returns every business day in the range, in the order the BCU sends them', () => {
    expect(parsearCotizacionesBcu(RESPUESTA_OK)).toEqual([
      { fecha: '2024-01-02', valor: 39.092 },
      { fecha: '2024-01-05', valor: 39.325 },
    ]);
  });

  it('returns an empty array when the BCU reports an error status', () => {
    expect(parsearCotizacionesBcu(RESPUESTA_ERROR)).toEqual([]);
  });

  it('returns an empty array when the range has no cotizaciones', () => {
    expect(parsearCotizacionesBcu(RESPUESTA_SIN_DATOS)).toEqual([]);
  });
});

describe('calcularRangoConsultaPeriodo', () => {
  it('covers the whole período plus a buffer before day 1, for a closed período', () => {
    const hoy = new Date('2026-08-05T12:00:00Z');

    expect(calcularRangoConsultaPeriodo('202607', hoy)).toEqual({ fechaDesde: '2026-06-21', fechaHasta: '2026-07-31' });
  });

  it('caps fechaHasta at yesterday when the período is still ongoing', () => {
    const hoy = new Date('2026-07-28T12:00:00Z');

    expect(calcularRangoConsultaPeriodo('202607', hoy)).toEqual({ fechaDesde: '2026-06-21', fechaHasta: '2026-07-27' });
  });
});
