import type { MapeoAsignacionInicial } from '@/modules/mapeo-1376/mapeo-1376';
import type { AsientoLine } from '@/modules/parser/parse-asientos';
import { describe, expect, it } from 'vitest';
import { calcularTotalesLinea1376 } from './calcular-totales-1376';

function asiento(overrides: Partial<AsientoLine> = {}): AsientoLine {
  return {
    dia: 5,
    debe: '5215',
    haber: '11111',
    concepto: 'Concepto de prueba',
    rut: '233669988774',
    moneda: 0,
    total: 1000,
    codigoIva: 0,
    iva: 0,
    cotizacion: 0,
    libro: 'C',
    tipo: null,
    ...overrides,
  };
}

function fila(overrides: Partial<MapeoAsignacionInicial> = {}): MapeoAsignacionInicial {
  return {
    codigoLinea: '101',
    cuentaContable: '5215',
    lado: 'debe',
    columnaImporte: 'total',
    ...overrides,
  };
}

describe('calcularTotalesLinea1376', () => {
  it('sums the Total column for a cuenta mapped on the Debe side', () => {
    const asientos = [asiento({ debe: '5215', total: 1000 }), asiento({ debe: '5215', total: 500 })];
    const mapeo = [fila({ cuentaContable: '5215', lado: 'debe', columnaImporte: 'total' })];

    expect(calcularTotalesLinea1376(asientos, mapeo)).toEqual([{ codigoLinea: '101', importe: 1500 }]);
  });

  it('sums the IVA column for a cuenta mapped on the Haber side', () => {
    const asientos = [asiento({ debe: '', haber: '2131', iva: 180 })];
    const mapeo = [fila({ cuentaContable: '2131', lado: 'haber', columnaImporte: 'iva' })];

    expect(calcularTotalesLinea1376(asientos, mapeo)).toEqual([{ codigoLinea: '101', importe: 180 }]);
  });

  it('converts a USD movement using the cotización, same as the 2181', () => {
    const asientos = [asiento({ debe: '5215', total: 100, moneda: 1, cotizacion: 40 })];
    const mapeo = [fila({ cuentaContable: '5215', lado: 'debe', columnaImporte: 'total' })];

    expect(calcularTotalesLinea1376(asientos, mapeo)).toEqual([{ codigoLinea: '101', importe: 4000 }]);
  });

  it('nets a nota de crédito (negative importe) with simple sum, allowing a negative result', () => {
    const asientos = [asiento({ debe: '5215', total: 300 }), asiento({ debe: '5215', total: -500 })];
    const mapeo = [fila({ cuentaContable: '5215', lado: 'debe', columnaImporte: 'total' })];

    expect(calcularTotalesLinea1376(asientos, mapeo)).toEqual([{ codigoLinea: '101', importe: -200 }]);
  });

  it('omits a código whose mapped cuenta has no movement in the period', () => {
    const asientos = [asiento({ debe: '9999', total: 1000 })];
    const mapeo = [fila({ cuentaContable: '5215', lado: 'debe', columnaImporte: 'total' })];

    expect(calcularTotalesLinea1376(asientos, mapeo)).toEqual([]);
  });

  it('keeps two independently mapped códigos isolated from each other', () => {
    const asientos = [asiento({ debe: '5215', total: 1000 }), asiento({ debe: '', haber: '2131', total: 300 })];
    const mapeo = [
      fila({ codigoLinea: '101', cuentaContable: '5215', lado: 'debe', columnaImporte: 'total' }),
      fila({ codigoLinea: '502', cuentaContable: '2131', lado: 'haber', columnaImporte: 'total' }),
    ];

    expect(calcularTotalesLinea1376(asientos, mapeo)).toEqual([
      { codigoLinea: '101', importe: 1000 },
      { codigoLinea: '502', importe: 300 },
    ]);
  });

  it('returns an empty array when there is no mapeo', () => {
    expect(calcularTotalesLinea1376([asiento()], [])).toEqual([]);
  });
});
