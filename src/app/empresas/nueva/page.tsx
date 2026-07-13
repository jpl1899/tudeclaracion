import { redirect } from 'next/navigation';
import { createClient } from '@/infrastructure/supabase/server';
import { NuevaEmpresaClient } from './nueva-empresa-client';

/**
 * Server Component: fetches the codigo_iva reference catalog (see ADR-0001 —
 * "reglas en DB, no hardcodeadas") and hands it to the interactive client
 * component so the 5 fixed rows are never duplicated in frontend code.
 */
export default async function NuevaEmpresaPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data, error } = await supabase
    .from('codigo_iva')
    .select('id, tipo, tasa, rubro_padi, descripcion')
    .order('id');

  if (error) {
    throw new Error(`No se pudo cargar el catálogo de IVA: ${error.message}`);
  }

  return <NuevaEmpresaClient catalogo={data} />;
}
