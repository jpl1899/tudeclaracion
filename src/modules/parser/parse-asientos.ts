import type { PlanCuentaRow } from '@/modules/plan-cuentas/resolver-cuenta-camino-2';
import { resolverCuentaCamino2 } from '@/modules/plan-cuentas/resolver-cuenta-camino-2';

const NUMERIC_FIELD_RE = /^\d+$/;
const RUT_RE = /^\d{12}$/;
/**
 * Cotización: 0 (pesos) o dos dígitos enteros + cualquier cantidad de
 * decimales (o ninguno) -- el peso uruguayo nunca cotiza por debajo de 10
 * (confirmado con el contador). Antes exigía exactamente 2 decimales, pero
 * el TXT real trae la precisión cruda del banco/BCU (ej. `39.60396039`) --
 * confirmado 2026-08-19: esa precisión debe pasar intacta al cálculo del
 * importe convertido (`normalize-asiento.ts`), que es donde se redondea el
 * resultado final, no acá.
 */
const COTIZACION_RE = /^\d{2}(?:\.\d+)?$/;
/** Cotización 0 (pesos) también puede venir con decimales, ej. `0.0000`. */
const COTIZACION_CERO_RE = /^0(?:\.0+)?$/;
const LIBRO_VALUES = ['C', 'V', 'E', 'I', 'P'] as const;
const TIPO_VALUES = ['504', 'CIE', 'RES', 'DIF', 'APE'] as const;

export type Libro = (typeof LIBRO_VALUES)[number];
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

export interface CampoInvalido {
  field: string
  message: string
}

export interface ParseFailure {
  ok: false
  line: number
  errors: CampoInvalido[]
}

export type ParseResult = ParseSuccess | ParseFailure;

/**
 * Las 9 columnas adicionales conocidas que un proveedor contable puede
 * agregar al TXT (ADR-0005). Se ignoran por completo -- nunca se validan ni
 * se usan -- solo ocupan una posición en el ancho de línea.
 */
export const CAMPOS_ESPECIALES = [
  'costos',
  'comprobante',
  'numero',
  'emision',
  'vencimiento',
  'numeroDocumento',
  'serieDocumento',
  'serie',
  'numeroAsiento',
] as const;

export type CampoEspecial = (typeof CAMPOS_ESPECIALES)[number];

interface PosicionCanonica {
  key: string
  especial: CampoEspecial | null
}

/**
 * Orden canónico fijo de los 21 campos posibles (`SRS/05-parser.md`
 * §"Aceptado 2026-08-07"), tal como lo definió la pestaña 3 del Excel
 * aportado por el contador. La posición de cada campo se deriva SIEMPRE de
 * esta tabla + cuáles especiales están habilitados -- nunca del contenido de
 * la línea, porque varios especiales comparten tipo de dato y no hay forma
 * de distinguirlos por valor.
 */
const ORDEN_CANONICO: PosicionCanonica[] = [
  { key: 'dia', especial: null },
  { key: 'debe', especial: null },
  { key: 'haber', especial: null },
  { key: 'costos', especial: 'costos' },
  { key: 'comprobante', especial: 'comprobante' },
  { key: 'numero', especial: 'numero' },
  { key: 'concepto', especial: null },
  { key: 'emision', especial: 'emision' },
  { key: 'vencimiento', especial: 'vencimiento' },
  { key: 'rut', especial: null },
  { key: 'moneda', especial: null },
  { key: 'total', especial: null },
  { key: 'codigoIva', especial: null },
  { key: 'iva', especial: null },
  { key: 'cotizacion', especial: null },
  { key: 'libro', especial: null },
  { key: 'tipo', especial: null },
  { key: 'numeroDocumento', especial: 'numeroDocumento' },
  { key: 'serieDocumento', especial: 'serieDocumento' },
  { key: 'serie', especial: 'serie' },
  { key: 'numeroAsiento', especial: 'numeroAsiento' },
];

