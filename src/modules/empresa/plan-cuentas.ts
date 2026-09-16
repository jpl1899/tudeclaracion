/**
 * Constantes compartidas del plan de cuentas (códigos PADI de IVA/Compras
 * Exentas, código de error de Postgres para RUT duplicado) — extraídas de
 * `nueva-empresa-client.tsx` (TD-7/TD-24) para reutilizarlas también en el
 * flujo de detalle/edición de empresa (TD-30), que necesita exactamente los
 * mismos tres valores.
 */
export const CODIGOS_PADI_IVA = [
  { value: '505', label: '505 — IVA compras tasa básica' },
  { value: '506', label: '506 — IVA compras tasa mínima' },
  { value: '502', label: '502 — IVA ventas tasa básica' },
  { value: '503', label: '503 — IVA ventas tasa mínima' },
] as const;

export const CODIGO_PADI_EXENTA = '504';

export interface CodigoLinea1376 {
  codigo: string
  concepto: string
}

export interface OpcionCodigoPadi {
  id: string
  codigoPadi: string
  label: string
}

/**
 * Combina el catálogo de códigos PADI del 2181 (`CODIGOS_PADI_IVA`, fijo) con
 * el catálogo de líneas del 1376 (`codigo_linea_1376`, config-driven). Algunos
 * códigos existen en ambos catálogos con conceptos distintos (ej. 502) — el
 * `id` sintético (`2181-<codigo>` / `1376-<codigo>`) evita que un <select>
 * controlado reciba dos <option> con el mismo `value`; `codigoPadi` sigue
 * siendo el código real que se manda a `crear_empresa_con_plan_cuentas`.
 */
export function buildOpcionesCodigoPadi(codigos1376: CodigoLinea1376[]): OpcionCodigoPadi[] {
  return [
    ...CODIGOS_PADI_IVA.map(opt => ({ id: `2181-${opt.value}`, codigoPadi: opt.value, label: opt.label })),
    ...codigos1376.map(c => ({ id: `1376-${c.codigo}`, codigoPadi: c.codigo, label: `${c.codigo} — ${c.concepto}` })),
  ];
}

export const DUPLICATE_RUT_ERROR_CODE = '23505';

// `plan_cuentas` also carries UNIQUE(empresa_id, codigo_iva) and
// UNIQUE(empresa_id, cuenta_contable), which raise the same 23505 code —
// the constraint name disambiguates a real RUT conflict from those.
export const RUT_UNIQUE_CONSTRAINT = 'empresa_cuenta_rut_unique';
