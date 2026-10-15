/**
 * Mapeo del Formulario 1376 — TD-38.
 *
 * El contador asigna, por empresa, una única cuenta contable a cada código de
 * línea del catálogo `codigo_linea_1376` (relación biyectiva), con su lado
 * (Debe/Haber) y, opcionalmente, el código de IVA de formato rápido de Memory
 * Conty. El motor de la 1376 (TD-41) usa los dos criterios del 2181
 * (ADR-0010): formato rápido por código de IVA, asiento abierto por cuenta.
 *
 * Módulo agnóstico de framework: tipos + helpers puros de validación y armado
 * del payload. La persistencia vive en el RPC `guardar_mapeo_1376`
 * (migraciones 20260901121000 y 20261015120000).
 */

export type LadoMapeo = 'debe' | 'haber';

export const LADO_OPCIONES: { value: LadoMapeo, label: string }[] = [
  { value: 'debe', label: 'Debe' },
  { value: 'haber', label: 'Haber' },
];

// Código de Postgres para violación de unique constraint — lo levanta
// cualquiera de las uniques de `mapeo_1376` (cuenta o código de IVA repetido).
export const UNIQUE_VIOLATION_CODE = '23505';

// Mismo rango que `asiento.codigo_iva` sin el 0, que significa asiento abierto.
const CODIGO_IVA_RE = /^[1-9]$/;

export interface CatalogoLinea {
  codigo: string
  concepto: string
}

/** Una fila de la pantalla: un código del catálogo con su asignación actual. */
export interface MapeoFila {
  codigoIva: string
  codigoLinea: string
  concepto: string
  cuentaContable: string
  lado: LadoMapeo | ''
}

/** Asignación ya guardada, tal como llega de `mapeo_1376`. */
export interface MapeoAsignacionInicial {
  codigoIva: number | null
  codigoLinea: string
  cuentaContable: string
  lado: LadoMapeo
}

/**
 * Fila de `plan_cuentas` cuyo `codigo_padi` coincide con un código de línea del
 * 1376 — TD-40. Aporta la cuenta contable y su código de IVA: el lado no se
 * captura en `plan_cuentas`, así que queda para que el contador lo complete.
 */
export interface SugerenciaPlanCuentas {
  codigoPadi: string
  cuentaContable: string
  codigoIva: number | null
}

/**
 * Elemento del array `p_filas` que consume el RPC `guardar_mapeo_1376`. La
 * index signature lo hace asignable a `Json` (el tipo del parámetro RPC
 * generado).
 */
export interface FilaGuardado {
  [key: string]: string | null
  codigo_iva: string | null
  codigo_linea: string
  cuenta_contable: string
  lado: LadoMapeo
}

/**
 * Une el catálogo con las asignaciones ya guardadas — una fila por código del
 * catálogo, vacía cuando ese código todavía no tiene cuenta.
 *
 * Cuando no hay asignación guardada, TD-40's `sugerencias` (derivadas del plan
 * de cuentas de la empresa) precargan la cuenta contable y el código de IVA
 * como punto de partida — el contador completa el lado, o la descarta
 * vaciando los campos. Una asignación ya guardada siempre gana sobre la
 * sugerencia.
 */
export function combinarCatalogoConAsignaciones(
  catalogo: CatalogoLinea[],
  asignaciones: MapeoAsignacionInicial[],
  sugerencias: SugerenciaPlanCuentas[] = [],
): MapeoFila[] {
  const porCodigo = new Map(asignaciones.map(a => [a.codigoLinea, a]));
  const sugeridaPorCodigo = new Map(sugerencias.map(s => [s.codigoPadi, s]));
  return catalogo.map((linea) => {
    const asignada = porCodigo.get(linea.codigo);
    const sugerida = sugeridaPorCodigo.get(linea.codigo);
    const codigoIva = asignada ? asignada.codigoIva : sugerida?.codigoIva;
    return {
      codigoIva: codigoIva ? String(codigoIva) : '',
      codigoLinea: linea.codigo,
      concepto: linea.concepto,
      cuentaContable: asignada?.cuentaContable ?? sugerida?.cuentaContable ?? '',
      lado: asignada?.lado ?? '',
    };
  });
}

/**
 * ¿La fila tiene algún dato cargado? Una fila totalmente vacía es válida — ese
 * código simplemente no mapea a ninguna cuenta.
 */
export function filaTieneDatos(fila: MapeoFila): boolean {
  return fila.cuentaContable.trim() !== '' || fila.codigoIva.trim() !== '';
}

/**
 * Una fila con datos necesita cuenta y lado. El código de IVA es opcional
 * (ADR-0010): sin él, la fila solo junta asientos abiertos.
 */
export function filaIncompleta(fila: MapeoFila): boolean {
  return filaTieneDatos(fila) && (fila.cuentaContable.trim() === '' || fila.lado === '');
}

/**
 * Primer problema de validación del mapeo completo, o `null` si está OK:
 * - una fila con datos pero incompleta (falta cuenta o lado)
 * - un código de IVA fuera del rango 1 a 9
 * - la misma cuenta contable asignada a dos códigos (rompe la biyección)
 * - el mismo código de IVA en dos códigos (un movimiento de formato rápido
 *   alimenta una sola línea)
 */
export function validarMapeo(filas: MapeoFila[]): string | null {
  const incompleta = filas.find(filaIncompleta);
  if (incompleta) {
    return `El código ${incompleta.codigoLinea} tiene datos cargados pero le falta la cuenta contable o el lado.`;
  }

  const codigoInvalido = filas.find(f => f.codigoIva.trim() !== '' && !CODIGO_IVA_RE.test(f.codigoIva.trim()));
  if (codigoInvalido) {
    return `El código ${codigoInvalido.codigoLinea} tiene un código de IVA inválido: debe ser un número del 1 al 9.`;
  }

  const cuentas = new Map<string, string>();
  const codigosIva = new Map<string, string>();
  for (const fila of filas) {
    if (!filaTieneDatos(fila)) {
      continue;
    }
    const cuenta = fila.cuentaContable.trim();
    const cuentaPrevia = cuentas.get(cuenta);
    if (cuentaPrevia) {
      return `La cuenta ${cuenta} está asignada a los códigos ${cuentaPrevia} y ${fila.codigoLinea}. Cada cuenta puede mapear a un solo código.`;
    }
    cuentas.set(cuenta, fila.codigoLinea);

    const codigoIva = fila.codigoIva.trim();
    if (codigoIva === '') {
      continue;
    }
    const codigoPrevio = codigosIva.get(codigoIva);
    if (codigoPrevio) {
      return `El código de IVA ${codigoIva} está asignado a los códigos ${codigoPrevio} y ${fila.codigoLinea}. Cada código de IVA puede mapear a un solo código.`;
    }
    codigosIva.set(codigoIva, fila.codigoLinea);
  }

  return null;
}

/** Payload para el RPC: solo las filas con datos y completas. */
export function construirFilasParaGuardar(filas: MapeoFila[]): FilaGuardado[] {
  return filas
    .filter(f => filaTieneDatos(f) && !filaIncompleta(f))
    .map(f => ({
      codigo_iva: f.codigoIva.trim() === '' ? null : f.codigoIva.trim(),
      codigo_linea: f.codigoLinea,
      cuenta_contable: f.cuentaContable.trim(),
      lado: f.lado as LadoMapeo,
    }));
}
