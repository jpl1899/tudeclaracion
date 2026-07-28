import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { CODIGO_DOLAR_INTERBANCARIO_FONDO, obtenerCotizacionBcu } from './fetch-cotizacion-bcu';

export type EstadoCotizacionBcu
  = | { estado: 'normal', fecha: string, valor: number }
    | { estado: 'fallback', fecha: string, valor: number }
    | { estado: 'error' };

/**
 * Resuelve el valor MÁS RECIENTE para el card informativo del sidebar del
 * dashboard (ver decisión 2026-07-24). Distinto de `resolverCotizacionParaDia`
 * (resolve-cotizacion-por-dia.ts), que desde TD-27 (2026-07-28) sí alimenta
 * el motor -- resuelve el día hábil anterior a un asiento puntual, no el más
 * reciente. `cotizacion_bcu_cache` guarda el histórico completo por fecha
 * (no solo el último valor) para poder servir ambos casos de uso.
 */
export async function resolverCotizacionBcu(supabase: SupabaseClient<Database>): Promise<EstadoCotizacionBcu> {
  try {
    const cotizacion = await obtenerCotizacionBcu();

    await supabase
      .from('cotizacion_bcu_cache')
      .upsert({ moneda_codigo: CODIGO_DOLAR_INTERBANCARIO_FONDO, fecha: cotizacion.fecha, valor: cotizacion.valor });

    return { estado: 'normal', fecha: cotizacion.fecha, valor: cotizacion.valor };
  }
  catch {
    const { data } = await supabase
      .from('cotizacion_bcu_cache')
      .select('fecha, valor')
      .eq('moneda_codigo', CODIGO_DOLAR_INTERBANCARIO_FONDO)
      .maybeSingle();

    if (!data) {
      return { estado: 'error' };
    }

    return { estado: 'fallback', fecha: data.fecha, valor: data.valor };
  }
}
