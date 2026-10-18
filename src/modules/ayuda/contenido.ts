import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { separarAncla } from './titulo-con-ancla';

export interface SeccionAyuda {
  /** Visible title of the section's top-level (##) heading. */
  titulo: string
  id: string | null
  markdown: string
}

const CONTENT_DIR = join(process.cwd(), 'content', 'ayuda');

/**
 * Reads the help sections from content/ayuda/*.md, ordered by file name.
 * Server-only: the app runs with `next start` (no standalone output), so the
 * folder is on disk at runtime. The same files are meant to feed the manual.
 */
export async function cargarSeccionesAyuda(): Promise<SeccionAyuda[]> {
  const archivos = (await readdir(CONTENT_DIR)).filter(archivo => archivo.endsWith('.md')).sort();

  return Promise.all(archivos.map(async (archivo) => {
    const markdown = await readFile(join(CONTENT_DIR, archivo), 'utf8');
    const encabezado = /^## (\S.*)$/m.exec(markdown)?.[1] ?? archivo;
    const { texto, id } = separarAncla(encabezado);
    return { titulo: texto, id, markdown };
  }));
}
