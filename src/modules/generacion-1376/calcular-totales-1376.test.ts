import type { MapeoAsignacionInicial } from '@/modules/mapeo-1376/mapeo-1376';
import type { AsientoLine } from '@/modules/parser/parse-asientos';
import { describe, expect, it } from 'vitest';
import { asientosDelMotor1376, calcularTotalesLinea1376 } from './calcular-totales-1376';

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
    codigoIva: null,
    codigoLinea: '101',
    cuentaContable: '5215',
    lado: 'debe',
    ...overrides,
  };
}

describe('calcularTotalesLinea1376', () => {
  describe('asiento abierto (Código IVA = 0)', () => {
    it('sums the Total column for a cuenta mapped on the Debe side', () => {
      const asientos = [asiento({ debe: '5215', total: 1000 }), asiento({ debe: '5215', total: 500 })];
      const mapeo = [fila({ cuentaContable: '5215', lado: 'debe' })];

      expect(calcularTotalesLinea1376(asientos, mapeo)).toEqual([{ codigoLinea: '101', importe: 1500 }]);
    });

    it('sums the Total column for a cuenta mapped on the Haber side', () => {
      const asientos = [asiento({ debe: '', haber: '2131', total: 180, iva: 99 })];
      const mapeo = [fila({ cuentaContable: '2131', lado: 'haber' })];

      expect(calcularTotalesLinea1376(asientos, mapeo)).toEqual([{ codigoLinea: '101', importe: 180 }]);
    });

    it('ignores the cuenta when it sits on the other side', () => {
      const asientos = [asiento({ debe: '11111', haber: '5215', total: 1000 })];
      const mapeo = [fila({ cuentaContable: '5215', lado: 'debe' })];

      expect(calcularTotalesLinea1376(asientos, mapeo)).toEqual([]);
    });
  });

  describe('formato rápido (Código IVA > 0)', () => {
    it('sums the IVA column of movements whose Código IVA matches the row', () => {
      const asientos = [
        asiento({ codigoIva: 2, debe: '11111', haber: '41001', total: 1220, iva: 220 }),
        asiento({ codigoIva: 2, debe: '11111', haber: '41001', total: 610, iva: 110 }),
      ];
      const mapeo = [fila({ codigoIva: 2, cuentaContable: '2131', lado: 'haber' })];

      expect(calcularTotalesLinea1376(asientos, mapeo)).toEqual([{ codigoLinea: '101', importe: 330 }]);
    });

    it('ignores a movement with another Código IVA', () => {
      const asientos = [asiento({ codigoIva: 3, iva: 100 })];
      const mapeo = [fila({ codigoIva: 2 })];

      expect(calcularTotalesLinea1376(asientos, mapeo)).toEqual([]);
    });

    it('does not match a formato rápido movement by account, even when the cuenta is on the row side', () => {
      const asientos = [asiento({ codigoIva: 3, debe: '5215', total: 1000, iva: 220 })];
      const mapeo = [fila({ codigoIva: null, cuentaContable: '5215', lado: 'debe' })];

      expect(calcularTotalesLinea1376(asientos, mapeo)).toEqual([]);
    });
  });

  it('combines both formats in the same row, counting each movement once', () => {
    const asientos = [
      asiento({ codigoIva: 2, debe: '11111', haber: '2131', total: 1220, iva: 220 }),
      asiento({ codigoIva: 0, debe: '11111', haber: '2131', total: 110, iva: 0 }),
    ];
    const mapeo = [fila({ codigoIva: 2, cuentaContable: '2131', lado: 'haber' })];

    expect(calcularTotalesLinea1376(asientos, mapeo)).toEqual([{ codigoLinea: '101', importe: 330 }]);
  });

  it('nets notas de crédito in both formats with a simple signed sum', () => {
    const asientos = [
      asiento({ codigoIva: 2, iva: 220 }),
      asiento({ codigoIva: 2, iva: -50 }),
      asiento({ codigoIva: 0, debe: '5215', total: 100 }),
      asiento({ codigoIva: 0, debe: '5215', total: -400 }),
    ];
    const mapeo = [fila({ codigoIva: 2, cuentaContable: '5215', lado: 'debe' })];

    expect(calcularTotalesLinea1376(asientos, mapeo)).toEqual([{ codigoLinea: '101', importe: -130 }]);
  });

  it('converts USD movements using the cotización in both formats, same as the 2181', () => {
    const asientos = [
      asiento({ codigoIva: 0, debe: '5215', total: 100, moneda: 1, cotizacion: 40 }),
      asiento({ codigoIva: 2, iva: 10, moneda: 1, cotizacion: 40 }),
    ];
    const mapeo = [fila({ codigoIva: 2, cuentaContable: '5215', lado: 'debe' })];

    expect(calcularTotalesLinea1376(asientos, mapeo)).toEqual([{ codigoLinea: '101', importe: 4400 }]);
  });

  it('keeps a row whose movements net to zero', () => {
    const asientos = [asiento({ debe: '5215', total: 300 }), asiento({ debe: '5215', total: -300 })];

    expect(calcularTotalesLinea1376(asientos, [fila()])).toEqual([{ codigoLinea: '101', importe: 0 }]);
  });

  it('omits a código with no movement in the period', () => {
    const asientos = [asiento({ debe: '9999', total: 1000 })];

    expect(calcularTotalesLinea1376(asientos, [fila({ codigoIva: 2 })])).toEqual([]);
  });

  it('keeps two independently mapped códigos isolated from each other', () => {
    const asientos = [
      asiento({ debe: '5215', total: 1000 }),
      asiento({ codigoIva: 3, debe: '', haber: '2131', iva: 300 }),
    ];
    const mapeo = [
      fila({ codigoLinea: '101', codigoIva: 2, cuentaContable: '5215', lado: 'debe' }),
      fila({ codigoLinea: '502', codigoIva: 3, cuentaContable: '2131', lado: 'haber' }),
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

describe('asientosDelMotor1376', () => {
  it('drops cierre, resultados and apertura asientos', () => {
    const asientos = [
      asiento({ tipo: 'CIE' }),
      asiento({ tipo: 'RES' }),
      asiento({ tipo: 'APE' }),
    ];

    expect(asientosDelMotor1376(asientos)).toEqual([]);
  });

  it('keeps asientos without Tipo, Tipo 504 and DIF', () => {
    const asientos = [
      asiento({ tipo: null }),
      asiento({ tipo: '504' }),
      asiento({ tipo: 'DIF' }),
    ];

    expect(asientosDelMotor1376(asientos)).toEqual(asientos);
  });
});
