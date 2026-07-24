'use server';

import { createClient } from '@/infrastructure/supabase/server';
import { resolverCotizacionBcu } from './resolve-cotizacion-bcu';

export async function reintentarCotizacionBcu() {
  const supabase = await createClient();
  return resolverCotizacionBcu(supabase);
}
