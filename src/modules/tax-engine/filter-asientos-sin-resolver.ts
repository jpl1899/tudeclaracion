import type { NormalizedAsiento } from '@/modules/normalizer/normalize-asiento';
import type { AsientoLine } from '@/modules/parser/parse-asientos';

type AsientoSinResolver = Extract<NormalizedAsiento, { resolved: false }>;

function claveAsientoAbierto(asiento: AsientoLine): string {
  return `${asiento.dia}|${asiento.concepto}|${asiento.libro}|${asiento.rut}`;
}

/**
 * Un asiento abierto puede llegar partido en varias líneas del TXT que
 * comparten Día+Concepto+Libro+RUT (confirmado con el contador 2026-07-24).
 * Dentro de un mismo grupo, una sola línea trae la cuenta configurada en el
 * plan de cuentas (la de IVA o compra exenta); las demás son contrapartidas
 * (cuentas reales, ej. Clientes, Ventas) que nunca van a estar mapeadas y no
 * deben reportarse como "sin mapeo" si el grupo ya resolvió por otra línea.
 */
export function filtrarAsientosSinResolver(
  asientos: AsientoLine[],
  resueltos: NormalizedAsiento[],
): AsientoSinResolver[] {
  const gruposResueltos = new Set<string>();
  for (let i = 0; i < asientos.length; i++) {
    if (resueltos[i]?.resolved) {
      gruposResueltos.add(claveAsientoAbierto(asientos[i]));
    }
  }

  const sinResolver: AsientoSinResolver[] = [];
  for (let i = 0; i < asientos.length; i++) {
    const resuelto = resueltos[i];
    if (resuelto === undefined || resuelto.resolved) {
      continue;
    }
    const esContrapartidaDeGrupoResuelto = resuelto.reason === 'sin-mapeo' && gruposResueltos.has(claveAsientoAbierto(asientos[i]));
    if (!esContrapartidaDeGrupoResuelto) {
      sinResolver.push(resuelto);
    }
  }

  return sinResolver;
}
