import { describe, expect, it } from 'vitest';
import { contarCamposPrimeraLineaDeDatos, derivarLayout, parseAsientosTxt, parseAsientosTxt1376, tieneEncabezado } from './parse-asientos';

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

  it('rejects a RUT that is not exactly 12 digits when the line resolves to the 2181 via Camino 2', () => {
    const planCuentas = [{ cuentaContable: '5215', codigoPadi: '504', codigoIva: null }];
    const content = '5,"5215","11111","Ancap Ticket A 12452548","2336699887",0,1000,0,0,0,"E",';

    const result = parseAsientosTxt(content, planCuentas);

    expect(result).toEqual({
      ok: false,
      line: 1,
      errors: [{ field: 'RUT', message: expect.any(String) }],
    });
  });

  it('rejects a non-RUT value when the line resolves to the 2181 via a mapped Código IVA (formato rápido)', () => {
    const planCuentas = [{ cuentaContable: '1131', codigoPadi: '552', codigoIva: 3 }];
    const content = '10,"5215","11111","Factura compra A 123","FAC 1234",0,1000,3,180.33,0,"C",';

    const result = parseAsientosTxt(content, planCuentas);

    expect(result).toEqual({
      ok: false,
      line: 1,
      errors: [{ field: 'RUT', message: expect.stringContaining('FAC 1234') }],
    });
  });

  it('rejects a non-RUT value on a Tipo 504 line -- 504 always reaches the 2181, regardless of the plan de cuentas', () => {
    const content = '15,"2000","3000","Ajuste por 504","FAC 1234",0,500,0,0,0,"P",504';

    const result = parseAsientosTxt(content, []);

    expect(result).toEqual({
      ok: false,
      line: 1,
      errors: [{ field: 'RUT', message: expect.any(String) }],
    });
  });

  it('accepts any RUT value on a line the 2181 does not resolve -- ej. pago de anticipo de IRAE (13122 contra caja 11111), only used by the 1376 (ADR-0008)', () => {
    const planCuentas = [{ cuentaContable: '1131', codigoPadi: '552', codigoIva: 3 }];
    const content = '5,"13122","11111","Anticipo IRAE","FAC 1234",0,1500,0,0,0,"C",';

    const result = parseAsientosTxt(content, planCuentas);

    expect(result.ok).toBe(true);
    if (!result.ok) { return; }
    expect(result.lines[0]).toMatchObject({ debe: '13122', haber: '11111', rut: 'FAC 1234', total: 1500 });
  });

  it('accepts any RUT value on a line with an unmapped Código IVA or an out-of-scope Tipo', () => {
    const content = [
      '5,"5215","11111","Formato rápido sin mapear","FAC 1234",0,1000,7,220,0,"C",',
      '6,"2000","3000","Cierre de ejercicio","",0,500,0,0,0,"P",CIE',
    ].join('\n');

    const result = parseAsientosTxt(content, []);

    expect(result.ok).toBe(true);
  });

  it('reports every invalid field of the same line at once, not just the first one found', () => {
    const planCuentas = [{ cuentaContable: '5215', codigoPadi: '504', codigoIva: null }];
    const content = '5,"5215","11111","Ancap Ticket A 12452548","2336699887",9,1000,0,0,-5,"E",';

    const result = parseAsientosTxt(content, planCuentas);

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

  it('accepts a zero cotización written with decimals (ej. 0.0000) as pesos', () => {
    const content = '5,"5215","11111","Ancap Ticket A 12452548","233669988774",0,1000,0,0,0.0000,"E",';

    const result = parseAsientosTxt(content, []);

    expect(result.ok).toBe(true);
    if (!result.ok) { return; }
    expect(result.lines[0].cotizacion).toBe(0);
  });

  it('accepts a cotización with no decimals at all', () => {
    const content = '5,"5215","11111","Ancap Ticket A 12452548","233669988774",1,1000,0,0,40,"E",';

    const result = parseAsientosTxt(content, []);

    expect(result.ok).toBe(true);
    if (!result.ok) { return; }
    expect(result.lines[0].cotizacion).toBe(40);
  });

  it('accepts a Libro inconsistent with the cuenta resolved via Código IVA directo (Camino 1) -- the 2181 engine excludes it later (TD-51)', () => {
    const planCuentas = [{ cuentaContable: '2131', codigoPadi: '502', codigoIva: 3 }];
    // Reproduce el caso reportado por el contador: venta resuelta por Código IVA directo, con Libro 'E' (compra) por error.
    const content = '16,"1234","5678","Factura venta A 9999","233669988774",0,1000,3,180.33,0,"E",';

    const result = parseAsientosTxt(content, planCuentas);

    expect(result.ok).toBe(true);
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

  it('does not report a Libro inconsistent with the resolved cuenta de IVA prefix among the invalid fields of a line (TD-51)', () => {
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
      ],
    });
  });

  it('accepts a Libro inconsistent with a compra account prefix (1) -- the 2181 engine excludes it later (TD-51)', () => {
    const planCuentas = [{ cuentaContable: '1131', codigoPadi: '552', codigoIva: null }];
    const content = '10,"1131","11111","Factura compra A 123","233669988774",0,1000,0,0,0,"V",';

    const result = parseAsientosTxt(content, planCuentas);

    expect(result.ok).toBe(true);
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

describe('parseAsientosTxt1376', () => {
  const encabezadoRucAntesDeConcepto = 'DIA,DEBE,HABER,RUC,CONCEPTO,MONEDA,TOTAL,CODIGOIVA,IVA,COTIZACION,LIBRO';

  it('reads each column by its header title, so RUC before CONCEPTO does not swap the values', () => {
    const content = `${encabezadoRucAntesDeConcepto}\r\n1,11411,11111,211111111111,FAC 1234,0,1000,0,0,0.0000,E\r\n2,13122,11111,,BOLETO PAGO IRAE,0,5000,0,0,0.0000,E`;

    const result = parseAsientosTxt1376(content, []);

    expect(result.ok).toBe(true);
    if (!result.ok) { return; }
    expect(result.lines.map(linea => ({ concepto: linea.concepto, rut: linea.rut }))).toEqual([
      { concepto: 'FAC 1234', rut: '211111111111' },
      { concepto: 'BOLETO PAGO IRAE', rut: '' },
    ]);
    expect(result.lines[1]).toMatchObject({ debe: '13122', haber: '11111', total: 5000, libro: 'E', tipo: null });
  });

  it('matches titles regardless of case, accents and separators', () => {
    const content = 'Día,Debe,Haber,Concepto,R.U.T.,Moneda,Total,Código IVA,IVA,Cotización,Libro,Tipo\n5,5215,11111,Ancap,233669988774,0,1000,0,0,0,E,';

    const result = parseAsientosTxt1376(content, []);

    expect(result.ok).toBe(true);
    if (!result.ok) { return; }
    expect(result.lines[0]).toMatchObject({ concepto: 'Ancap', rut: '233669988774', codigoIva: 0, tipo: null });
  });

  it('ignores the known special columns named in the header', () => {
    const content = 'DIA,DEBE,HABER,COMPROBANTE,CONCEPTO,RUT,MONEDA,TOTAL,CODIGOIVA,IVA,COTIZACION,LIBRO\n5,5215,11111,A-123,Ancap,233669988774,0,1000,0,0,0,E';

    const result = parseAsientosTxt1376(content, []);

    expect(result.ok).toBe(true);
    if (!result.ok) { return; }
    expect(result.lines[0]).toMatchObject({ concepto: 'Ancap', rut: '233669988774' });
  });

  it('rejects a line with more fields than header columns instead of shifting them', () => {
    const content = `${encabezadoRucAntesDeConcepto}\n2,13122,11111,,BOLETO PAGO IRAE,0,5000,0,0,0,0.0000,E`;

    const result = parseAsientosTxt1376(content, []);

    expect(result).toEqual({
      ok: false,
      line: 2,
      errors: [{ field: 'línea', message: 'El encabezado tiene 11 columnas, pero la línea trae 12 campos' }],
    });
  });

  it('rejects an unknown header title', () => {
    const content = 'DIA,DEBE,HABER,CONCEPTO,RUT,MONEDA,TOTAL,CODIGOIVA,IVA,COTIZACION,LIBRO,OBSERVACION\n5,5215,11111,Ancap,233669988774,0,1000,0,0,0,E,x';

    const result = parseAsientosTxt1376(content, []);

    expect(result).toEqual({
      ok: false,
      line: 1,
      errors: [{ field: 'Encabezado', message: '"OBSERVACION" no es un título de campo conocido' }],
    });
  });

  it('rejects a header that is missing a required column', () => {
    const content = 'DIA,DEBE,HABER,CONCEPTO,MONEDA,TOTAL,CODIGOIVA,IVA,COTIZACION,LIBRO\n5,5215,11111,Ancap,0,1000,0,0,0,E';

    const result = parseAsientosTxt1376(content, []);

    expect(result).toEqual({
      ok: false,
      line: 1,
      errors: [{ field: 'Encabezado', message: 'Falta la columna: rut' }],
    });
  });

  it('rejects a repeated header title (RUC and RUT are the same field)', () => {
    const content = 'DIA,DEBE,HABER,CONCEPTO,RUT,RUC,MONEDA,TOTAL,CODIGOIVA,IVA,COTIZACION,LIBRO\n5,5215,11111,Ancap,233669988774,233669988774,0,1000,0,0,0,E';

    const result = parseAsientosTxt1376(content, []);

    expect(result).toEqual({
      ok: false,
      line: 1,
      errors: [{ field: 'Encabezado', message: '"RUC" está repetido' }],
    });
  });

  it('falls back to the positional layout when the file has no header', () => {
    const content = '5,"5215","11111","Ancap Ticket A 12452548","233669988774",0,1000,0,0,0,"E",';

    expect(parseAsientosTxt1376(content, [])).toEqual(parseAsientosTxt(content, []));
  });

  it('leaves the 2181 parser reading by position even when the header has another order', () => {
    const content = `${encabezadoRucAntesDeConcepto}\n1,11411,11111,211111111111,FAC 1234,0,1000,0,0,0.0000,E`;

    const result = parseAsientosTxt(content, []);

    expect(result.ok).toBe(true);
    if (!result.ok) { return; }
    expect(result.lines[0]).toMatchObject({ concepto: '211111111111', rut: 'FAC 1234' });
  });
});

describe('tieneEncabezado', () => {
  it('detects a leading header row', () => {
    expect(tieneEncabezado('DIA,DEBE,HABER\n1,2,3')).toBe(true);
  });

  it('returns false for a file that starts with data', () => {
    expect(tieneEncabezado('1,11411,11111')).toBe(false);
  });
});
