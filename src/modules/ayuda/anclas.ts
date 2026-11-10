/**
 * Single source of the help anchors the app links to. Each id must exist
 * exactly once as `{#id}` in content/ayuda/*.md (enforced by anclas.test.ts).
 */
export const ANCLAS_AYUDA = {
  primerosPasos: 'primeros-pasos',
  archivoTxt: 'archivo-txt',
  encabezado1376: 'encabezado-1376',
  columnasEspeciales: 'columnas-especiales',
  erroresAlImportar: 'errores-al-importar',
  columnasDesordenadas: 'columnas-desordenadas',
  faltanColumnas: 'faltan-columnas',
  reemplazarPeriodo: 'reemplazar-periodo',
  limiteDeLineas: 'limite-de-lineas',
  asientosExcluidos: 'asientos-excluidos',
  mapeo1376: 'mapeo-1376',
  movimientosSinMapear1376: 'movimientos-sin-mapear-1376',
  dolaresYCotizacion: 'dolares-y-cotizacion',
  resultadosNegativos: 'resultados-negativos',
} as const;

/** Parser `field` value (parse-asientos.ts) → its column entry in the help. */
export const ANCLA_POR_CAMPO: Record<string, string> = {
  'Encabezado': 'campo-encabezado',
  'línea': 'campo-cantidad-de-campos',
  'Día': 'campo-dia',
  'Debe/Haber': 'campo-debe-haber',
  'Debe': 'campo-debe-haber',
  'Haber': 'campo-debe-haber',
  'Concepto': 'campo-concepto',
  'RUT': 'campo-rut',
  'Moneda': 'campo-moneda',
  'Total': 'campo-total',
  'Código IVA': 'campo-codigo-iva',
  'IVA': 'campo-iva',
  'Cotización': 'campo-cotizacion',
  'Libro': 'campo-libro',
  'Tipo': 'campo-tipo',
};

export function anclaParaCampo(campo: string): string {
  return ANCLA_POR_CAMPO[campo] ?? ANCLAS_AYUDA.erroresAlImportar;
}

export function hrefAyuda(ancla: string): string {
  return `/dashboard/ayuda#${ancla}`;
}
