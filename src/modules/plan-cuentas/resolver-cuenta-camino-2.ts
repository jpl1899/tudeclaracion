const LIBROS_VENTA = ['V', 'I'];
const LIBROS_COMPRA = ['C', 'E'];

export interface PlanCuentaRow {
  cuentaContable: string
  codigoPadi: string
  codigoIva: number | null
}

export interface ResolucionCuentaCamino2 {
  candidatos: PlanCuentaRow[]
  cuentaMatch: PlanCuentaRow | undefined
}

/**
 * El prefijo de la cuenta de IVA es el dato confiable para inferir
 * venta/compra -- Libro puede venir mal cargado en el TXT (confirmado con el
 * contador, revierte la decisión del 2026-07-21). Cuentas que no arrancan con
 * 1 o 2 (ej. Gastos, usadas para compras exentas) no tienen dirección propia
 * y no se cruzan contra Libro. `Libro = 'P'` tampoco tiene dirección inferible
 * (uso libre de data entry, ver `05-parser.md`).
 */
function esConsistenteConLibro(cuenta: PlanCuentaRow, libro: string): boolean {
  if (libro === 'P') { return true; }
  if (cuenta.cuentaContable.startsWith('2')) { return LIBROS_VENTA.includes(libro); }
  if (cuenta.cuentaContable.startsWith('1')) { return LIBROS_COMPRA.includes(libro); }
  return true;
}

/**
 * Camino 2 (asiento abierto, Código IVA = 0): busca qué cuenta de Debe/Haber
 * matchea el plan de cuentas y, entre los candidatos que matchean, prefiere
 * el consistente con Libro. Compartido entre el parser (para reportar un
 * Libro inconsistente junto al resto de los campos inválidos de la línea,
 * 2026-08-02) y el motor tributario (para resolver o excluir la línea).
 */
export function resolverCuentaCamino2(debe: string, haber: string, libro: string, planCuentas: PlanCuentaRow[]): ResolucionCuentaCamino2 {
  const candidatos = [debe, haber]
    .filter(cuenta => cuenta.length > 0)
    .map(cuenta => planCuentas.find(row => row.cuentaContable === cuenta))
    .filter((match): match is PlanCuentaRow => match !== undefined);

  const cuentaMatch = candidatos.find(cuenta => esConsistenteConLibro(cuenta, libro));

  return { candidatos, cuentaMatch };
}
