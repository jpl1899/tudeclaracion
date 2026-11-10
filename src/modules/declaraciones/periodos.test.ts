import { describe, expect, it } from 'vitest';
import { armarPeriodos } from './periodos';

describe('armarPeriodos', () => {
  it('marks a period complete when both declaraciones are generated', () => {
    const resultado = armarPeriodos(
      [{ periodo: '202608', estado: 'generada', updated_at: '2026-09-10T10:00:00Z' }],
      [{ periodo: '202608', estado: 'generada', updated_at: '2026-09-15T10:00:00Z' }],
    );

    expect(resultado).toEqual([{
      periodo: '202608',
      estado2181: 'generada',
      estado1376: 'generada',
      completo: true,
      updatedAt: '2026-09-15T10:00:00Z',
    }]);
  });

  it('shows the 1376 as pending when it has no row yet', () => {
    const [periodo] = armarPeriodos(
      [{ periodo: '202609', estado: 'generada', updated_at: '2026-10-20T10:00:00Z' }],
      [],
    );

    expect(periodo.estado1376).toBe('abierta');
    expect(periodo.completo).toBe(false);
    expect(periodo.updatedAt).toBe('2026-10-20T10:00:00Z');
  });

  it('keeps a period incomplete when only the 1376 is generated', () => {
    const [periodo] = armarPeriodos(
      [{ periodo: '202609', estado: 'abierta', updated_at: '2026-10-20T10:00:00Z' }],
      [{ periodo: '202609', estado: 'generada', updated_at: '2026-10-19T10:00:00Z' }],
    );

    expect(periodo.completo).toBe(false);
    expect(periodo.updatedAt).toBe('2026-10-20T10:00:00Z');
  });

  it('keeps the 2181 order and pairs each period with its own 1376', () => {
    const resultado = armarPeriodos(
      [
        { periodo: '202609', estado: 'abierta', updated_at: '2026-10-20T10:00:00Z' },
        { periodo: '202608', estado: 'generada', updated_at: '2026-09-10T10:00:00Z' },
      ],
      [{ periodo: '202608', estado: 'generada', updated_at: '2026-09-11T10:00:00Z' }],
    );

    expect(resultado.map(p => [p.periodo, p.estado1376, p.completo])).toEqual([
      ['202609', 'abierta', false],
      ['202608', 'generada', true],
    ]);
  });
});
