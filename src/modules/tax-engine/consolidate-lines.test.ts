import type { NormalizedAsiento } from '@/modules/normalizer/normalize-asiento';
import { describe, expect, it } from 'vitest';
import { consolidarLineasDeclaracion } from './consolidate-lines';

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
      { resolved: false, reason: 'sin-mapeo' },
      { resolved: false, reason: 'tipo-fuera-de-alcance' },
    ];

    const result = consolidarLineasDeclaracion(resueltos);

    expect(result).toEqual([{ rut: '233669988774', codigoPadi: '502', importe: 500 }]);
  });

  it('returns an empty array when there is nothing to consolidate', () => {
    expect(consolidarLineasDeclaracion([])).toEqual([]);
  });
});
