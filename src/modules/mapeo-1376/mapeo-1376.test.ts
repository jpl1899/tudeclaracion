import type { MapeoFila } from './mapeo-1376';
import { describe, expect, it } from 'vitest';
import {
  combinarCatalogoConAsignaciones,
  construirFilasParaGuardar,
  filaIncompleta,
  validarMapeo,
} from './mapeo-1376';

const CATALOGO = [
  { codigo: '101', concepto: 'Ventas gravadas tasa básica (22%)' },
  { codigo: '501', concepto: 'Crédito fiscal IVA compras' },
  { codigo: '502', concepto: 'Débito fiscal IVA ventas' },
];

function fila(over: Partial<MapeoFila>): MapeoFila {
  return { codigoLinea: '101', concepto: 'x', cuentaContable: '', lado: '', columnaImporte: '', ...over };
}

describe('combinarCatalogoConAsignaciones', () => {
  it('devuelve una fila por código del catálogo, vacías cuando no hay asignación', () => {
    const filas = combinarCatalogoConAsignaciones(CATALOGO, []);

    expect(filas).toHaveLength(3);
    expect(filas.every(f => f.cuentaContable === '' && f.lado === '' && f.columnaImporte === '')).toBe(true);
  });

  it('precarga la cuenta, el lado y la columna de una asignación existente', () => {
    const filas = combinarCatalogoConAsignaciones(CATALOGO, [
      { codigoLinea: '502', cuentaContable: '21301', lado: 'haber', columnaImporte: 'iva' },
    ]);

    expect(filas.find(f => f.codigoLinea === '502')).toEqual({
      codigoLinea: '502',
      concepto: 'Débito fiscal IVA ventas',
      cuentaContable: '21301',
      lado: 'haber',
      columnaImporte: 'iva',
    });
  });
});

describe('filaIncompleta', () => {
  it('es falsa para una fila totalmente vacía (ese código no mapea)', () => {
    expect(filaIncompleta(fila({}))).toBe(false);
  });

  it('es verdadera cuando hay cuenta pero falta el lado', () => {
    expect(filaIncompleta(fila({ cuentaContable: '51001', columnaImporte: 'total' }))).toBe(true);
  });

  it('es verdadera cuando hay cuenta pero falta la columna de importe', () => {
    expect(filaIncompleta(fila({ cuentaContable: '51001', lado: 'haber' }))).toBe(true);
  });

  it('es falsa cuando la fila está completa', () => {
    expect(filaIncompleta(fila({ cuentaContable: '51001', lado: 'haber', columnaImporte: 'total' }))).toBe(false);
  });
});

describe('validarMapeo', () => {
  it('acepta un tablero totalmente vacío', () => {
    expect(validarMapeo(combinarCatalogoConAsignaciones(CATALOGO, []))).toBeNull();
  });

  it('rechaza una fila con cuenta pero incompleta y nombra el código', () => {
    const filas = [fila({ codigoLinea: '101', cuentaContable: '51001', lado: 'haber' })];

    expect(validarMapeo(filas)).toContain('101');
  });

  it('rechaza la misma cuenta en dos códigos (biyección) y nombra ambos', () => {
    const filas = [
      fila({ codigoLinea: '501', cuentaContable: '21301', lado: 'debe', columnaImporte: 'iva' }),
      fila({ codigoLinea: '502', cuentaContable: '21301', lado: 'haber', columnaImporte: 'iva' }),
    ];

    const msg = validarMapeo(filas);
    expect(msg).toContain('501');
    expect(msg).toContain('502');
    expect(msg).toContain('21301');
  });

  it('acepta un mapeo válido con varias cuentas distintas', () => {
    const filas = [
      fila({ codigoLinea: '501', cuentaContable: '21301', lado: 'debe', columnaImporte: 'iva' }),
      fila({ codigoLinea: '502', cuentaContable: '21302', lado: 'haber', columnaImporte: 'iva' }),
    ];

    expect(validarMapeo(filas)).toBeNull();
  });
});

describe('construirFilasParaGuardar', () => {
  it('omite las filas sin cuenta y devuelve solo las completas en snake_case', () => {
    const filas = [
      fila({ codigoLinea: '101', cuentaContable: '51001', lado: 'haber', columnaImporte: 'total' }),
      fila({ codigoLinea: '201', cuentaContable: '', lado: '', columnaImporte: '' }),
    ];

    expect(construirFilasParaGuardar(filas)).toEqual([
      { codigo_linea: '101', cuenta_contable: '51001', lado: 'haber', columna_importe: 'total' },
    ]);
  });

  it('devuelve un array vacío cuando ninguna fila tiene cuenta', () => {
    expect(construirFilasParaGuardar(combinarCatalogoConAsignaciones(CATALOGO, []))).toEqual([]);
  });

  it('recorta espacios de la cuenta contable', () => {
    const filas = [fila({ codigoLinea: '101', cuentaContable: '  51001 ', lado: 'debe', columnaImporte: 'total' })];

    expect(construirFilasParaGuardar(filas)[0].cuenta_contable).toBe('51001');
  });
});
