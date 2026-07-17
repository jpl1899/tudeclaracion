import type { LineaDeclaracion } from '@/modules/tax-engine/consolidate-lines';
import { describe, expect, it } from 'vitest';
import { generarArchivoPadi } from './generate-padi-file';

describe('generarArchivoPadi', () => {
  it('formats a single line matching the confirmed 7-field structure', () => {
    const lineas: LineaDeclaracion[] = [
      { rut: '101593570014', codigoPadi: '502', importe: 2322 },
    ];

    const resultado = generarArchivoPadi({ rut: '212583570018', periodo: '201612' }, lineas);

    expect(resultado).toBe('212583570018;02181;201612;101593570014;201612;502;000000002322;');
  });

  it('formats multiple lines, one per row, newline-separated', () => {
    const lineas: LineaDeclaracion[] = [
      { rut: '101593570014', codigoPadi: '502', importe: 2322 },
      { rut: '121593570012', codigoPadi: '503', importe: 1104 },
    ];

    const resultado = generarArchivoPadi({ rut: '212583570018', periodo: '201612' }, lineas);

    expect(resultado).toBe(
      '212583570018;02181;201612;101593570014;201612;502;000000002322;\n'
      + '212583570018;02181;201612;121593570012;201612;503;000000001104;',
    );
  });

  it('pads the importe to 12 digits with leading zeros', () => {
    const lineas: LineaDeclaracion[] = [
      { rut: '101593570014', codigoPadi: '502', importe: 5 },
    ];

    const resultado = generarArchivoPadi({ rut: '212583570018', periodo: '201612' }, lineas);

    expect(resultado).toContain(';000000000005;');
  });

  it('returns an empty string when there are no lines to export', () => {
    expect(generarArchivoPadi({ rut: '212583570018', periodo: '201612' }, [])).toBe('');
  });

  it('keeps the importe field unsigned digits even for a negative amount', () => {
    const lineas: LineaDeclaracion[] = [
      { rut: '101593570014', codigoPadi: '502', importe: -500 },
    ];

    const resultado = generarArchivoPadi({ rut: '212583570018', periodo: '201612' }, lineas);

    expect(resultado).toContain(';000000000500;');
  });

  it('always rounds a fractional importe up, never to the nearest integer', () => {
    const lineas: LineaDeclaracion[] = [
      { rut: '101593570014', codigoPadi: '502', importe: 180.33 },
    ];

    const resultado = generarArchivoPadi({ rut: '212583570018', periodo: '201612' }, lineas);

    expect(resultado).toContain(';000000000181;');
  });
});
