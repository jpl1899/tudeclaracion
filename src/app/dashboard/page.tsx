import { redirect } from 'next/navigation';
import { createClient } from '@/infrastructure/supabase/server';
import { DashboardClient } from './dashboard-client';

/**
 * Server Component: resuelve la empresa activa del usuario autenticado
 * (RLS scopes rows to cuenta_id = auth.uid(), ver .context/SRS/12-security.md)
 * para poder pasar un `empresaId` real al flujo de import de TD-13.
 *
 * Selección explícita de empresa activa (más de una empresa por cuenta) es
 * responsabilidad de /empresas (TD-5) — acá solo se toma la primera como
 * placeholder mínimo hasta que ese flujo esté conectado al dashboard.
 */
export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data, error } = await supabase
    .from('empresa')
    .select('id, nombre')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(`No se pudo cargar la empresa activa: ${error.message}`);
  }

  const empresaActiva = data?.[0];
  if (!empresaActiva) {
    redirect('/empresas');
  }

  return <DashboardClient empresaId={empresaActiva.id} empresaNombre={empresaActiva.nombre} />;
}
