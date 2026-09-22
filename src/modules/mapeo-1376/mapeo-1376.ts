/**
 * Mapeo del Formulario 1376 — TD-38.
 *
 * El contador asigna, por empresa, una única cuenta contable a cada código de
 * línea del catálogo `codigo_linea_1376` (relación biyectiva), indicando el
 * lado (Debe/Haber) y la columna de importe del TXT (Total/IVA) de donde el
 * motor de la 1376 (TD-41) lee el saldo de esa cuenta.
 *
 * Módulo agnóstico de framework: tipos + helpers puros de validación y armado
 * del payload. La persistencia vive en el RPC `guardar_mapeo_1376`
 * (migración 20260901121000).
 */

export type LadoMapeo = 'debe' | 'haber';
export type ColumnaImporte = 'total' | 'iva';

export const LADO_OPCIONES: { value: LadoMapeo, label: string }[] = [
  { value: 'debe', label: 'Debe' },
  { value: 'haber', label: 'Haber' },
];

export const COLUMNA_IMPORTE_OPCIONES: { value: ColumnaImporte, label: string }[] = [
  { value: 'total', label: 'Total (asiento abierto)' },
  { value: 'iva', label: 'IVA (formato rápido)' },
];

// Código de Postgres para violación de unique constraint — lo levanta
// cualquiera de las dos uniques de biyección de `mapeo_1376`.
export const UNIQUE_VIOLATION_CODE = '23505';

export interface CatalogoLinea {
  codigo: string
  concepto: string
}

/** Una fila de la pantalla: un código del catálogo con su asignación actual. */
export interface MapeoFila {
  codigoLinea: string
  concepto: string
  cuentaContable: string
  lado: LadoMapeo | ''
  columnaImporte: ColumnaImporte | ''
}

/** Asignación ya guardada, tal como llega de `mapeo_1376`. */
export interface MapeoAsignacionInicial {
  codigoLinea: string
  cuentaContable: string
  lado: LadoMapeo
  columnaImporte: ColumnaImporte
}

/**
 * Fila de `plan_cuentas` cuyo `codigo_padi` coincide con un código de línea del
 * 1376 — TD-40. Solo aporta la cuenta contable: lado y columna de importe no
 * se capturan en `plan_cuentas`, así que quedan para que el contador los
 * complete.
 */
export interface SugerenciaPlanCuentas {
  codigoPadi: string
  cuentaContable: string
}

/**
 * Elemento del array `p_filas` que consume el RPC `guardar_mapeo_1376`. La
 * index signature `string` lo hace asignable a `Json` (el tipo del parámetro
 * RPC generado) — todos los valores son texto.
 */
export interface FilaGuardado {
  [key: string]: string
  codigo_linea: string
  cuenta_contable: string
  lado: LadoMapeo
  columna_importe: ColumnaImporte
}

/**
 * Une el catálogo con las asignaciones ya guardadas — una fila por código del
 * catálogo, vacía cuando ese código todavía no tiene cuenta.
 *
 * Cuando no hay asignación guardada, TD-40's `sugerencias` (derivadas del plan
 * de cuentas de la empresa) precargan la cuenta contable como punto de
 * partida — el contador completa lado y columna de importe, o la descarta
 * vaciando el campo. Una asignación ya guardada siempre gana sobre la
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
    return {
      codigoLinea: linea.codigo,
      concepto: linea.concepto,
      cuentaContable: asignada?.cuentaContable ?? sugerida?.cuentaContable ?? '',
      lado: asignada?.lado ?? '',
      columnaImporte: asignada?.columnaImporte ?? '',
    };
  });
}

/**
 * ¿La fila tiene una cuenta asignada? Una fila totalmente vacía es válida — ese
 * código simplemente no mapea a ninguna cuenta.
 */
export function filaTieneCuenta(fila: MapeoFila): boolean {
  return fila.cuentaContable.trim() !== '';
}

/** Una fila con cuenta pero sin lado o sin columna de importe está incompleta. */
export function filaIncompleta(fila: MapeoFila): boolean {
  return filaTieneCuenta(fila) && (fila.lado === '' || fila.columnaImporte === '');
}

/**
 * Primer problema de validación del mapeo completo, o `null` si está OK:
 * - una fila con cuenta pero incompleta (falta lado o columna)
 * - la misma cuenta contable asignada a dos códigos (rompe la biyección)
 */
export function validarMapeo(filas: MapeoFila[]): string | null {
  const incompleta = filas.find(filaIncompleta);
  if (incompleta) {
    return `El código ${incompleta.codigoLinea} tiene una cuenta asignada pero le falta el lado o la columna de importe.`;
  }

  const vistas = new Map<string, string>();
  for (const fila of filas) {
    if (!filaTieneCuenta(fila)) {
      continue;
    }
    const cuenta = fila.cuentaContable.trim();
    const previa = vistas.get(cuenta);
    if (previa) {
      return `La cuenta ${cuenta} está asignada a los códigos ${previa} y ${fila.codigoLinea}. Cada cuenta puede mapear a un solo código.`;
    }
    vistas.set(cuenta, fila.codigoLinea);
  }

  return null;
}

/** Payload para el RPC: solo las filas con cuenta asignada y completas. */
export function construirFilasParaGuardar(filas: MapeoFila[]): FilaGuardado[] {
  return filas
    .filter(f => filaTieneCuenta(f) && f.lado !== '' && f.columnaImporte !== '')
    .map(f => ({
      codigo_linea: f.codigoLinea,
      cuenta_contable: f.cuentaContable.trim(),
      lado: f.lado as LadoMapeo,
      columna_importe: f.columnaImporte as ColumnaImporte,
    }));
}
