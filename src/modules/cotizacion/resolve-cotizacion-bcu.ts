import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { CODIGO_DOLAR_INTERBANCARIO_FONDO, obtenerCotizacionBcu } from './fetch-cotizacion-bcu';

export type EstadoCotizacionBcu
  = | { estado: 'normal', fecha: string, valor: number }
    | { estado: 'fallback', fecha: string, valor: number }
    | { estado: 'error' };

/**
 * Dato puramente informativo para el sidebar del dashboard (ver decisión
 * 2026-07-24) -- nunca se usa para calcular asientos ni el archivo PADI, eso
 * sigue dependiendo del tipo de cambio que el usuario tipea a mano.
 * `cotizacion_bcu_cache` guarda el último valor obtenido con éxito para
 * poder mostrarlo como fallback cuando el fetch del día falla.
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
