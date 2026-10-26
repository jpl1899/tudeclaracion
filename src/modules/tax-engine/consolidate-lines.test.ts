import type { NormalizedAsiento } from '@/modules/normalizer/normalize-asiento';
import { describe, expect, it } from 'vitest';
import { consolidarLineasDeclaracion, detectarLineasSinSaldoPositivo } from './consolidate-lines';

function resuelto(overrides: Partial<Extract<NormalizedAsiento, { resolved: true }>> = {}): NormalizedAsiento {
  return {
    resolved: true,
    codigoPadi: '502',
    importe: 100,
    rut: '233669988774',
    ...overrides,
  };
}

describe('consolidarLineasDeclaracion', () => {
  it('consolidates two asientos with the same RUT and codigo PADI into one summed line', () => {
    const resueltos = [
      resuelto({ importe: 500 }),
      resuelto({ importe: 300 }),
    ];

    const result = consolidarLineasDeclaracion(resueltos);

    expect(result).toEqual([{ rut: '233669988774', codigoPadi: '502', importe: 800 }]);
  });

  it('keeps separate lines for the same RUT with different codigo PADI', () => {
    const resueltos = [
      resuelto({ codigoPadi: '504', importe: 500 }),
      resuelto({ codigoPadi: '506', importe: 300 }),
    ];

    const result = consolidarLineasDeclaracion(resueltos);

    expect(result).toEqual([
      { rut: '233669988774', codigoPadi: '504', importe: 500 },
      { rut: '233669988774', codigoPadi: '506', importe: 300 },
    ]);
  });

  it('passes a single unmatched asiento through unchanged', () => {
    const resueltos = [resuelto({ importe: 250 })];

    const result = consolidarLineasDeclaracion(resueltos);

    expect(result).toEqual([{ rut: '233669988774', codigoPadi: '502', importe: 250 }]);
  });

  it('excludes unresolved asientos from every line and sum', () => {
    const resueltos: NormalizedAsiento[] = [
      resuelto({ importe: 500 }),
      { resolved: false, reason: 'sin-mapeo', rut: '233669988774', dia: 3, valor: 'cuenta 9999' },
      { resolved: false, reason: 'tipo-fuera-de-alcance', rut: '233669988774', dia: 4, valor: 'CIE' },
    ];

    const result = consolidarLineasDeclaracion(resueltos);

    expect(result).toEqual([{ rut: '233669988774', codigoPadi: '502', importe: 500 }]);
  });

  it('returns an empty array when there is nothing to consolidate', () => {
    expect(consolidarLineasDeclaracion([])).toEqual([]);
  });

  it('nets a nota de crédito (negative importe) against the positive asiento of the same RUT+código PADI (corregido 2026-07-27)', () => {
    const resueltos = [
      resuelto({ importe: 220 }),
      resuelto({ importe: -110 }),
    ];

    const result = consolidarLineasDeclaracion(resueltos);

    expect(result).toEqual([{ rut: '233669988774', codigoPadi: '502', importe: 110 }]);
  });

  it('excludes a line whose net lands at exactly 0 -- venta cancelada por su propia nota de crédito', () => {
    const resueltos = [
      resuelto({ importe: 500 }),
      resuelto({ importe: -500 }),
    ];

    expect(consolidarLineasDeclaracion(resueltos)).toEqual([]);
  });

  it('excludes a line whose net lands negative -- nota de crédito mayor a la venta del período', () => {
    const resueltos = [
      resuelto({ importe: 500 }),
      resuelto({ importe: -600 }),
    ];

    expect(consolidarLineasDeclaracion(resueltos)).toEqual([]);
  });
});

describe('detectarLineasSinSaldoPositivo', () => {
  it('returns the consolidated lines whose net is 0 or negative, with their net', () => {
    const resueltos = [
      resuelto({ codigoPadi: '502', importe: 500 }),
      resuelto({ codigoPadi: '502', importe: -600 }),
      resuelto({ codigoPadi: '504', importe: 300 }),
      resuelto({ codigoPadi: '504', importe: -300 }),
      resuelto({ codigoPadi: '506', importe: 100 }),
    ];

    expect(detectarLineasSinSaldoPositivo(resueltos)).toEqual([
      { rut: '233669988774', codigoPadi: '502', importe: -100 },
      { rut: '233669988774', codigoPadi: '504', importe: 0 },
    ]);
  });

  it('returns nothing when every line nets positive', () => {
    expect(detectarLineasSinSaldoPositivo([resuelto({ importe: 100 })])).toEqual([]);
  });
});
