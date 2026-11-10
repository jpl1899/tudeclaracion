'use server';

import { createAdminClient } from '@/infrastructure/supabase/admin';
import { createClient } from '@/infrastructure/supabase/server';
import { resolverCotizacionBcu } from './resolve-cotizacion-bcu';
import { asegurarCotizacionesBcuCacheadas } from './resolve-cotizacion-por-dia';

/**
 * The BCU cache is written with the admin client (users only have SELECT,
 * threat-model item 5), so these actions must check the session themselves:
 * RLS no longer stops an anonymous caller.
 */
async function haySesion(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user !== null;
}

export async function reintentarCotizacionBcu() {
  if (!(await haySesion())) {
    return { estado: 'error' } as const;
  }
  return resolverCotizacionBcu(createAdminClient());
}

/**
 * TD-27: puebla el caché de cotizaciones BCU para el período antes de
 * importar un TXT con líneas en dólares -- el fetch al BCU corre acá
 * (Server Action) porque su webservice no habilita CORS para el navegador.
 */
export async function poblarCotizacionesBcuParaPeriodo(periodo: string): Promise<{ ok: boolean }> {
  if (!(await haySesion())) {
    return { ok: false };
  }
  try {
    await asegurarCotizacionesBcuCacheadas(createAdminClient(), periodo);
    return { ok: true };
  }
  catch {
    return { ok: false };
  }
}
