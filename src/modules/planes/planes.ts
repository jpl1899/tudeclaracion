export type PlanId = 'inicial' | 'estudio' | 'profesional';

export interface Plan {
  id: PlanId
  nombre: string
  paraQuien: string
  empresas: string
  precioMensualUsd: number
  precioAnualUsd: number
  incluye: string[]
  recomendado: boolean
}

/**
 * Example subscription plans for the public landing (2026-10-26). Prices,
 * limits and names are placeholders agreed with the user to design the page;
 * the business model has not fixed them yet (`.context/business/business-model.md`).
 */
export const PLANES: Plan[] = [
  {
    id: 'inicial',
    nombre: 'Inicial',
    paraQuien: 'Contador independiente',
    empresas: 'Hasta 5 empresas',
    precioMensualUsd: 15,
    precioAnualUsd: 150,
    incluye: ['Declaraciones 2181, 1376, 2183 y 1050', '1 usuario', 'Soporte por email'],
    recomendado: false,
  },
  {
    id: 'estudio',
    nombre: 'Estudio',
    paraQuien: 'Estudio contable chico',
    empresas: 'Hasta 25 empresas',
    precioMensualUsd: 39,
    precioAnualUsd: 390,
    incluye: ['Declaraciones 2181, 1376, 2183 y 1050', '1 usuario', 'Soporte por email'],
    recomendado: true,
  },
  {
    id: 'profesional',
    nombre: 'Profesional',
    paraQuien: 'Estudio contable mediano',
    empresas: 'Empresas ilimitadas',
    precioMensualUsd: 79,
    precioAnualUsd: 790,
    incluye: ['Declaraciones 2181, 1376, 2183 y 1050', 'Varios usuarios (próximamente)', 'Soporte prioritario'],
    recomendado: false,
  },
];

export const DIAS_DE_PRUEBA = 14;

/** Resolves a `?plan=` value from the URL; anything unknown returns null. */
export function resolverPlan(valor: string | null): Plan | null {
  return PLANES.find(plan => plan.id === valor) ?? null;
}
