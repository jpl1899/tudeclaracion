import type { PlanCuentaRow } from './normalize-asiento';
import type { AsientoLine } from '@/modules/parser/parse-asientos';
import { describe, expect, it } from 'vitest';
import { resolveAsientoFiscal } from './normalize-asiento';

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

describe('resolveAsientoFiscal', () => {
  it('resolves via Camino 1 (Código IVA directo) when the code is configured', () => {
    const planCuentas: PlanCuentaRow[] = [
      { cuentaContable: '5215', codigoPadi: '502', codigoIva: 3 },
    ];

    const result = resolveAsientoFiscal(asiento({ codigoIva: 3, iva: 180.33 }), planCuentas);

    expect(result).toEqual({ resolved: true, codigoPadi: '502', importe: 180.33, rut: '233669988774' });
  });

  it('does not resolve via Camino 1 when the Código IVA is not configured', () => {
    const planCuentas: PlanCuentaRow[] = [
      { cuentaContable: '5215', codigoPadi: '502', codigoIva: 3 },
    ];

    const result = resolveAsientoFiscal(asiento({ codigoIva: 7, iva: 50 }), planCuentas);

    expect(result).toEqual({ resolved: false, reason: 'sin-mapeo' });
  });

  it('resolves via Camino 2 by matching the Debe account, regardless of Libro', () => {
    const planCuentas: PlanCuentaRow[] = [
      { cuentaContable: '5215', codigoPadi: '504', codigoIva: null },
    ];

    const result = resolveAsientoFiscal(
      asiento({ codigoIva: 0, libro: 'V', debe: '5215', total: 1000 }),
      planCuentas,
    );

    expect(result).toEqual({ resolved: true, codigoPadi: '504', importe: 1000, rut: '233669988774' });
  });

  it('resolves via Camino 2 by matching the Haber account when Debe has no mapping', () => {
    const planCuentas: PlanCuentaRow[] = [
      { cuentaContable: '4110', codigoPadi: '506', codigoIva: null },
    ];

    const result = resolveAsientoFiscal(
      asiento({ codigoIva: 0, libro: 'C', debe: '9999', haber: '4110', total: 1500 }),
      planCuentas,
    );

    expect(result).toEqual({ resolved: true, codigoPadi: '506', importe: 1500, rut: '233669988774' });
  });

  it('resolves an asiento abierto (multi-line) with an empty Debe by matching Haber', () => {
    const planCuentas: PlanCuentaRow[] = [
      { cuentaContable: '21332', codigoPadi: '502', codigoIva: null },
    ];

    const result = resolveAsientoFiscal(
      asiento({ codigoIva: 0, libro: 'V', debe: '', haber: '21332', total: 220 }),
      planCuentas,
    );

    expect(result).toEqual({ resolved: true, codigoPadi: '502', importe: 220, rut: '233669988774' });
  });

  it('does not resolve via Camino 2 when neither Debe nor Haber is configured', () => {
    const planCuentas: PlanCuentaRow[] = [];

    const result = resolveAsientoFiscal(asiento({ codigoIva: 0, libro: 'C', debe: '9999', haber: '8888' }), planCuentas);

    expect(result).toEqual({ resolved: false, reason: 'sin-mapeo' });
  });

  it('tipo 504 takes priority and skips the plan de cuentas lookup entirely', () => {
    const planCuentas: PlanCuentaRow[] = [];

    const result = resolveAsientoFiscal(asiento({ tipo: '504', codigoIva: 3, total: 1500 }), planCuentas);

    expect(result).toEqual({ resolved: true, codigoPadi: '504', importe: 1500, rut: '233669988774' });
  });

  it('unsupported alphabetic Tipo values are out of scope', () => {
    const planCuentas: PlanCuentaRow[] = [];

    for (const tipo of ['CIE', 'RES', 'DIF', 'APE'] as const) {
      expect(resolveAsientoFiscal(asiento({ tipo }), planCuentas)).toEqual({
        resolved: false,
        reason: 'tipo-fuera-de-alcance',
      });
    }
  });

  it('libro "P" no longer blocks Camino 2 — resolves like any other libro (revertido 2026-07-21)', () => {
    const planCuentas: PlanCuentaRow[] = [
      { cuentaContable: '5215', codigoPadi: '504', codigoIva: null },
    ];

    const result = resolveAsientoFiscal(asiento({ codigoIva: 0, libro: 'P', debe: '5215' }), planCuentas);

    expect(result).toEqual({ resolved: true, codigoPadi: '504', importe: 1000, rut: '233669988774' });
  });
});
