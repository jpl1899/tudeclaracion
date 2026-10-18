import { describe, expect, it } from 'vitest';
import { separarAncla } from './titulo-con-ancla';

describe('separarAncla', () => {
  it('splits a trailing {#id} from the visible title', () => {
    expect(separarAncla('RUT {#campo-rut}')).toEqual({ texto: 'RUT', id: 'campo-rut' });
  });

  it('tolerates extra spaces around the anchor', () => {
    expect(separarAncla('  Código IVA   {#campo-codigo-iva}  ')).toEqual({ texto: 'Código IVA', id: 'campo-codigo-iva' });
  });

  it('returns the title unchanged and no id when there is no anchor', () => {
    expect(separarAncla('Primeros pasos')).toEqual({ texto: 'Primeros pasos', id: null });
  });

  it('ignores an anchor that is not at the end or has invalid characters', () => {
    expect(separarAncla('{#campo-rut} RUT')).toEqual({ texto: '{#campo-rut} RUT', id: null });
    expect(separarAncla('RUT {#Campo RUT}')).toEqual({ texto: 'RUT {#Campo RUT}', id: null });
  });
});
