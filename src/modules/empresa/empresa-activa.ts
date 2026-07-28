import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

export const EMPRESA_ACTIVA_COOKIE = 'empresa_activa_id';

export interface EmpresaActiva {
  id: string
  nombre: string
  rut: string
}

/**
 * TD-5 (2026-07-28): resuelve qué empresa está activa para el usuario --
 * lee la cookie `empresa_activa_id` (seteada por `seleccionarEmpresaActiva`
 * en /empresas) y, si apunta a una empresa real de la cuenta (RLS scopea
 * `empresa` a `cuenta_id = auth.uid()`), la usa. Si la cookie no está o
 * apunta a una empresa que ya no existe/no es de esta cuenta, cae a la
 * empresa creada más recientemente -- mismo placeholder que existía antes
 * de conectar la selección real.
 */
export async function resolverEmpresaActiva(
  supabase: SupabaseClient<Database>,
  empresaIdCookie: string | undefined,
): Promise<EmpresaActiva | null> {
  if (empresaIdCookie) {
    const { data, error } = await supabase
      .from('empresa')
      .select('id, nombre, rut')
      .eq('id', empresaIdCookie)
      .maybeSingle();

    if (error) {
      throw new Error(`No se pudo cargar la empresa activa: ${error.message}`);
    }
    if (data) {
      return data;
    }
  }

  const { data, error } = await supabase
    .from('empresa')
    .select('id, nombre, rut')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(`No se pudo cargar la empresa activa: ${error.message}`);
  }

  return data?.[0] ?? null;
}