/** Filtra el orden canónico a las posiciones activas para un archivo dado. */
export function derivarLayout(especialesHabilitados: Set<CampoEspecial>): string[] {
  return ORDEN_CANONICO
    .filter(pos => pos.especial === null || especialesHabilitados.has(pos.especial))
    .map(pos => pos.key);
}

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

/**
 * El RUT solo importa para el 2181, que declara el detalle por RUT. El 1376
 * declara totales por código de línea y no lo usa (ADR-0008), así que una
 * línea que el 2181 no va a resolver -- ej. pago de anticipo de IRAE, 13122
 * contra 11111 -- puede traer cualquier valor en esa columna. Espeja las
 * ramas de `resolveAsientoFiscal` (`normalize-asiento.ts`): Tipo 504 entra
 * siempre; el resto de los Tipo quedan fuera de alcance; Código IVA > 0
 * entra si está mapeado; Código IVA = 0 entra si Debe/Haber toca una cuenta
 * del plan de cuentas.
 */
function requiereRut2181(
  linea: { tipo: string, codigoIva: number, debe: string, haber: string, libro: string, total: number },
  planCuentas: PlanCuentaRow[],
): boolean {
  if (linea.tipo === '504') { return true; }
  if (linea.tipo.length > 0) { return false; }
  if (linea.codigoIva > 0) {
    return planCuentas.some(row => row.codigoIva === linea.codigoIva);
  }
  return resolverCuentaCamino2(linea.debe, linea.haber, linea.libro, linea.total, planCuentas).candidatos.length > 0;
}

function fail(line: number, errors: CampoInvalido[]): ParseFailure {
  return { ok: false, line, errors };
}

/** El TXT puede venir con o sin fila de encabezado (confirmado 2026-07-22) — se detecta por el campo Día, que en una fila real siempre es numérico. */
function isHeaderLine(rawLine: string | undefined): boolean {
  if (rawLine === undefined) {
    return false;
  }
  const [primerCampo] = splitFields(rawLine);
  return primerCampo.trim().toUpperCase() === 'DIA';
}

/**
 * Cantidad de campos de la primera línea de datos del archivo (descartando
 * el encabezado si viene) -- usado por la UI (`ImportarAsientoDialog`, TD-31)
 * para decidir si el archivo matchea el modelo clásico (11/12 campos) o
 * necesita que el usuario declare qué columnas especiales trae, antes de
 * llamar a `parseAsientosTxt`. Reutiliza `splitFields`/`isHeaderLine` para no
 * duplicar el parseo CSV quote-aware.
 */
export function contarCamposPrimeraLineaDeDatos(content: string): number {
  const rawLines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  const startIndex = isHeaderLine(rawLines[0]) ? 1 : 0;
  const primeraLinea = rawLines[startIndex];
  return primeraLinea === undefined ? 0 : splitFields(primeraLinea).length;
}

/** Archivo con o sin fila de encabezado -- usado por la UI para saber si el 1376 va a leer las columnas por su título (ADR-0009). */
export function tieneEncabezado(content: string): boolean {
  const [primeraLinea] = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  return esEncabezado1376(primeraLinea);
}

/**
 * Títulos aceptados en la fila de encabezado (ADR-0009), normalizados: en
 * mayúsculas, sin tildes ni separadores. RUC y RUT son el mismo campo. Las
 * columnas especiales de ADR-0005 se aceptan y se ignoran, igual que en el
 * layout por posición.
 */
const CAMPO_POR_TITULO: Record<string, string> = {
  DIA: 'dia',
  DEBE: 'debe',
  HABER: 'haber',
  CONCEPTO: 'concepto',
  RUT: 'rut',
  RUC: 'rut',
  MONEDA: 'moneda',
  TOTAL: 'total',
  CODIGOIVA: 'codigoIva',
  IVA: 'iva',
  COTIZACION: 'cotizacion',
  LIBRO: 'libro',
  TIPO: 'tipo',
  CCOSTOS: 'costos',
  COSTOS: 'costos',
  COMPROBANTE: 'comprobante',
  NUMERO: 'numero',
  EMISION: 'emision',
  VENCIMIENTO: 'vencimiento',
  NUMERODOCUMENTO: 'numeroDocumento',
  SERIEDOCUMENTO: 'serieDocumento',
  SERIE: 'serie',
  NUMEROASIENTO: 'numeroAsiento',
};

