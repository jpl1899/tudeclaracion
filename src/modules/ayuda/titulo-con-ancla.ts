const ANCLA_FINAL_RE = /\s*\{#([a-z0-9-]+)\}\s*$/;

/**
 * Help headings declare a stable anchor as a trailing `{#id}` so links never
 * depend on the heading wording. Returns the visible title and the id.
 */
export function separarAncla(titulo: string): { texto: string, id: string | null } {
  const match = ANCLA_FINAL_RE.exec(titulo);
  if (!match) {
    return { texto: titulo.trim(), id: null };
  }
  return { texto: titulo.slice(0, match.index).trim(), id: match[1] };
}
