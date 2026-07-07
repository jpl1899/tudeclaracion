import type { Empresa } from './empresas-client';
import { redirect } from 'next/navigation';
import { createClient } from '@/infrastructure/supabase/server';
import { EmpresasClient } from './empresas-client';

/**
 * Server Component: fetches the authenticated cuenta's empresas via Supabase
 * (RLS scopes rows to cuenta_id = auth.uid(), see ADR/12-security.md) and
 * hands them to the interactive client component.
 */
export default async function EmpresasPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data, error } = await supabase
    .from('empresa')
    .select('nombre, rut, estado, responsable, ultimo_movimiento')
    .order('created_at', { ascending: false });

  if (error) {
    // RLS returns an empty array for "no rows", never an error — a query
    // error here means an infra/config problem, not an empty tenant.
    throw new Error(`No se pudieron cargar las empresas: ${error.message}`);
  }

  const empresas: Empresa[] = (data ?? []).map(row => ({
    nombre: row.nombre,
    rut: row.rut,
    estado: row.estado === 'Operativa' ? 'Operativa' : 'Pendiente',
    responsable: row.responsable ?? '',
    ultimoMovimiento: row.ultimo_movimiento ?? 'Sin actividad reciente',
  }));

  return <EmpresasClient empresas={empresas} />;
}
