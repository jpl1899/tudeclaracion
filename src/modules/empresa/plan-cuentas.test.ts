import { describe, expect, it } from 'vitest';
import { buildOpcionesCodigoPadi, CODIGOS_PADI_IVA, opcionIdDeCodigoPadi } from './plan-cuentas';

describe('buildOpcionesCodigoPadi', () => {
  it('includes every non-colliding 2181 code with a 2181-prefixed id and its plain label', () => {
    const opciones = buildOpcionesCodigoPadi([]);

    for (const opt of CODIGOS_PADI_IVA) {
      expect(opciones).toContainEqual({ id: `2181-${opt.value}`, codigoPadi: opt.value, declaracion: '2181', label: opt.label });
    }
  });

  it('includes every non-colliding 1376 code with a 1376-prefixed id and a composed label', () => {
    const opciones = buildOpcionesCodigoPadi([
      { codigo: '101', concepto: 'Ventas gravadas tasa básica (22%)' },
    ]);

    expect(opciones).toContainEqual({ id: '1376-101', codigoPadi: '101', declaracion: '1376', label: '101 — Ventas gravadas tasa básica (22%)' });
  });

  it('keeps the 2181 and 1376 entries for a colliding code (502) as two distinct, selectable options', () => {
    const opciones = buildOpcionesCodigoPadi([{ codigo: '502', concepto: 'Débito fiscal IVA ventas' }]);
    const con502 = opciones.filter(o => o.codigoPadi === '502');

    expect(con502).toHaveLength(2);
    expect(new Set(con502.map(o => o.id)).size).toBe(2);
  });

  it('prefixes the declaración jurada number on both labels for a colliding code (502), so the contador can tell them apart', () => {
    const opciones = buildOpcionesCodigoPadi([{ codigo: '502', concepto: 'Débito fiscal IVA ventas' }]);

    expect(opciones).toContainEqual({ id: '2181-502', codigoPadi: '502', declaracion: '2181', label: '2181-502 — IVA ventas tasa básica' });
    expect(opciones).toContainEqual({ id: '1376-502', codigoPadi: '502', declaracion: '1376', label: '1376-502 — Débito fiscal IVA ventas' });
  });
});

describe('opcionIdDeCodigoPadi', () => {
  const opciones = buildOpcionesCodigoPadi([
    { codigo: '101', concepto: 'Ventas gravadas tasa básica (22%)' },
    { codigo: '502', concepto: 'Débito fiscal IVA ventas' },
  ]);

  it('restores a 2181 row to its 2181 option', () => {
    expect(opcionIdDeCodigoPadi(opciones, { codigoPadi: '505', declaracion: '2181' })).toBe('2181-505');
  });

  it('restores a 1376 row to its 1376 option', () => {
    expect(opcionIdDeCodigoPadi(opciones, { codigoPadi: '101', declaracion: '1376' })).toBe('1376-101');
  });

  it('tells a shared code apart by its declaration', () => {
    expect(opcionIdDeCodigoPadi(opciones, { codigoPadi: '502', declaracion: '2181' })).toBe('2181-502');
    expect(opcionIdDeCodigoPadi(opciones, { codigoPadi: '502', declaracion: '1376' })).toBe('1376-502');
  });

  it('falls back to any option with the code when the pair is not offered', () => {
    expect(opcionIdDeCodigoPadi(opciones, { codigoPadi: '101', declaracion: '2181' })).toBe('1376-101');
  });

  it('falls back to the raw code when no option matches', () => {
    expect(opcionIdDeCodigoPadi(opciones, { codigoPadi: '999', declaracion: '2181' })).toBe('999');
  });
});
