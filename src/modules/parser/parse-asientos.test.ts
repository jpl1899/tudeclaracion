import { describe, expect, it } from 'vitest';
import { contarCamposPrimeraLineaDeDatos, derivarLayout, parseAsientosTxt } from './parse-asientos';

describe('parseAsientosTxt', () => {
  it('interprets a compra exenta line resolved by cuenta contable (Código IVA = 0)', () => {
    const content = '5,"5215","11111","Ancap Ticket A 12452548","233669988774",0,1000,0,0,0,"E",';

    const result = parseAsientosTxt(content, []);

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

    const result = parseAsientosTxt(content, []);

    expect(result.ok).toBe(true);
    if (!result.ok) { return; }
    expect(result.lines[0].codigoIva).toBe(3);
    expect(result.lines[0].libro).toBe('V');
    expect(result.lines[0].total).toBe(1000);
  });

  it('parses an alphabetic Tipo value without interrupting interpretation', () => {
    const content = '15,"2000","3000","Cierre de ejercicio","123456789012",0,500,0,0,0,"P",CIE';

    const result = parseAsientosTxt(content, []);

    expect(result.ok).toBe(true);
    if (!result.ok) { return; }
    expect(result.lines[0].tipo).toBe('CIE');
  });

  it('parses the numeric Tipo value 504', () => {
    const content = '15,"2000","3000","Ajuste por 504","123456789012",0,500,0,0,0,"P",504';

    const result = parseAsientosTxt(content, []);

    expect(result.ok).toBe(true);
    if (!result.ok) { return; }
    expect(result.lines[0].tipo).toBe('504');
  });

  it('aborts the whole file and identifies the line and field when a value is invalid', () => {
    const content = '5,"5215","11111","Ancap Ticket A 12452548","233669988774",0,ABC,0,0,0,"E",';

    const result = parseAsientosTxt(content, []);

    expect(result).toEqual({
      ok: false,
      line: 1,
      errors: [{ field: 'Total', message: expect.stringContaining('ABC') }],
    });
  });

  it('produces zero partial results when line 2 of a multi-line file is invalid', () => {
    const validLine = '5,"5215","11111","Ancap Ticket A 12452548","233669988774",0,1000,0,0,0,"E",';
    const invalidLine = '6,"5215","11111","Otro concepto","233669988774",0,1000,0,0,0,"Z",';
    const content = `${validLine}\n${invalidLine}`;

    const result = parseAsientosTxt(content, []);

    expect(result).toEqual({
      ok: false,
      line: 2,
      errors: [{ field: 'Libro', message: expect.stringContaining('Z') }],
    });
  });

  it('rejects a RUT that is not exactly 12 digits', () => {
    const content = '5,"5215","11111","Ancap Ticket A 12452548","2336699887",0,1000,0,0,0,"E",';

    const result = parseAsientosTxt(content, []);

    expect(result).toEqual({
      ok: false,
      line: 1,
      errors: [{ field: 'RUT', message: expect.any(String) }],
    });
  });

  it('reports every invalid field of the same line at once, not just the first one found', () => {
    const content = '5,"5215","11111","Ancap Ticket A 12452548","2336699887",9,1000,0,0,-5,"E",';

    const result = parseAsientosTxt(content, []);

    expect(result).toEqual({
      ok: false,
      line: 1,
      errors: [
        { field: 'RUT', message: expect.any(String) },
        { field: 'Moneda', message: expect.any(String) },
        { field: 'Cotización', message: expect.any(String) },
      ],
    });
  });

  it('accepts a cotización with two integer digits and two decimals', () => {
    const content = '5,"5215","11111","Ancap Ticket A 12452548","233669988774",1,1000,0,0,38.45,"E",';

    const result = parseAsientosTxt(content, []);

    expect(result.ok).toBe(true);
    if (!result.ok) { return; }
    expect(result.lines[0].cotizacion).toBe(38.45);
  });

  it('rejects a cotización that is not 0 nor at least two integer digits (el peso uruguayo nunca cotiza por debajo de 10)', () => {
    const content = '5,"5215","11111","Ancap Ticket A 12452548","233669988774",1,1000,0,0,8.4,"E",';

    const result = parseAsientosTxt(content, []);

    expect(result).toEqual({
      ok: false,
      line: 1,
      errors: [{ field: 'Cotización', message: expect.stringContaining('8.4') }],
    });
  });

  it('accepts a cotización with any number of decimals -- el TXT real trae la precisión cruda del banco/BCU (confirmado 2026-08-19)', () => {
    const content = '5,"5215","11111","Ancap Ticket A 12452548","233669988774",1,1000,0,0,39.60396039,"E",';

    const result = parseAsientosTxt(content, []);

    expect(result.ok).toBe(true);
    if (!result.ok) { return; }
    expect(result.lines[0].cotizacion).toBe(39.60396039);
  });

  it('accepts a cotización with no decimals at all', () => {
    const content = '5,"5215","11111","Ancap Ticket A 12452548","233669988774",1,1000,0,0,40,"E",';

    const result = parseAsientosTxt(content, []);

    expect(result.ok).toBe(true);
    if (!result.ok) { return; }
    expect(result.lines[0].cotizacion).toBe(40);
  });

  it('reports a Libro inconsistent with the cuenta resolved via Código IVA directo (Camino 1)', () => {
    const planCuentas = [{ cuentaContable: '2131', codigoPadi: '502', codigoIva: 3 }];
    // Reproduce el caso reportado por el contador: venta resuelta por Código IVA directo, con Libro 'E' (compra) por error.
    const content = '16,"1234","5678","Factura venta A 9999","233669988774",0,1000,3,180.33,0,"E",';

    const result = parseAsientosTxt(content, planCuentas);

    expect(result).toEqual({
      ok: false,
      line: 1,
      errors: [{ field: 'Libro', message: expect.stringContaining('2131') }],
    });
  });

  it('does not flag Libro for Código IVA directo when it is consistent with the resolved cuenta prefix', () => {
    const planCuentas = [{ cuentaContable: '2131', codigoPadi: '502', codigoIva: 3 }];
    const content = '16,"1234","5678","Factura venta A 9999","233669988774",0,1000,3,180.33,0,"V",';

    const result = parseAsientosTxt(content, planCuentas);

    expect(result.ok).toBe(true);
  });

  it('does not flag Libro for Código IVA directo when the código is not configured in the plan de cuentas', () => {
    const planCuentas: never[] = [];
    const content = '16,"1234","5678","Factura venta A 9999","233669988774",0,1000,3,180.33,0,"E",';

    const result = parseAsientosTxt(content, planCuentas);

    expect(result.ok).toBe(true);
  });

  it('reports a Libro inconsistent with the resolved cuenta de IVA prefix, alongside other invalid fields in the same line', () => {
    const planCuentas = [{ cuentaContable: '2131', codigoPadi: '502', codigoIva: null }];
    // Día 14, venta -- RUT, Moneda y Cotización inválidos, y Libro 'E' (compra) con una cuenta de venta (prefijo 2).
    const content = '14,"2131","11111","Factura venta A 555","2336699887",9,1000,0,0,-5,"E",';

    const result = parseAsientosTxt(content, planCuentas);

    expect(result).toEqual({
      ok: false,
      line: 1,
      errors: [
        { field: 'RUT', message: expect.any(String) },
        { field: 'Moneda', message: expect.any(String) },
        { field: 'Cotización', message: expect.any(String) },
        { field: 'Libro', message: expect.stringContaining('2131') },
      ],
    });
  });

  it('reports a Libro inconsistent with a compra account prefix (1) as its own error', () => {
    const planCuentas = [{ cuentaContable: '1131', codigoPadi: '552', codigoIva: null }];
    const content = '10,"1131","11111","Factura compra A 123","233669988774",0,1000,0,0,0,"V",';

    const result = parseAsientosTxt(content, planCuentas);

    expect(result).toEqual({
      ok: false,
      line: 1,
      errors: [{ field: 'Libro', message: expect.stringContaining('1131') }],
    });
  });

  it('does not flag Libro when the account does not match any entry in the plan de cuentas', () => {
    const planCuentas = [{ cuentaContable: '9999', codigoPadi: '502', codigoIva: null }];
    const content = '10,"2131","11111","Factura venta A 555","233669988774",0,1000,0,0,0,"E",';

    const result = parseAsientosTxt(content, planCuentas);

    expect(result.ok).toBe(true);
  });

  it('does not flag Libro when it is consistent with the resolved cuenta de IVA prefix', () => {
    const planCuentas = [{ cuentaContable: '2131', codigoPadi: '502', codigoIva: null }];
    const content = '10,"2131","11111","Factura venta A 555","233669988774",0,1000,0,0,0,"V",';

    const result = parseAsientosTxt(content, planCuentas);

    expect(result.ok).toBe(true);
  });

  it('does not flag Libro via Camino 2 when Total is negative -- reproduces the accountant-reported nota de crédito (cuenta 11332, Libro I, Total -66)', () => {
    const planCuentas = [{ cuentaContable: '11332', codigoPadi: '505', codigoIva: null }];
    const content = '2,"11332","","NC efactura A 9988","235487521253",1,-66,0,0,0,"I",';

    const result = parseAsientosTxt(content, planCuentas);

    expect(result.ok).toBe(true);
  });

  it('does not flag Libro via Código IVA directo (Camino 1) when Total is negative', () => {
    const planCuentas = [{ cuentaContable: '1131', codigoPadi: '505', codigoIva: 3 }];
    const content = '16,"1234","5678","NC compra A 123","233669988774",0,-1000,3,-180.33,0,"V",';

    const result = parseAsientosTxt(content, planCuentas);

    expect(result.ok).toBe(true);
  });

  it('skips a leading header row and parses the data line that follows it', () => {
    const header = 'DIA,DEBE,HABER,CONCEPTO,RUT,MONEDA,TOTAL,CODIGOIVA,IVA,COTIZACION,LIBRO';
    const validLine = '5,"5215","11111","Ancap Ticket A 12452548","233669988774",0,1000,0,0,0,"E",';
    const content = `${header}\n${validLine}`;

    const result = parseAsientosTxt(content, []);

    expect(result.ok).toBe(true);
    if (!result.ok) { return; }
    expect(result.lines).toHaveLength(1);
    expect(result.lines[0].rut).toBe('233669988774');
  });

  it('parses correctly when the file has no header row', () => {
    const validLine = '5,"5215","11111","Ancap Ticket A 12452548","233669988774",0,1000,0,0,0,"E",';

    const result = parseAsientosTxt(validLine, []);

    expect(result.ok).toBe(true);
    if (!result.ok) { return; }
    expect(result.lines).toHaveLength(1);
  });

  it('reports the original file line number for an error after a skipped header', () => {
    const header = 'DIA,DEBE,HABER,CONCEPTO,RUT,MONEDA,TOTAL,CODIGOIVA,IVA,COTIZACION,LIBRO';
    const invalidLine = '6,"5215","11111","Otro concepto","233669988774",0,1000,0,0,0,"Z",';
    const content = `${header}\n${invalidLine}`;

    const result = parseAsientosTxt(content, []);

    expect(result).toEqual({
      ok: false,
      line: 2,
      errors: [{ field: 'Libro', message: expect.stringContaining('Z') }],
    });
  });

  it('accepts a lowercase Libro value and normalizes it to uppercase', () => {
    const content = '8,"1121001","","NC E factura A 1122","215487788992",0,-610,0,0,0,"v",';

    const result = parseAsientosTxt(content, []);

    expect(result.ok).toBe(true);
    if (!result.ok) { return; }
    expect(result.lines[0].libro).toBe('V');
  });

  it('accepts an asiento abierto line with an empty Haber', () => {
    const content = '6,"1121001","","Efactura A 5478","215487788992",0,1220,0,0,0,"V",';

    const result = parseAsientosTxt(content, []);

    expect(result.ok).toBe(true);
    if (!result.ok) { return; }
    expect(result.lines[0]).toMatchObject({ debe: '1121001', haber: '' });
  });

  it('accepts an asiento abierto line with an empty Debe', () => {
    const content = '6,"","21332","Efactura A 5478","215487788992",0,220,0,0,0,"V",';

    const result = parseAsientosTxt(content, []);

    expect(result.ok).toBe(true);
    if (!result.ok) { return; }
    expect(result.lines[0]).toMatchObject({ debe: '', haber: '21332' });
  });

  it('rejects a line where both Debe and Haber are empty', () => {
    const content = '6,"","","Efactura A 5478","215487788992",0,220,0,0,0,"V",';

    const result = parseAsientosTxt(content, []);

    expect(result).toEqual({
      ok: false,
      line: 1,
      errors: [{ field: 'Debe/Haber', message: expect.any(String) }],
    });
  });

  it('parses a 13-field line (FMSSRL variant) when Número Asiento is declared, ignoring its value', () => {
    const content = '30,"54010","2111099","Paola Dagosti F34","217785620017",0,15381.76,1,2773.76,0,"C","",""';

    const result = parseAsientosTxt(content, [], new Set(['numeroAsiento']));

    expect(result.ok).toBe(true);
    if (!result.ok) { return; }
    expect(result.lines[0]).toMatchObject({ libro: 'C', tipo: null });
  });

  it('reads the numeric Tipo value 504 from its fixed position (12th field) in a 13-field line with Número Asiento declared', () => {
    const content = '9,"5424","2143","Factura de compra exenta","012547412548",0,3000,0,0,0,"E","504",""';

    const result = parseAsientosTxt(content, [], new Set(['numeroAsiento']));

    expect(result.ok).toBe(true);
    if (!result.ok) { return; }
    expect(result.lines[0].tipo).toBe('504');
  });

  it('rejects a 13-field line when no special columns are declared (ADR-0005 generalizes and replaces the old always-tolerant FMSSRL fix)', () => {
    const content = '30,"54010","2111099","Paola Dagosti F34","217785620017",0,15381.76,1,2773.76,0,"C","",""';

    const result = parseAsientosTxt(content, []);

    expect(result).toEqual({
      ok: false,
      line: 1,
      errors: [{ field: 'línea', message: expect.stringContaining('13') }],
    });
  });

  it('rejects a line with a field count that does not match the classic model (default, no special columns declared)', () => {
    const content = '5,"5215","11111","Ancap Ticket A 12452548","233669988774",0,1000,0,0,0,"E","",""," extra"';

    const result = parseAsientosTxt(content, []);

    expect(result).toEqual({
      ok: false,
      line: 1,
      errors: [{ field: 'línea', message: expect.stringContaining('14') }],
    });
  });

  it('accepts an 11-field classic line with Tipo fully omitted (no trailing comma)', () => {
    const content = '5,"5215","11111","Ancap Ticket A 12452548","233669988774",0,1000,0,0,0,"E"';

    const result = parseAsientosTxt(content, []);

    expect(result.ok).toBe(true);
    if (!result.ok) { return; }
    expect(result.lines[0]).toMatchObject({ libro: 'E', tipo: null });
  });

  it('rejects a line with a field count that does not match a declared special-column layout', () => {
    const content = '5,"5215","11111","Ancap Ticket A 12452548","233669988774",0,1000,0,0,0,"E",';

    const result = parseAsientosTxt(content, [], new Set(['costos', 'emision']));

    expect(result).toEqual({
      ok: false,
      line: 1,
      errors: [{ field: 'línea', message: expect.stringContaining('12') }],
    });
  });

  it('interprets a line with two special columns straddling Concepto, ignoring their values', () => {
    // Layout: Día, Debe, Haber, [C.Costos], Concepto, [Emisión], RUT, Moneda, Total, Código IVA, IVA, Cotización, Libro, Tipo
    const content = '5,"5215","11111","costos-value","Ancap Ticket A 12452548","emision-value","233669988774",0,1000,0,0,0,"E",';

    const result = parseAsientosTxt(content, [], new Set(['costos', 'emision']));

    expect(result.ok).toBe(true);
    if (!result.ok) { return; }
    expect(result.lines[0]).toMatchObject({ debe: '5215', haber: '11111', concepto: 'Ancap Ticket A 12452548', rut: '233669988774' });
  });

  it('treats an empty value in an enabled special column as blank, not as a missing/misaligned field', () => {
    const content = '5,"5215","11111","","Ancap Ticket A 12452548","233669988774",0,1000,0,0,0,"E",';

    const result = parseAsientosTxt(content, [], new Set(['costos']));

    expect(result.ok).toBe(true);
    if (!result.ok) { return; }
    expect(result.lines[0]).toMatchObject({ concepto: 'Ancap Ticket A 12452548' });
  });

  describe('derivarLayout', () => {
    it('returns the 12 mandatory fields in canonical order when no special columns are enabled', () => {
      expect(derivarLayout(new Set())).toEqual([
        'dia',
        'debe',
        'haber',
        'concepto',
        'rut',
        'moneda',
        'total',
        'codigoIva',
        'iva',
        'cotizacion',
        'libro',
        'tipo',
      ]);
    });

    it('places Número Asiento last, reproducing the FMSSRL fixed-position case', () => {
      const layout = derivarLayout(new Set(['numeroAsiento']));
      expect(layout).toHaveLength(13);
      expect(layout[layout.length - 1]).toBe('numeroAsiento');
      expect(layout[11]).toBe('tipo');
    });

    it('interleaves multiple special columns at their canonical relative positions', () => {
      expect(derivarLayout(new Set(['costos', 'emision']))).toEqual([
        'dia',
        'debe',
        'haber',
        'costos',
        'concepto',
        'emision',
        'rut',
        'moneda',
        'total',
        'codigoIva',
        'iva',
        'cotizacion',
        'libro',
        'tipo',
      ]);
    });
  });

  describe('contarCamposPrimeraLineaDeDatos', () => {
    it('counts the fields of the first data line when there is no header', () => {
      const content = '5,"5215","11111","Ancap Ticket A 12452548","233669988774",0,1000,0,0,0,"E",';
      expect(contarCamposPrimeraLineaDeDatos(content)).toBe(12);
    });

    it('skips the header row before counting', () => {
      const header = 'DIA,DEBE,HABER,CONCEPTO,RUT,MONEDA,TOTAL,CODIGOIVA,IVA,COTIZACION,LIBRO';
      const validLine = '5,"5215","11111","Ancap Ticket A 12452548","233669988774",0,1000,0,0,0,"E",';
      expect(contarCamposPrimeraLineaDeDatos(`${header}\n${validLine}`)).toBe(12);
    });

    it('returns 0 for an empty file', () => {
      expect(contarCamposPrimeraLineaDeDatos('')).toBe(0);
    });
  });

  it('ignores trailing blank lines', () => {
    const validLine = '5,"5215","11111","Ancap Ticket A 12452548","233669988774",0,1000,0,0,0,"E",';
    const content = `${validLine}\n\n`;

    const result = parseAsientosTxt(content, []);

    expect(result.ok).toBe(true);
    if (!result.ok) { return; }
    expect(result.lines).toHaveLength(1);
  });
});
