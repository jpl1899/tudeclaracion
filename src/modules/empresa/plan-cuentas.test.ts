import { describe, expect, it } from 'vitest';
import { buildOpcionesCodigoPadi, CODIGOS_PADI_IVA } from './plan-cuentas';

describe('buildOpcionesCodigoPadi', () => {
  it('includes every 2181 code with a 2181-prefixed id', () => {
    const opciones = buildOpcionesCodigoPadi([]);

    for (const opt of CODIGOS_PADI_IVA) {
      expect(opciones).toContainEqual({ id: `2181-${opt.value}`, codigoPadi: opt.value, label: opt.label });
    }
  });

  it('includes every 1376 code with a 1376-prefixed id and a composed label', () => {
    const opciones = buildOpcionesCodigoPadi([
      { codigo: '101', concepto: 'Ventas gravadas tasa básica (22%)' },
      { codigo: '502', concepto: 'Débito fiscal IVA ventas' },
    ]);

    expect(opciones).toContainEqual({ id: '1376-101', codigoPadi: '101', label: '101 — Ventas gravadas tasa básica (22%)' });
    expect(opciones).toContainEqual({ id: '1376-502', codigoPadi: '502', label: '502 — Débito fiscal IVA ventas' });
  });

  it('keeps the 2181 and 1376 entries for a colliding code (502) as two distinct, selectable options', () => {
    const opciones = buildOpcionesCodigoPadi([{ codigo: '502', concepto: 'Débito fiscal IVA ventas' }]);
    const con502 = opciones.filter(o => o.codigoPadi === '502');

    expect(con502).toHaveLength(2);
    expect(new Set(con502.map(o => o.id)).size).toBe(2);
  });
});
