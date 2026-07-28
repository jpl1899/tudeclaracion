import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { calcularRangoConsultaPeriodo, CODIGO_DOLAR_INTERBANCARIO_FONDO, obtenerCotizacionesBcuRango } from './fetch-cotizacion-bcu';

function calcularFechaAsiento(periodo: string, dia: number): string {
  const anio = periodo.slice(0, 4);
  const mes = periodo.slice(4, 6);
  return `${anio}-${mes}-${String(dia).padStart(2, '0')}`;
}

/**
 * TD-27 (2026-07-28): puebla `cotizacion_bcu_cache` con el histórico del BCU
 * para todo el período (más el margen hacia atrás de `calcularRangoConsultaPeriodo`),
 * así `resolverCotizacionParaDia` puede resolver cualquier día del período sin
 * pegarle al webservice del BCU por cada línea en dólares. Idempotente --
 * upsert por (moneda_codigo, fecha).
 */
export async function asegurarCotizacionesBcuCacheadas(supabase: SupabaseClient<Database>, periodo: string): Promise<void> {
  const { fechaDesde, fechaHasta } = calcularRangoConsultaPeriodo(periodo);
  const cotizaciones = await obtenerCotizacionesBcuRango(fechaDesde, fechaHasta);

  if (cotizaciones.length === 0) {
    return;
  }

  await supabase
    .from('cotizacion_bcu_cache')
    .upsert(cotizaciones.map(c => ({ moneda_codigo: CODIGO_DOLAR_INTERBANCARIO_FONDO, fecha: c.fecha, valor: c.valor })));
}

/**
 * Resuelve la cotización de un asiento en dólares contra el día hábil
 * ANTERIOR al día del asiento (confirmado 2026-07-28, mismo criterio DGI ya
 * usado para el card informativo del sidebar) -- nunca el mismo día. `null`
 * si el caché no tiene ningún día anterior cargado para ese período.
 */
export async function resolverCotizacionParaDia(supabase: SupabaseClient<Database>, periodo: string, dia: number): Promise<number | null> {
  const fechaAsiento = calcularFechaAsiento(periodo, dia);

  const { data } = await supabase
    .from('cotizacion_bcu_cache')
    .select('valor')
    .eq('moneda_codigo', CODIGO_DOLAR_INTERBANCARIO_FONDO)
    .lt('fecha', fechaAsiento)
    .order('fecha', { ascending: false })
    .limit(1)
    .maybeSingle();

  return data?.valor ?? null;
}