/** Tipo es opcional también con encabezado: el modelo clásico de 11 campos no lo trae. */
const CAMPOS_OBLIGATORIOS_ENCABEZADO = ['dia', 'debe', 'haber', 'concepto', 'rut', 'moneda', 'total', 'codigoIva', 'iva', 'cotizacion', 'libro'];

function normalizarTitulo(titulo: string): string {
  return titulo.normalize('NFD').replace(/\p{Diacritic}/gu, '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/** Como `isHeaderLine`, pero tolera tildes y mayúsculas en el título Día (ADR-0009). Solo la usa el 1376. */
function esEncabezado1376(rawLine: string | undefined): boolean {
  return rawLine !== undefined && normalizarTitulo(splitFields(rawLine)[0]) === 'DIA';
}

/**
 * Deriva el layout de la fila de encabezado: cada columna se lee por su
 * título, no por su posición (ADR-0009). Rechaza títulos desconocidos,
 * repetidos o un campo obligatorio ausente -- nunca mapea a ciegas.
 */
function derivarLayoutDesdeEncabezado(rawHeader: string): { ok: true, layout: string[] } | ParseFailure {
  const titulos = splitFields(rawHeader).map(titulo => titulo.trim());
  const layout: string[] = [];
  const errors: CampoInvalido[] = [];

  for (const titulo of titulos) {
    const key = CAMPO_POR_TITULO[normalizarTitulo(titulo)];
    if (key === undefined) {
      errors.push({ field: 'Encabezado', message: `"${titulo}" no es un título de campo conocido` });
      continue;
    }
    if (layout.includes(key)) {
      errors.push({ field: 'Encabezado', message: `"${titulo}" está repetido` });
      continue;
    }
    layout.push(key);
  }

  const faltantes = CAMPOS_OBLIGATORIOS_ENCABEZADO.filter(key => !layout.includes(key));
  if (faltantes.length > 0) {
    errors.push({ field: 'Encabezado', message: `Falta la columna: ${faltantes.join(', ')}` });
  }

  return errors.length > 0 ? fail(1, errors) : { ok: true, layout };
}

interface ContextoLinea {
  lineNumber: number
  planCuentas: PlanCuentaRow[]
  layout: string[]
  /** Layout leído del encabezado (ADR-0009): cada línea trae exactamente una columna por título. */
  anchoExacto: boolean
}

/**
 * Valida todos los campos de la línea y acumula cada campo inválido -- no
 * frena en el primero (confirmado con el contador: si una línea trae varios
 * campos inválidos a la vez, ej. RUT y Moneda, Rosana necesita ver ambos de
 * una sola pasada, no uno por reintento).
 */
function parseLine(rawLine: string, { lineNumber, planCuentas, layout, anchoExacto }: ContextoLinea): AsientoLine | ParseFailure {
  const fields = splitFields(rawLine);

  if (anchoExacto && fields.length !== layout.length) {
    return fail(lineNumber, [{ field: 'línea', message: `El encabezado tiene ${layout.length} columnas, pero la línea trae ${fields.length} campos` }]);
  }

  /**
   * El ancho esperado se deriva del layout (12 + especiales habilitados,
   * ADR-0005). El modelo clásico (sin especiales) conserva además la
   * leniencia ya existente de 11 campos -- Tipo omitido por completo, sin
   * coma final -- documentada en `SRS/05-parser.md` como parte del modelo
   * clásico; esa leniencia NO se generaliza a layouts con especiales, donde
   * el ancho debe matchear exacto.
   */
  const esModeloClasico = !anchoExacto && layout.length === 12;
  const anchoValido = fields.length === layout.length || (esModeloClasico && fields.length === layout.length - 1);
  if (!anchoValido) {
    const anchosEsperados = esModeloClasico ? `${layout.length - 1} o ${layout.length}` : `${layout.length}`;
    return fail(lineNumber, [{ field: 'línea', message: `Se esperaban ${anchosEsperados} campos, se encontraron ${fields.length}` }]);
  }
  // Línea de 11 campos del modelo clásico: Tipo viene ausente, no vacío-con-coma -- se completa acá.
  const valores = fields.length === layout.length ? fields : [...fields, ''];

  const valorPorCampo: Record<string, string> = {};
  layout.forEach((key, index) => { valorPorCampo[key] = valores[index]; });

  const diaRaw = valorPorCampo.dia;
  const debe = valorPorCampo.debe;
  const haber = valorPorCampo.haber;
  const concepto = valorPorCampo.concepto;
  const rut = valorPorCampo.rut;
  const monedaRaw = valorPorCampo.moneda;
  const totalRaw = valorPorCampo.total;
  const codigoIvaRaw = valorPorCampo.codigoIva;
  const ivaRaw = valorPorCampo.iva;
  const cotizacionRaw = valorPorCampo.cotizacion;
  const libroRaw = valorPorCampo.libro;
  // Un encabezado sin TIPO no trae esa columna (ADR-0009).
  const tipoRaw = valorPorCampo.tipo ?? '';
  const errors: CampoInvalido[] = [];

  if (!NUMERIC_FIELD_RE.test(diaRaw) || Number(diaRaw) < 1 || Number(diaRaw) > 31) {
    errors.push({ field: 'Día', message: `"${diaRaw}" no es un día válido (1-31)` });
  }

  if (debe.length === 0 && haber.length === 0) {
    errors.push({ field: 'Debe/Haber', message: 'Debe y Haber no pueden estar vacíos a la vez' });
  }

  if (debe.length > 0 && !NUMERIC_FIELD_RE.test(debe)) {
    errors.push({ field: 'Debe', message: `"${debe}" no es un código de cuenta contable válido` });
  }

  if (haber.length > 0 && !NUMERIC_FIELD_RE.test(haber)) {
    errors.push({ field: 'Haber', message: `"${haber}" no es un código de cuenta contable válido` });
  }

  if (concepto.length === 0) {
    errors.push({ field: 'Concepto', message: 'El concepto no puede estar vacío' });
  }

  const total = Number(totalRaw);
  const codigoIva = Number(codigoIvaRaw);
  const libro = libroRaw.toUpperCase();

  if (requiereRut2181({ tipo: tipoRaw, codigoIva, debe, haber, libro, total }, planCuentas) && !RUT_RE.test(rut)) {
    errors.push({ field: 'RUT', message: `"${rut}" no tiene el formato de 12 dígitos` });
  }

  if (monedaRaw !== '0' && monedaRaw !== '1') {
    errors.push({ field: 'Moneda', message: `"${monedaRaw}" debe ser 0 (pesos) o 1 (dólares)` });
  }

  if (totalRaw.length === 0 || Number.isNaN(total)) {
    errors.push({ field: 'Total', message: `"${totalRaw}" no es un importe numérico válido` });
  }

  if (!NUMERIC_FIELD_RE.test(codigoIvaRaw) || codigoIva < 0 || codigoIva > 9) {
    errors.push({ field: 'Código IVA', message: `"${codigoIvaRaw}" debe ser un dígito entre 0 y 9` });
  }

  const iva = Number(ivaRaw);
  if (ivaRaw.length === 0 || Number.isNaN(iva)) {
    errors.push({ field: 'IVA', message: `"${ivaRaw}" no es un importe numérico válido` });
  }

  const cotizacion = Number(cotizacionRaw);
  if (!COTIZACION_CERO_RE.test(cotizacionRaw) && !COTIZACION_RE.test(cotizacionRaw)) {
    errors.push({ field: 'Cotización', message: `"${cotizacionRaw}" debe ser 0 o un valor con dos dígitos enteros (ej. 38.45)` });
  }

  /**
   * TD-51 (confirmado con el contador 2026-10-26): un Libro que no coincide
   * con la cuenta resuelta ya no rechaza el archivo. El asiento se importa y
   * el motor del 2181 lo excluye con su motivo (`normalize-asiento.ts`), para
   * que un dato mal cargado no bloquee todo el período.
   */
  if (!LIBRO_VALUES.includes(libro as Libro)) {
    errors.push({ field: 'Libro', message: `"${libroRaw}" debe ser uno de: ${LIBRO_VALUES.join(', ')}` });
  }

  const tipo = tipoRaw.length === 0 ? null : tipoRaw;
  if (tipo !== null && !TIPO_VALUES.includes(tipo as (typeof TIPO_VALUES)[number])) {
    errors.push({ field: 'Tipo', message: `"${tipo}" debe ser uno de: ${TIPO_VALUES.join(', ')} o estar vacío` });
  }

  if (errors.length > 0) {
    return fail(lineNumber, errors);
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
    libro: libro as Libro,
    tipo: tipo as Tipo | null,
  };
}

/**
 * Interpreta el TXT mensual del proveedor contable (formato confirmado en
 * SRS/05-parser.md, 2026-07-15). Mayormente técnico -- no decide código PADI
 * ni importes -- con una única excepción confirmada (2026-08-02): recibe el
 * plan de cuentas de la empresa para poder cruzar Libro contra el prefijo de
 * la cuenta de IVA resuelta (Camino 2) y reportarlo junto al resto de los
 * campos inválidos de la misma línea, en vez de recién detectarlo en el
 * motor tributario cuando la línea ya pasó el parseo estructural.
 *
 * El archivo puede traer o no una fila de encabezado como primera línea
 * (confirmado 2026-07-22) — si está, se descarta antes de interpretar datos.
 *
 * Si cualquier campo de cualquier línea es inválido, aborta el archivo
 * completo (no devuelve resultados parciales) — regla confirmada 2026-07-16.
 *
 * `camposEspecialesHabilitados` (ADR-0005, TD-31): columnas adicionales que
 * el usuario declaró antes de subir un archivo no estándar -- derivan la
 * posición de cada campo junto con el orden canónico fijo. Vacío por default
 * (modelo clásico, 11/12 campos), igual que hoy.
 */
export function parseAsientosTxt(
  content: string,
  planCuentas: PlanCuentaRow[],
  camposEspecialesHabilitados: Set<CampoEspecial> = new Set(),
): ParseResult {
  const layout = derivarLayout(camposEspecialesHabilitados);
  const rawLines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  const lines: AsientoLine[] = [];
  const startIndex = isHeaderLine(rawLines[0]) ? 1 : 0;

  for (let i = startIndex; i < rawLines.length; i++) {
    const result = parseLine(rawLines[i], { lineNumber: i + 1, planCuentas, layout, anchoExacto: false });
    if ('ok' in result) {
      return result;
    }
    lines.push(result);
  }

  return { ok: true, lines };
}

/**
 * Variante del 1376 (ADR-0009): si el archivo trae fila de encabezado, cada
 * columna se lee por su título y no por su posición, así un archivo con las
 * columnas en otro orden (ej. RUC antes de CONCEPTO) no corre los datos. Sin
 * encabezado se comporta igual que `parseAsientosTxt`. El 2181 no la usa.
 */
export function parseAsientosTxt1376(
  content: string,
  planCuentas: PlanCuentaRow[],
  camposEspecialesHabilitados: Set<CampoEspecial> = new Set(),
): ParseResult {
  const rawLines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (!esEncabezado1376(rawLines[0])) {
    return parseAsientosTxt(content, planCuentas, camposEspecialesHabilitados);
  }

  const encabezado = derivarLayoutDesdeEncabezado(rawLines[0]);
  if (!encabezado.ok) {
    return encabezado;
  }

  const lines: AsientoLine[] = [];
  for (let i = 1; i < rawLines.length; i++) {
    const result = parseLine(rawLines[i], { lineNumber: i + 1, planCuentas, layout: encabezado.layout, anchoExacto: true });
    if ('ok' in result) {
      return result;
    }
    lines.push(result);
  }

  return { ok: true, lines };
}
