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
  return { codigoIva: '', codigoLinea: '101', concepto: 'x', cuentaContable: '', lado: '', ...over };
}

describe('combinarCatalogoConAsignaciones', () => {
  it('devuelve una fila por código del catálogo, vacías cuando no hay asignación', () => {
    const filas = combinarCatalogoConAsignaciones(CATALOGO, []);

    expect(filas).toHaveLength(3);
    expect(filas.every(f => f.codigoIva === '' && f.cuentaContable === '' && f.lado === '')).toBe(true);
  });

  it('precarga el código de IVA, la cuenta y el lado de una asignación existente', () => {
    const filas = combinarCatalogoConAsignaciones(CATALOGO, [
      { codigoIva: 3, codigoLinea: '502', cuentaContable: '21301', lado: 'haber' },
    ]);

    expect(filas.find(f => f.codigoLinea === '502')).toEqual({
      codigoIva: '3',
      codigoLinea: '502',
      concepto: 'Débito fiscal IVA ventas',
      cuentaContable: '21301',
      lado: 'haber',
    });
  });

  it('deja el código de IVA vacío en una asignación guardada sin código', () => {
    const filas = combinarCatalogoConAsignaciones(CATALOGO, [
      { codigoIva: null, codigoLinea: '502', cuentaContable: '21301', lado: 'haber' },
    ]);

    expect(filas.find(f => f.codigoLinea === '502')?.codigoIva).toBe('');
  });

  it('td-40: precarga la cuenta y el código de IVA sugeridos del plan de cuentas cuando no hay asignación guardada', () => {
    const filas = combinarCatalogoConAsignaciones(CATALOGO, [], [
      { codigoPadi: '101', cuentaContable: '41001', codigoIva: 2 },
    ]);

    expect(filas.find(f => f.codigoLinea === '101')).toEqual({
      codigoIva: '2',
      codigoLinea: '101',
      concepto: 'Ventas gravadas tasa básica (22%)',
      cuentaContable: '41001',
      lado: '',
    });
  });

  it('td-40: una asignación guardada gana sobre la sugerencia del plan de cuentas, también en el código de IVA', () => {
    const filas = combinarCatalogoConAsignaciones(
      CATALOGO,
      [{ codigoIva: null, codigoLinea: '101', cuentaContable: '41005', lado: 'debe' }],
      [{ codigoPadi: '101', cuentaContable: '41001', codigoIva: 2 }],
    );

    expect(filas.find(f => f.codigoLinea === '101')).toEqual({
      codigoIva: '',
      codigoLinea: '101',
      concepto: 'Ventas gravadas tasa básica (22%)',
      cuentaContable: '41005',
      lado: 'debe',
    });
  });

  it('td-40: sin sugerencia que matchee, la fila queda vacía como antes', () => {
    const filas = combinarCatalogoConAsignaciones(CATALOGO, [], [
      { codigoPadi: '999', cuentaContable: '41001', codigoIva: 2 },
    ]);

    expect(filas.find(f => f.codigoLinea === '101')).toEqual({
      codigoIva: '',
      codigoLinea: '101',
      concepto: 'Ventas gravadas tasa básica (22%)',
      cuentaContable: '',
      lado: '',
    });
  });
});

describe('filaIncompleta', () => {
  it('es falsa para una fila totalmente vacía (ese código no mapea)', () => {
    expect(filaIncompleta(fila({}))).toBe(false);
  });

  it('es verdadera cuando hay cuenta pero falta el lado', () => {
    expect(filaIncompleta(fila({ cuentaContable: '51001' }))).toBe(true);
  });

  it('es verdadera cuando hay código de IVA pero falta la cuenta', () => {
    expect(filaIncompleta(fila({ codigoIva: '2', lado: 'haber' }))).toBe(true);
  });

  it('es falsa con cuenta y lado, sin código de IVA (solo asientos abiertos)', () => {
    expect(filaIncompleta(fila({ cuentaContable: '51001', lado: 'haber' }))).toBe(false);
  });

  it('es falsa cuando la fila está completa con código de IVA', () => {
    expect(filaIncompleta(fila({ codigoIva: '2', cuentaContable: '51001', lado: 'haber' }))).toBe(false);
  });
});

