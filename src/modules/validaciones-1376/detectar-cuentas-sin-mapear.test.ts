import type { AsientoLine } from '@/modules/parser/parse-asientos';
import { describe, expect, it } from 'vitest';
import { detectarCuentasSinMapear } from './detectar-cuentas-sin-mapear';

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

const codigosLinea = ['101', '102'];

describe('detectarCuentasSinMapear', () => {
  it('returns nothing when every 1376-relevant cuenta with movement is mapped', () => {
    const resultado = detectarCuentasSinMapear({
      asientos: [asiento({ debe: '5215' })],
      planCuentas: [{ cuentaContable: '5215', codigoPadi: '101' }],
      codigosLinea,
      cuentasMapeadas: ['5215'],
    });

    expect(resultado).toEqual([]);
  });

  it('flags a 1376-relevant cuenta with movement on the Debe side that is not mapped', () => {
    const resultado = detectarCuentasSinMapear({
      asientos: [asiento({ debe: '5215' })],
      planCuentas: [{ cuentaContable: '5215', codigoPadi: '101' }],
      codigosLinea,
      cuentasMapeadas: [],
    });

    expect(resultado).toEqual([{ cuentaContable: '5215', codigoLinea: '101' }]);
  });

  it('flags a 1376-relevant cuenta with movement on the Haber side', () => {
    const resultado = detectarCuentasSinMapear({
      asientos: [asiento({ debe: '', haber: '2131' })],
      planCuentas: [{ cuentaContable: '2131', codigoPadi: '102' }],
      codigosLinea,
      cuentasMapeadas: [],
    });

    expect(resultado).toEqual([{ cuentaContable: '2131', codigoLinea: '102' }]);
  });

  it('ignores a relevant cuenta without movement in the period', () => {
    const resultado = detectarCuentasSinMapear({
      asientos: [asiento({ debe: '9999', haber: '8888' })],
      planCuentas: [{ cuentaContable: '5215', codigoPadi: '101' }],
      codigosLinea,
      cuentasMapeadas: [],
    });

    expect(resultado).toEqual([]);
  });

  it('ignores cuentas whose codigo PADI is not a 1376 line code (2181-only accounts)', () => {
    const resultado = detectarCuentasSinMapear({
      asientos: [asiento({ debe: '5215' })],
      planCuentas: [{ cuentaContable: '5215', codigoPadi: '504' }],
      codigosLinea,
      cuentasMapeadas: [],
    });

    expect(resultado).toEqual([]);
  });

  it('lists each unmapped cuenta once, sorted, even with several movements', () => {
    const resultado = detectarCuentasSinMapear({
      asientos: [asiento({ debe: '5215' }), asiento({ debe: '5215' }), asiento({ debe: '', haber: '2131' })],
      planCuentas: [
        { cuentaContable: '5215', codigoPadi: '101' },
        { cuentaContable: '2131', codigoPadi: '102' },
      ],
      codigosLinea,
      cuentasMapeadas: [],
    });

    expect(resultado).toEqual([
      { cuentaContable: '2131', codigoLinea: '102' },
      { cuentaContable: '5215', codigoLinea: '101' },
    ]);
  });
});
