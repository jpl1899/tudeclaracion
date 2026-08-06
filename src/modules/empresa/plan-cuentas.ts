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

export const DUPLICATE_RUT_ERROR_CODE = '23505';

// `plan_cuentas` also carries UNIQUE(empresa_id, codigo_iva) and
// UNIQUE(empresa_id, cuenta_contable), which raise the same 23505 code —
// the constraint name disambiguates a real RUT conflict from those.
export const RUT_UNIQUE_CONSTRAINT = 'empresa_cuenta_rut_unique';
