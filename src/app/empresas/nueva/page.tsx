import { redirect } from 'next/navigation';
import { createClient } from '@/infrastructure/supabase/server';
import { NuevaEmpresaClient } from './nueva-empresa-client';

/**
 * Server Component: solo verifica sesión. Desde el rediseño TD-7/TD-24
 * (2026-07-15) ya no hay catálogo fijo que precargar — Código de IVA, cuenta
 * contable y código PADI son datos libres que carga el usuario en el cliente.
 */
export default async function NuevaEmpresaPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  return <NuevaEmpresaClient />;
}
