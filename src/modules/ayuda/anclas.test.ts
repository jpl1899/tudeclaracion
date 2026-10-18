import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ANCLA_POR_CAMPO, anclaParaCampo, ANCLAS_AYUDA, hrefAyuda } from './anclas';

const CONTENT_DIR = join(process.cwd(), 'content', 'ayuda');

function anclasEnContenido(): string[] {
  return readdirSync(CONTENT_DIR)
    .filter(archivo => archivo.endsWith('.md'))
    .flatMap(archivo => [...readFileSync(join(CONTENT_DIR, archivo), 'utf8').matchAll(/\{#([a-z0-9-]+)\}/g)].map(m => m[1]));
}

/** Every `field` value the TXT parser can report (parse-asientos.ts). */
const CAMPOS_DEL_PARSER = ['Encabezado', 'línea', 'Día', 'Debe/Haber', 'Debe', 'Haber', 'Concepto', 'RUT', 'Moneda', 'Total', 'Código IVA', 'IVA', 'Cotización', 'Libro', 'Tipo'];

describe('help anchors', () => {
  it('every anchor the app links to exists exactly once in the help content', () => {
    const enContenido = anclasEnContenido();
    const usadas = new Set([...Object.values(ANCLAS_AYUDA), ...Object.values(ANCLA_POR_CAMPO)]);
    for (const ancla of usadas) {
      expect(enContenido.filter(id => id === ancla), `anchor #${ancla}`).toHaveLength(1);
    }
  });

  it('has no duplicated anchor ids in the content', () => {
    const enContenido = anclasEnContenido();
    expect(new Set(enContenido).size).toBe(enContenido.length);
  });

  it('maps every parser field to its own anchor', () => {
    for (const campo of CAMPOS_DEL_PARSER) {
      expect(ANCLA_POR_CAMPO[campo], `field ${campo}`).toBeDefined();
    }
  });

  it('falls back to the import errors section for an unknown field', () => {
    expect(anclaParaCampo('Desconocido')).toBe(ANCLAS_AYUDA.erroresAlImportar);
  });

  it('builds the help URL with the anchor as fragment', () => {
    expect(hrefAyuda('campo-rut')).toBe('/dashboard/ayuda#campo-rut');
  });
});
