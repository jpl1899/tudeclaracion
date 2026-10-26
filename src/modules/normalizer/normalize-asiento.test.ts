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

  it('excludes the line when Camino 1 resolves a venta account (prefix 2) but Libro is a compra libro -- reproduces the accountant-reported TXT bug', () => {
    const planCuentas: PlanCuentaRow[] = [
      { cuentaContable: '2131', codigoPadi: '502', codigoIva: 3 },
    ];

    const result = resolveAsientoFiscal(asiento({ codigoIva: 3, iva: 180.33, libro: 'E' }), planCuentas);

    expect(result).toEqual({
      resolved: false,
      reason: 'codigo-iva-libro-inconsistente',
      rut: '233669988774',
      dia: 5,
      valor: expect.stringContaining('2131'),
    });
  });

  it('resolves via Camino 1 when the venta account prefix (2) is consistent with Libro', () => {
    const planCuentas: PlanCuentaRow[] = [
      { cuentaContable: '2131', codigoPadi: '502', codigoIva: 3 },
    ];

    const result = resolveAsientoFiscal(asiento({ codigoIva: 3, iva: 180.33, libro: 'V' }), planCuentas);

    expect(result).toEqual({ resolved: true, codigoPadi: '502', importe: 180.33, rut: '233669988774' });
  });

  it('does not resolve via Camino 1 when the Código IVA is not configured', () => {
    const planCuentas: PlanCuentaRow[] = [
      { cuentaContable: '5215', codigoPadi: '502', codigoIva: 3 },
    ];

    const result = resolveAsientoFiscal(asiento({ codigoIva: 7, iva: 50 }), planCuentas);

    expect(result).toEqual({ resolved: false, reason: 'sin-mapeo', rut: '233669988774', dia: 5, valor: 'Código IVA 7' });
  });

  it('resolves via Camino 2 by matching the Debe account when the account has no venta/compra prefix (1/2)', () => {
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

  it('resolves via Camino 2 through a cuenta de IVA (prefix 2) when Libro is a venta libro (V/I)', () => {
    const planCuentas: PlanCuentaRow[] = [
      { cuentaContable: '2131', codigoPadi: '502', codigoIva: null },
    ];

    const result = resolveAsientoFiscal(
      asiento({ codigoIva: 0, libro: 'V', debe: '2131', total: 1000 }),
      planCuentas,
    );

    expect(result).toEqual({ resolved: true, codigoPadi: '502', importe: 1000, rut: '233669988774' });
  });

  it('excludes the line when a venta account (prefix 2) comes with a compra Libro -- reproduces the accountant-reported TXT bug', () => {
    const planCuentas: PlanCuentaRow[] = [
      { cuentaContable: '2131', codigoPadi: '502', codigoIva: null },
    ];

    const result = resolveAsientoFiscal(
      asiento({ codigoIva: 0, libro: 'E', debe: '2131', total: 1000 }),
      planCuentas,
    );

    expect(result).toEqual({
      resolved: false,
      reason: 'libro-inconsistente',
      rut: '233669988774',
      dia: 5,
      valor: expect.stringContaining('2131'),
    });
  });

  it('excludes the line when a compra account (prefix 1) comes with a venta Libro', () => {
    const planCuentas: PlanCuentaRow[] = [
      { cuentaContable: '1131', codigoPadi: '552', codigoIva: null },
    ];

    const result = resolveAsientoFiscal(
      asiento({ codigoIva: 0, libro: 'V', debe: '1131', total: 1000 }),
      planCuentas,
    );

    expect(result).toEqual({
      resolved: false,
      reason: 'libro-inconsistente',
      rut: '233669988774',
      dia: 5,
      valor: expect.stringContaining('1131'),
    });
  });

  it('does not flag Libro inconsistency via Camino 2 when Total is negative -- reproduces the accountant-reported nota de crédito (cuenta 11332, Libro I, Total -66)', () => {
    const planCuentas: PlanCuentaRow[] = [
      { cuentaContable: '11332', codigoPadi: '505', codigoIva: null },
    ];

    const result = resolveAsientoFiscal(
      asiento({ codigoIva: 0, libro: 'I', debe: '11332', total: -66 }),
      planCuentas,
    );

    expect(result).toEqual({ resolved: true, codigoPadi: '505', importe: -66, rut: '233669988774' });
  });

  it('does not flag Libro inconsistency via Camino 1 when Total is negative (nota de crédito resuelta por Código IVA directo)', () => {
    const planCuentas: PlanCuentaRow[] = [
      { cuentaContable: '1131', codigoPadi: '505', codigoIva: 3 },
    ];

    const result = resolveAsientoFiscal(
      asiento({ codigoIva: 3, iva: -180.33, libro: 'V', total: -1000 }),
      planCuentas,
    );

    expect(result).toEqual({ resolved: true, codigoPadi: '505', importe: -180.33, rut: '233669988774' });
  });

  it('picks the candidate consistent with Libro when both Debe and Haber match the plan de cuentas', () => {
    const planCuentas: PlanCuentaRow[] = [
      { cuentaContable: '2131', codigoPadi: '502', codigoIva: null },
      { cuentaContable: '1131', codigoPadi: '552', codigoIva: null },
    ];

    const result = resolveAsientoFiscal(
      asiento({ codigoIva: 0, libro: 'E', debe: '2131', haber: '1131', total: 1000 }),
      planCuentas,
    );

    expect(result).toEqual({ resolved: true, codigoPadi: '552', importe: 1000, rut: '233669988774' });
  });

  it('does not resolve via Camino 2 when neither Debe nor Haber is configured', () => {
    const planCuentas: PlanCuentaRow[] = [];

    const result = resolveAsientoFiscal(asiento({ codigoIva: 0, libro: 'C', debe: '9999', haber: '8888' }), planCuentas);

    expect(result).toEqual({ resolved: false, reason: 'sin-mapeo', rut: '233669988774', dia: 5, valor: 'cuenta 9999 / 8888' });
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

  it('libro "P" no longer blocks Camino 2 — resolves like any other libro (revertido 2026-07-21)', () => {
    const planCuentas: PlanCuentaRow[] = [
      { cuentaContable: '5215', codigoPadi: '504', codigoIva: null },
    ];

    const result = resolveAsientoFiscal(asiento({ codigoIva: 0, libro: 'P', debe: '5215' }), planCuentas);

    expect(result).toEqual({ resolved: true, codigoPadi: '504', importe: 1000, rut: '233669988774' });
  });

  it('converts the importe to pesos using cotizacion when the asiento is in dólares (Camino 1)', () => {
    const planCuentas: PlanCuentaRow[] = [
      { cuentaContable: '5215', codigoPadi: '502', codigoIva: 3 },
    ];

    const result = resolveAsientoFiscal(
      asiento({ codigoIva: 3, iva: 100, moneda: 1, cotizacion: 40 }),
      planCuentas,
    );

    expect(result).toEqual({ resolved: true, codigoPadi: '502', importe: 4000, rut: '233669988774' });
  });

  it('converts the importe to pesos using cotizacion when the asiento is in dólares (Camino 2)', () => {
    const planCuentas: PlanCuentaRow[] = [
      { cuentaContable: '5215', codigoPadi: '504', codigoIva: null },
    ];

    const result = resolveAsientoFiscal(
      asiento({ codigoIva: 0, debe: '5215', total: 100, moneda: 1, cotizacion: 40 }),
      planCuentas,
    );

    expect(result).toEqual({ resolved: true, codigoPadi: '504', importe: 4000, rut: '233669988774' });
  });

  it('does not convert the importe when the asiento is already in pesos', () => {
    const planCuentas: PlanCuentaRow[] = [
      { cuentaContable: '5215', codigoPadi: '504', codigoIva: null },
    ];

    const result = resolveAsientoFiscal(
      asiento({ codigoIva: 0, debe: '5215', total: 100, moneda: 0, cotizacion: 40 }),
      planCuentas,
    );

    expect(result).toEqual({ resolved: true, codigoPadi: '504', importe: 100, rut: '233669988774' });
  });

  it('excludes a line with importe 0, does not declare it', () => {
    const planCuentas: PlanCuentaRow[] = [
      { cuentaContable: '5215', codigoPadi: '504', codigoIva: null },
    ];

    const result = resolveAsientoFiscal(asiento({ codigoIva: 0, libro: 'C', debe: '5215', total: 0 }), planCuentas);

    expect(result).toEqual({ resolved: false, reason: 'importe-invalido', rut: '233669988774', dia: 5, valor: '0' });
  });

  it('applies the same importe validation to the Código IVA path', () => {
    const planCuentas: PlanCuentaRow[] = [
      { cuentaContable: '5215', codigoPadi: '502', codigoIva: 3 },
    ];

    const result = resolveAsientoFiscal(asiento({ codigoIva: 3, iva: 0 }), planCuentas);

    expect(result).toEqual({ resolved: false, reason: 'importe-invalido', rut: '233669988774', dia: 5, valor: '0' });
  });

  it('excludes a line that resolves to the 2181 but carries a RUT that is not 12 digits (ADR-0008, second barrier after the parser)', () => {
    const planCuentas: PlanCuentaRow[] = [
      { cuentaContable: '5215', codigoPadi: '502', codigoIva: 3 },
    ];

    const result = resolveAsientoFiscal(asiento({ codigoIva: 3, iva: 180.33, rut: 'FAC 1234' }), planCuentas);

    expect(result).toEqual({ resolved: false, reason: 'rut-invalido', rut: 'FAC 1234', dia: 5, valor: 'FAC 1234' });
  });

  it('reports sin-mapeo, not rut-invalido, for a line outside the 2181 with a non-RUT value (ej. anticipo de IRAE 13122 contra caja 11111)', () => {
    const result = resolveAsientoFiscal(asiento({ debe: '13122', haber: '11111', rut: 'FAC 1234' }), []);

    expect(result).toMatchObject({ resolved: false, reason: 'sin-mapeo' });
  });

  it('resolves a negative importe via Camino 2 -- represents a nota de crédito to be neteada downstream (corregido 2026-07-27)', () => {
    const planCuentas: PlanCuentaRow[] = [
      { cuentaContable: '21332', codigoPadi: '504', codigoIva: null },
    ];

    const result = resolveAsientoFiscal(asiento({ codigoIva: 0, libro: 'V', debe: '', haber: '21332', total: -110 }), planCuentas);

    expect(result).toEqual({ resolved: true, codigoPadi: '504', importe: -110, rut: '233669988774' });
  });

  it('resolves a negative importe via Código IVA directo -- same nota de crédito treatment as Camino 2', () => {
    const planCuentas: PlanCuentaRow[] = [
      { cuentaContable: '5215', codigoPadi: '502', codigoIva: 3 },
    ];

    const result = resolveAsientoFiscal(asiento({ codigoIva: 3, iva: -50 }), planCuentas);

    expect(result).toEqual({ resolved: true, codigoPadi: '502', importe: -50, rut: '233669988774' });
  });

  it('tipo 504 also resolves a negative importe (same shared guard as the other two caminos)', () => {
    const planCuentas: PlanCuentaRow[] = [];

    const result = resolveAsientoFiscal(asiento({ tipo: '504', total: -1 }), planCuentas);

    expect(result).toEqual({ resolved: true, codigoPadi: '504', importe: -1, rut: '233669988774' });
  });

  it('rounds the converted importe up when the decimal part is above .50 (confirmado con el contador 2026-08-19: 103.54 x 39.748 = 4115.50792 -> 4116)', () => {
    const planCuentas: PlanCuentaRow[] = [
      { cuentaContable: '5215', codigoPadi: '504', codigoIva: null },
    ];

    const result = resolveAsientoFiscal(
      asiento({ codigoIva: 0, debe: '5215', total: 103.54, moneda: 1, cotizacion: 39.748 }),
      planCuentas,
    );

    expect(result).toEqual({ resolved: true, codigoPadi: '504', importe: 4116, rut: '233669988774' });
  });

  it('rounds the converted importe down when the decimal part is exactly .50 (mitad hacia abajo, no el redondeo estándar de JS)', () => {
    const planCuentas: PlanCuentaRow[] = [
      { cuentaContable: '5215', codigoPadi: '504', codigoIva: null },
    ];

    const result = resolveAsientoFiscal(
      asiento({ codigoIva: 0, debe: '5215', total: 1, moneda: 1, cotizacion: 38.5 }),
      planCuentas,
    );

    expect(result).toEqual({ resolved: true, codigoPadi: '504', importe: 38, rut: '233669988774' });
  });

  it('rounds a negative converted importe using the same mitad-hacia-abajo rule (nota de crédito en dólares)', () => {
    const planCuentas: PlanCuentaRow[] = [
      { cuentaContable: '21332', codigoPadi: '504', codigoIva: null },
    ];

    const result = resolveAsientoFiscal(
      asiento({ codigoIva: 0, libro: 'V', debe: '', haber: '21332', total: -103.54, moneda: 1, cotizacion: 39.748 }),
      planCuentas,
    );

    expect(result).toEqual({ resolved: true, codigoPadi: '504', importe: -4116, rut: '233669988774' });
  });
});
