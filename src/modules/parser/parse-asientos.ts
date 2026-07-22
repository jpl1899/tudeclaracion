const NUMERIC_FIELD_RE = /^\d+$/;
const RUT_RE = /^\d{12}$/;
const LIBRO_VALUES = ['C', 'V', 'E', 'I', 'P'] as const;
const TIPO_VALUES = ['504', 'CIE', 'RES', 'DIF', 'APE'] as const;

type Libro = (typeof LIBRO_VALUES)[number];
type Tipo = (typeof TIPO_VALUES)[number];

export interface AsientoLine {
  dia: number
  debe: string
  haber: string
  concepto: string
  rut: string
  moneda: 0 | 1
  total: number
  codigoIva: number
  iva: number
  cotizacion: number
  libro: Libro
  tipo: Tipo | null
}

export interface ParseSuccess {
  ok: true
  lines: AsientoLine[]
}

export interface ParseFailure {
  ok: false
  line: number
  field: string
  message: string
}

export type ParseResult = ParseSuccess | ParseFailure;

function splitFields(rawLine: string): string[] {
  const fields: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (const char of rawLine) {
    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }
    if (char === ',' && !insideQuotes) {
      fields.push(current);
      current = '';
      continue;
    }
    current += char;
  }
  fields.push(current);
  return fields;
}

function fail({ line, field, message }: { line: number, field: string, message: string }): ParseFailure {
  return { ok: false, line, field, message };
}

/** El TXT puede venir con o sin fila de encabezado (confirmado 2026-07-22) — se detecta por el campo Día, que en una fila real siempre es numérico. */
function isHeaderLine(rawLine: string | undefined): boolean {
  if (rawLine === undefined) {
    return false;
  }
  const [primerCampo] = splitFields(rawLine);
  return primerCampo.trim().toUpperCase() === 'DIA';
}

function parseLine(rawLine: string, lineNumber: number): AsientoLine | ParseFailure {
  const fields = splitFields(rawLine);
  if (fields.length !== 12) {
    return fail({ line: lineNumber, field: 'línea', message: `Se esperaban 12 campos, se encontraron ${fields.length}` });
  }
  const [diaRaw, debe, haber, concepto, rut, monedaRaw, totalRaw, codigoIvaRaw, ivaRaw, cotizacionRaw, libroRaw, tipoRaw] = fields;

  if (!NUMERIC_FIELD_RE.test(diaRaw) || Number(diaRaw) < 1 || Number(diaRaw) > 31) {
    return fail({ line: lineNumber, field: 'Día', message: `"${diaRaw}" no es un día válido (1-31)` });
  }

  if (debe.length === 0 || !NUMERIC_FIELD_RE.test(debe)) {
    return fail({ line: lineNumber, field: 'Debe', message: `"${debe}" no es un código de cuenta contable válido` });
  }

  if (haber.length === 0 || !NUMERIC_FIELD_RE.test(haber)) {
    return fail({ line: lineNumber, field: 'Haber', message: `"${haber}" no es un código de cuenta contable válido` });
  }

  if (concepto.length === 0) {
    return fail({ line: lineNumber, field: 'Concepto', message: 'El concepto no puede estar vacío' });
  }

  if (!RUT_RE.test(rut)) {
    return fail({ line: lineNumber, field: 'RUT', message: `"${rut}" no tiene el formato de 12 dígitos` });
  }

  if (monedaRaw !== '0' && monedaRaw !== '1') {
    return fail({ line: lineNumber, field: 'Moneda', message: `"${monedaRaw}" debe ser 0 (pesos) o 1 (dólares)` });
  }

  const total = Number(totalRaw);
  if (totalRaw.length === 0 || Number.isNaN(total)) {
    return fail({ line: lineNumber, field: 'Total', message: `"${totalRaw}" no es un importe numérico válido` });
  }

  const codigoIva = Number(codigoIvaRaw);
  if (!NUMERIC_FIELD_RE.test(codigoIvaRaw) || codigoIva < 0 || codigoIva > 9) {
    return fail({ line: lineNumber, field: 'Código IVA', message: `"${codigoIvaRaw}" debe ser un dígito entre 0 y 9` });
  }

  const iva = Number(ivaRaw);
  if (ivaRaw.length === 0 || Number.isNaN(iva)) {
    return fail({ line: lineNumber, field: 'IVA', message: `"${ivaRaw}" no es un importe numérico válido` });
  }

  const cotizacion = Number(cotizacionRaw);
  if (cotizacionRaw.length === 0 || Number.isNaN(cotizacion)) {
    return fail({ line: lineNumber, field: 'Cotización', message: `"${cotizacionRaw}" no es un valor numérico válido` });
  }

  if (!LIBRO_VALUES.includes(libroRaw as Libro)) {
    return fail({ line: lineNumber, field: 'Libro', message: `"${libroRaw}" debe ser uno de: ${LIBRO_VALUES.join(', ')}` });
  }

  const tipo = tipoRaw.length === 0 ? null : tipoRaw;
  if (tipo !== null && !TIPO_VALUES.includes(tipo as (typeof TIPO_VALUES)[number])) {
    return fail({ line: lineNumber, field: 'Tipo', message: `"${tipo}" debe ser uno de: ${TIPO_VALUES.join(', ')} o estar vacío` });
  }

  return {
    dia: Number(diaRaw),
    debe,
    haber,
    concepto,
    rut,
    moneda: monedaRaw === '1' ? 1 : 0,
    total,
    codigoIva,
    iva,
    cotizacion,
    libro: libroRaw as Libro,
    tipo: tipo as Tipo | null,
  };
}

/**
 * Interpreta el TXT mensual exportado por Memory (formato confirmado en
 * SRS/05-parser.md, 2026-07-15). Puramente técnico: no aplica reglas
 * tributarias — solo transforma el texto en un modelo de datos interno.
 *
 * El archivo puede traer o no una fila de encabezado como primera línea
 * (confirmado 2026-07-22) — si está, se descarta antes de interpretar datos.
 *
 * Si cualquier campo de cualquier línea es inválido, aborta el archivo
 * completo (no devuelve resultados parciales) — regla confirmada 2026-07-16.
 */
export function parseAsientosTxt(content: string): ParseResult {
  const rawLines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  const lines: AsientoLine[] = [];
  const startIndex = isHeaderLine(rawLines[0]) ? 1 : 0;

  for (let i = startIndex; i < rawLines.length; i++) {
    const result = parseLine(rawLines[i], i + 1);
    if ('ok' in result) {
      return result;
    }
    lines.push(result);
  }

  return { ok: true, lines };
}
