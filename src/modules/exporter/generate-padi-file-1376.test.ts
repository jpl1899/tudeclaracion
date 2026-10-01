import { describe, expect, it } from 'vitest';
import { generarArchivoPadi1376 } from './generate-padi-file-1376';

describe('generarArchivoPadi1376', () => {
  it('writes one codigo;importe row per line code, newline-separated, with no header', () => {
    const resultado = generarArchivoPadi1376([
      { codigoLinea: '101', importe: 1500000 },
      { codigoLinea: '201', importe: 900000 },
      { codigoLinea: '502', importe: 330000 },
    ]);

    expect(resultado).toBe('101;1500000\n201;900000\n502;330000');
  });

  it('writes amounts as integers with no thousands separator', () => {
    const resultado = generarArchivoPadi1376([{ codigoLinea: '101', importe: 1234567.4 }]);

    expect(resultado).toBe('101;1234567');
  });

  it('rounds like the 2181: decimals up to .50 round down, from .51 round up', () => {
    const resultado = generarArchivoPadi1376([
      { codigoLinea: '101', importe: 180.5 },
      { codigoLinea: '102', importe: 180.51 },
    ]);

    expect(resultado).toBe('101;180\n102;181');
  });

  it('omits line codes whose total is negative', () => {
    const resultado = generarArchivoPadi1376([
      { codigoLinea: '101', importe: 1000 },
      { codigoLinea: '502', importe: -1200 },
      { codigoLinea: '601', importe: 50 },
    ]);

    expect(resultado).toBe('101;1000\n601;50');
  });

  it('contains only line codes and amounts (no RUT, no period)', () => {
    const resultado = generarArchivoPadi1376([{ codigoLinea: '101', importe: 10000 }]);

    for (const fila of resultado.split('\n')) {
      expect(fila).toMatch(/^\d+;\d+$/);
    }
  });

  it('returns an empty file when there are no totals', () => {
    expect(generarArchivoPadi1376([])).toBe('');
  });
});
