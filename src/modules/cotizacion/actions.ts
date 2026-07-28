'use server';

import { createClient } from '@/infrastructure/supabase/server';
import { resolverCotizacionBcu } from './resolve-cotizacion-bcu';
import { asegurarCotizacionesBcuCacheadas } from './resolve-cotizacion-por-dia';

export async function reintentarCotizacionBcu() {
  const supabase = await createClient();
  return resolverCotizacionBcu(supabase);
}

/**
 * TD-27: puebla el caché de cotizaciones BCU para el período antes de
 * importar un TXT con líneas en dólares -- el fetch al BCU corre acá
 * (Server Action) porque su webservice no habilita CORS para el navegador.
 */
export async function poblarCotizacionesBcuParaPeriodo(periodo: string): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  try {
    await asegurarCotizacionesBcuCacheadas(supabase, periodo);
    return { ok: true };
  }
  catch {
    return { ok: false };
  }
}
