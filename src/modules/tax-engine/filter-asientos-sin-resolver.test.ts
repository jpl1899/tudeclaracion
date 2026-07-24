import type { NormalizedAsiento } from '@/modules/normalizer/normalize-asiento';
import type { AsientoLine } from '@/modules/parser/parse-asientos';
import { describe, expect, it } from 'vitest';
import { filtrarAsientosSinResolver } from './filter-asientos-sin-resolver';

function asiento(overrides: Partial<AsientoLine> = {}): AsientoLine {
  return {
    dia: 9,
    debe: '',
    haber: '',
    concepto: 'Efactura A 5478',
    rut: '215487788992',
    moneda: 0,
    total: 1000,
    codigoIva: 0,
    iva: 0,
    cotizacion: 0,
    libro: 'V',
    tipo: null,
    ...overrides,
  };
}

function resuelto(overrides: Partial<Extract<NormalizedAsiento, { resolved: true }>> = {}): NormalizedAsiento {
  return { resolved: true, codigoPadi: '502', importe: 220, rut: '215487788992', ...overrides };
}

function sinMapeo(overrides: Partial<Extract<NormalizedAsiento, { resolved: false }>> = {}): NormalizedAsiento {
  return { resolved: false, reason: 'sin-mapeo', rut: '215487788992', dia: 9, valor: 'cuenta 1121001', ...overrides };
}

describe('filtrarAsientosSinResolver', () => {
  it('discards contrapartida lines from an asiento abierto whose IVA line already resolved', () => {
    const asientos = [
      asiento({ debe: '1121001', total: 1220 }),
      asiento({ haber: '21332', total: 220 }),
      asiento({ haber: '4102', total: 1000 }),
    ];
    const resueltos: NormalizedAsiento[] = [
      sinMapeo({ valor: 'cuenta 1121001' }),
      resuelto({ importe: 220 }),
      sinMapeo({ valor: 'cuenta 4102' }),
    ];

    expect(filtrarAsientosSinResolver(asientos, resueltos)).toEqual([]);
  });

  it('keeps a sin-mapeo asiento when no line in its group resolved', () => {
    const asientos = [asiento({ debe: '9999', concepto: 'Sin grupo' })];
    const resueltos: NormalizedAsiento[] = [sinMapeo({ valor: 'cuenta 9999' })];

    expect(filtrarAsientosSinResolver(asientos, resueltos)).toEqual(resueltos);
  });

  it('does not suppress importe-invalido or tipo-fuera-de-alcance even inside a resolved group', () => {
    const asientos = [
      asiento({ haber: '21332', total: 220 }),
      asiento({ debe: '5215', total: -1 }),
    ];
    const resueltos: NormalizedAsiento[] = [
      resuelto({ importe: 220 }),
      { resolved: false, reason: 'importe-invalido', rut: '215487788992', dia: 9, valor: '-1' },
    ];

    expect(filtrarAsientosSinResolver(asientos, resueltos)).toEqual([resueltos[1]]);
  });

  it('only suppresses contrapartidas within the same Dia+Concepto+Libro+RUT group, not across groups', () => {
    const asientos = [
      asiento({ haber: '21332', total: 220 }),
      asiento({ debe: '9999', concepto: 'Otro concepto', total: 500 }),
    ];
    const resueltos: NormalizedAsiento[] = [
      resuelto({ importe: 220 }),
      sinMapeo({ valor: 'cuenta 9999' }),
    ];

    expect(filtrarAsientosSinResolver(asientos, resueltos)).toEqual([resueltos[1]]);
  });

  it('returns an empty array when there is nothing unresolved', () => {
    expect(filtrarAsientosSinResolver([], [])).toEqual([]);
  });
});
