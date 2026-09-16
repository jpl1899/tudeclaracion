import { redirect } from 'next/navigation';
import { createClient } from '@/infrastructure/supabase/server';
import { NuevaEmpresaClient } from './nueva-empresa-client';

/**
 * Server Component: verifica sesión y precarga el catálogo `codigo_linea_1376`
 * (mismo patrón que `/empresas/[id]/mapeo-1376/page.tsx`) para que el dropdown
 * de Código PADI ofrezca también las líneas del 1376, además de las fijas del
 * 2181. Desde el rediseño TD-7/TD-24 (2026-07-15), Código de IVA y cuenta
 * contable siguen siendo datos libres que carga el usuario en el cliente.
 */
export default async function NuevaEmpresaPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: codigos1376, error: codigos1376Error } = await supabase
    .from('codigo_linea_1376')
    .select('codigo, concepto')
    .order('orden');

  if (codigos1376Error) {
    throw new Error(`No se pudo cargar el catálogo de códigos del 1376: ${codigos1376Error.message}`);
  }

  return <NuevaEmpresaClient codigos1376={codigos1376 ?? []} />;
}
