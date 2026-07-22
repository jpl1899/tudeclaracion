import { describe, expect, it } from 'vitest';
import { parseAsientosTxt } from './parse-asientos';

describe('parseAsientosTxt', () => {
  it('interprets a compra exenta line resolved by cuenta contable (Código IVA = 0)', () => {
    const content = '5,"5215","11111","Ancap Ticket A 12452548","233669988774",0,1000,0,0,0,"E",';

    const result = parseAsientosTxt(content);

    expect(result.ok).toBe(true);
    if (!result.ok) { return; }
    expect(result.lines).toEqual([
      {
        dia: 5,
        debe: '5215',
        haber: '11111',
        concepto: 'Ancap Ticket A 12452548',
        rut: '233669988774',
        moneda: 0,
        total: 1000,
        codigoIva: 0,
        iva: 0,
        cotizacion: 0,
        libro: 'E',
        tipo: null,
      },
    ]);
  });

  it('interprets a line resolved by a direct Código IVA (not 0)', () => {
    const content = '10,"1234","5678","Factura B 9999","123456789012",0,1000,3,180.33,0,"V",';

    const result = parseAsientosTxt(content);

    expect(result.ok).toBe(true);
    if (!result.ok) { return; }
    expect(result.lines[0].codigoIva).toBe(3);
    expect(result.lines[0].libro).toBe('V');
    expect(result.lines[0].total).toBe(1000);
  });

  it('parses an alphabetic Tipo value without interrupting interpretation', () => {
    const content = '15,"2000","3000","Cierre de ejercicio","123456789012",0,500,0,0,0,"P",CIE';

    const result = parseAsientosTxt(content);

    expect(result.ok).toBe(true);
    if (!result.ok) { return; }
    expect(result.lines[0].tipo).toBe('CIE');
  });

  it('parses the numeric Tipo value 504', () => {
    const content = '15,"2000","3000","Ajuste por 504","123456789012",0,500,0,0,0,"P",504';

    const result = parseAsientosTxt(content);

    expect(result.ok).toBe(true);
    if (!result.ok) { return; }
    expect(result.lines[0].tipo).toBe('504');
  });

  it('aborts the whole file and identifies the line and field when a value is invalid', () => {
    const content = '5,"5215","11111","Ancap Ticket A 12452548","233669988774",0,ABC,0,0,0,"E",';

    const result = parseAsientosTxt(content);

    expect(result).toEqual({
      ok: false,
      line: 1,
      field: 'Total',
      message: expect.stringContaining('ABC'),
    });
  });

  it('produces zero partial results when line 2 of a multi-line file is invalid', () => {
    const validLine = '5,"5215","11111","Ancap Ticket A 12452548","233669988774",0,1000,0,0,0,"E",';
    const invalidLine = '6,"5215","11111","Otro concepto","233669988774",0,1000,0,0,0,"Z",';
    const content = `${validLine}\n${invalidLine}`;

    const result = parseAsientosTxt(content);

    expect(result).toEqual({
      ok: false,
      line: 2,
      field: 'Libro',
      message: expect.stringContaining('Z'),
    });
  });

  it('rejects a RUT that is not exactly 12 digits', () => {
    const content = '5,"5215","11111","Ancap Ticket A 12452548","2336699887",0,1000,0,0,0,"E",';

    const result = parseAsientosTxt(content);

    expect(result).toEqual({
      ok: false,
      line: 1,
      field: 'RUT',
      message: expect.any(String),
    });
  });

  it('skips a leading header row and parses the data line that follows it', () => {
    const header = 'DIA,DEBE,HABER,CONCEPTO,RUT,MONEDA,TOTAL,CODIGOIVA,IVA,COTIZACION,LIBRO';
    const validLine = '5,"5215","11111","Ancap Ticket A 12452548","233669988774",0,1000,0,0,0,"E",';
    const content = `${header}\n${validLine}`;

    const result = parseAsientosTxt(content);

    expect(result.ok).toBe(true);
    if (!result.ok) { return; }
    expect(result.lines).toHaveLength(1);
    expect(result.lines[0].rut).toBe('233669988774');
  });

  it('parses correctly when the file has no header row', () => {
    const validLine = '5,"5215","11111","Ancap Ticket A 12452548","233669988774",0,1000,0,0,0,"E",';

    const result = parseAsientosTxt(validLine);

    expect(result.ok).toBe(true);
    if (!result.ok) { return; }
    expect(result.lines).toHaveLength(1);
  });

  it('reports the original file line number for an error after a skipped header', () => {
    const header = 'DIA,DEBE,HABER,CONCEPTO,RUT,MONEDA,TOTAL,CODIGOIVA,IVA,COTIZACION,LIBRO';
    const invalidLine = '6,"5215","11111","Otro concepto","233669988774",0,1000,0,0,0,"Z",';
    const content = `${header}\n${invalidLine}`;

    const result = parseAsientosTxt(content);

    expect(result).toEqual({
      ok: false,
      line: 2,
      field: 'Libro',
      message: expect.stringContaining('Z'),
    });
  });

  it('ignores trailing blank lines', () => {
    const validLine = '5,"5215","11111","Ancap Ticket A 12452548","233669988774",0,1000,0,0,0,"E",';
    const content = `${validLine}\n\n`;

    const result = parseAsientosTxt(content);

    expect(result.ok).toBe(true);
    if (!result.ok) { return; }
    expect(result.lines).toHaveLength(1);
  });
});
