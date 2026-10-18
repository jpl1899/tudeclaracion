import type { ReactNode } from 'react';
import type { Components } from 'react-markdown';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { separarAncla } from '@/modules/ayuda/titulo-con-ancla';

/** Strips a trailing `{#id}` from a heading's last text node and returns the id. */
function conAncla(children: ReactNode): { contenido: ReactNode, id: string | undefined } {
  const nodos = Array.isArray(children) ? [...children] : [children];
  const ultimo = nodos.at(-1);
  if (typeof ultimo !== 'string') {
    return { contenido: children, id: undefined };
  }
  const { texto, id } = separarAncla(ultimo);
  nodos[nodos.length - 1] = texto;
  return { contenido: nodos, id: id ?? undefined };
}

const components: Components = {
  h2: ({ children }) => {
    const { contenido, id } = conAncla(children);
    return <h2 id={id} className="scroll-mt-6 font-heading text-2xl font-semibold tracking-tight">{contenido}</h2>;
  },
  h3: ({ children }) => {
    const { contenido, id } = conAncla(children);
    return <h3 id={id} className="mt-4 scroll-mt-6 text-lg font-semibold">{contenido}</h3>;
  },
  h4: ({ children }) => {
    const { contenido, id } = conAncla(children);
    return <h4 id={id} className="mt-3 scroll-mt-6 font-semibold">{contenido}</h4>;
  },
  p: ({ children }) => <p className="leading-relaxed text-muted-foreground">{children}</p>,
  ul: ({ children }) => <ul className="grid list-disc gap-1.5 pl-5 text-muted-foreground">{children}</ul>,
  ol: ({ children }) => <ol className="grid list-decimal gap-1.5 pl-5 text-muted-foreground">{children}</ol>,
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  a: ({ href, children }) => <a href={href} className="font-medium text-primary hover:underline">{children}</a>,
  code: ({ children }) => <code className="break-all rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">{children}</code>,
  blockquote: ({ children }) => <blockquote className="border-l-4 border-primary/30 bg-muted/50 py-2 pl-4">{children}</blockquote>,
  table: ({ children }) => (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border border-border bg-muted px-3 py-2 text-left font-semibold">{children}</th>,
  td: ({ children }) => <td className="border border-border px-3 py-2 align-top text-muted-foreground">{children}</td>,
};

/**
 * Renders a help section. `skipHtml` drops raw HTML entirely: without it
 * react-markdown prints HTML as literal text, so the `<!-- revisar contador -->`
 * notes would show up on the page.
 */
export function AyudaMarkdown({ markdown }: { markdown: string }) {
  return (
    <div className="grid gap-3">
      <Markdown remarkPlugins={[remarkGfm]} components={components} skipHtml>
        {markdown}
      </Markdown>
    </div>
  );
}
