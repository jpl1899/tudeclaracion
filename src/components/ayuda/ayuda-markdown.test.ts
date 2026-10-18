import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { cargarSeccionesAyuda } from '@/modules/ayuda/contenido';
import { AyudaMarkdown } from './ayuda-markdown';

function render(markdown: string): string {
  return renderToStaticMarkup(createElement(AyudaMarkdown, { markdown }));
}

describe('ayudaMarkdown', () => {
  it('turns a trailing {#id} into the heading id and hides it', () => {
    const html = render('### RUT {#campo-rut}');
    expect(html).toContain('id="campo-rut"');
    expect(html).not.toContain('{#');
  });

  it('never shows raw HTML such as notes for the accountant', () => {
    expect(render('Texto\n\n<!-- revisar contador: nota -->\n\n<b>x</b>')).not.toMatch(/revisar contador|<b>/);
  });

  it('renders the real help content without visible anchors or notes', async () => {
    const html = (await cargarSeccionesAyuda()).map(seccion => render(seccion.markdown)).join('');
    expect(html).not.toContain('{#');
    expect(html).not.toContain('revisar contador');
  });
});
