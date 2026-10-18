interface ResumenInicioInput {
  nombre: string | null
  /** null when the count query failed. */
  empresas: number | null
  /** null when the count query failed. */
  pendientes: number | null
}

interface ResumenInicio {
  saludo: string
  /** null hides the summary line. */
  resumen: string | null
}

function palabras(nombre: string | null): string[] {
  return (nombre ?? '').trim().split(/\s+/).filter(Boolean);
}

function plural(cantidad: number, singular: string, pluralForma: string): string {
  return `${cantidad} ${cantidad === 1 ? singular : pluralForma}`;
}

/** Greeting and summary line for the post-login home (/inicio). */
export function construirResumenInicio({ nombre, empresas, pendientes }: ResumenInicioInput): ResumenInicio {
  const [primerNombre] = palabras(nombre);
  const saludo = primerNombre ? `Hola, ${primerNombre}` : 'Hola';

  if (empresas === null || pendientes === null) {
    return { saludo, resumen: null };
  }
  if (empresas === 0) {
    return { saludo, resumen: 'Todavía no cargaste empresas' };
  }

  const empresasTexto = plural(empresas, 'empresa', 'empresas');
  const pendientesTexto = pendientes === 0
    ? 'Sin declaraciones pendientes'
    : plural(pendientes, 'declaración pendiente de generar', 'declaraciones pendientes de generar');

  return { saludo, resumen: `${empresasTexto} · ${pendientesTexto}` };
}

/** Up to two uppercase initials from the display name, or null without one. */
export function iniciales(nombre: string | null): string | null {
  const letras = palabras(nombre).slice(0, 2).map(palabra => palabra[0].toUpperCase());
  return letras.length > 0 ? letras.join('') : null;
}
