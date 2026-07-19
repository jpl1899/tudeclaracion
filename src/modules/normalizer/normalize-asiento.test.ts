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

    expect(result).toEqual({ resolved: false, reason: 'sin-mapeo', rut: '233669988774', dia: 5, valor: 'Código IVA 7' });
  });

  it('resolves via Camino 2 for a compra (Libro C/E), reading the Debe account', () => {
    const planCuentas: PlanCuentaRow[] = [
      { cuentaContable: '5215', codigoPadi: '504', codigoIva: null },
    ];

    const result = resolveAsientoFiscal(
      asiento({ codigoIva: 0, libro: 'C', debe: '5215', total: 1000 }),
      planCuentas,
    );

    expect(result).toEqual({ resolved: true, codigoPadi: '504', importe: 1000, rut: '233669988774' });
  });

  it('resolves via Camino 2 for a venta (Libro V/I), reading the Haber account', () => {
    const planCuentas: PlanCuentaRow[] = [
      { cuentaContable: '4110', codigoPadi: '506', codigoIva: null },
    ];

    const result = resolveAsientoFiscal(
      asiento({ codigoIva: 0, libro: 'V', haber: '4110', total: 1500 }),
      planCuentas,
    );

    expect(result).toEqual({ resolved: true, codigoPadi: '506', importe: 1500, rut: '233669988774' });
  });

  it('does not resolve via Camino 2 when the cuenta contable is not configured', () => {
    const planCuentas: PlanCuentaRow[] = [];

    const result = resolveAsientoFiscal(asiento({ codigoIva: 0, libro: 'C', debe: '9999' }), planCuentas);

    expect(result).toEqual({ resolved: false, reason: 'sin-mapeo', rut: '233669988774', dia: 5, valor: 'cuenta 9999' });
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
        rut: '233669988774',
        dia: 5,
        valor: tipo,
      });
    }
  });

  it('libro "P" with Código IVA 0 is out of scope', () => {
    const planCuentas: PlanCuentaRow[] = [
      { cuentaContable: '5215', codigoPadi: '504', codigoIva: null },
    ];

    const result = resolveAsientoFiscal(asiento({ codigoIva: 0, libro: 'P' }), planCuentas);

    expect(result).toEqual({ resolved: false, reason: 'libro-fuera-de-alcance', rut: '233669988774', dia: 5, valor: 'P' });
  });

  it('excludes a line with importe 0, does not declare it', () => {
    const planCuentas: PlanCuentaRow[] = [
      { cuentaContable: '5215', codigoPadi: '504', codigoIva: null },
    ];

    const result = resolveAsientoFiscal(asiento({ codigoIva: 0, libro: 'C', debe: '5215', total: 0 }), planCuentas);

    expect(result).toEqual({ resolved: false, reason: 'importe-invalido', rut: '233669988774', dia: 5, valor: '0' });
  });

  it('excludes a line with a negative importe, never valid', () => {
    const planCuentas: PlanCuentaRow[] = [
      { cuentaContable: '5215', codigoPadi: '504', codigoIva: null },
    ];

    const result = resolveAsientoFiscal(asiento({ codigoIva: 0, libro: 'C', debe: '5215', total: -500 }), planCuentas);

    expect(result).toEqual({ resolved: false, reason: 'importe-invalido', rut: '233669988774', dia: 5, valor: '-500' });
  });

  it('applies the same importe validation to the Código IVA path', () => {
    const planCuentas: PlanCuentaRow[] = [
      { cuentaContable: '5215', codigoPadi: '502', codigoIva: 3 },
    ];

    const result = resolveAsientoFiscal(asiento({ codigoIva: 3, iva: 0 }), planCuentas);

    expect(result).toEqual({ resolved: false, reason: 'importe-invalido', rut: '233669988774', dia: 5, valor: '0' });
  });

  it('tipo 504 is also subject to importe validation', () => {
    const planCuentas: PlanCuentaRow[] = [];

    const result = resolveAsientoFiscal(asiento({ tipo: '504', total: -1 }), planCuentas);

    expect(result).toEqual({ resolved: false, reason: 'importe-invalido', rut: '233669988774', dia: 5, valor: '-1' });
  });
});