describe('validarMapeo', () => {
  it('acepta un tablero totalmente vacío', () => {
    expect(validarMapeo(combinarCatalogoConAsignaciones(CATALOGO, []))).toBeNull();
  });

  it('rechaza una fila con cuenta pero incompleta y nombra el código', () => {
    const filas = [fila({ codigoLinea: '101', cuentaContable: '51001' })];

    expect(validarMapeo(filas)).toContain('101');
  });

  it.each(['0', '10', 'a', '2.5'])('rechaza el código de IVA inválido %s y nombra el código de línea', (codigoIva) => {
    const filas = [fila({ codigoLinea: '101', codigoIva, cuentaContable: '51001', lado: 'haber' })];

    const msg = validarMapeo(filas);
    expect(msg).toContain('101');
    expect(msg).toContain('código de IVA inválido');
  });

  it('rechaza la misma cuenta en dos códigos (biyección) y nombra ambos', () => {
    const filas = [
      fila({ codigoLinea: '501', cuentaContable: '21301', lado: 'debe' }),
      fila({ codigoLinea: '502', cuentaContable: '21301', lado: 'haber' }),
    ];

    const msg = validarMapeo(filas);
    expect(msg).toContain('501');
    expect(msg).toContain('502');
    expect(msg).toContain('21301');
  });

  it('rechaza el mismo código de IVA en dos códigos y nombra ambos', () => {
    const filas = [
      fila({ codigoLinea: '501', codigoIva: '2', cuentaContable: '21301', lado: 'debe' }),
      fila({ codigoLinea: '502', codigoIva: '2', cuentaContable: '21302', lado: 'haber' }),
    ];

    const msg = validarMapeo(filas);
    expect(msg).toContain('código de IVA 2');
    expect(msg).toContain('501');
    expect(msg).toContain('502');
  });

  it('acepta un mapeo válido con cuentas y códigos de IVA distintos, y filas sin código', () => {
    const filas = [
      fila({ codigoLinea: '501', codigoIva: '2', cuentaContable: '21301', lado: 'debe' }),
      fila({ codigoLinea: '502', codigoIva: '3', cuentaContable: '21302', lado: 'haber' }),
      fila({ codigoLinea: '101', cuentaContable: '41001', lado: 'haber' }),
    ];

    expect(validarMapeo(filas)).toBeNull();
  });
});

describe('construirFilasParaGuardar', () => {
  it('omite las filas vacías y devuelve solo las completas en snake_case', () => {
    const filas = [
      fila({ codigoLinea: '101', codigoIva: '2', cuentaContable: '51001', lado: 'haber' }),
      fila({ codigoLinea: '201' }),
    ];

    expect(construirFilasParaGuardar(filas)).toEqual([
      { codigo_iva: '2', codigo_linea: '101', cuenta_contable: '51001', lado: 'haber' },
    ]);
  });

  it('manda el código de IVA en null cuando la fila no lo tiene', () => {
    const filas = [fila({ codigoLinea: '101', cuentaContable: '51001', lado: 'haber' })];

    expect(construirFilasParaGuardar(filas)[0].codigo_iva).toBeNull();
  });

  it('devuelve un array vacío cuando ninguna fila tiene datos', () => {
    expect(construirFilasParaGuardar(combinarCatalogoConAsignaciones(CATALOGO, []))).toEqual([]);
  });

  it('recorta espacios de la cuenta contable y del código de IVA', () => {
    const filas = [fila({ codigoLinea: '101', codigoIva: ' 2 ', cuentaContable: '  51001 ', lado: 'debe' })];

    expect(construirFilasParaGuardar(filas)[0]).toMatchObject({ codigo_iva: '2', cuenta_contable: '51001' });
  });
});
