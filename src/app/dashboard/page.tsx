import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createAdminClient } from '@/infrastructure/supabase/admin';
import { createClient } from '@/infrastructure/supabase/server';
import { resolverCotizacionBcu } from '@/modules/cotizacion/resolve-cotizacion-bcu';
import { armarPeriodos } from '@/modules/declaraciones/periodos';
import { EMPRESA_ACTIVA_COOKIE, resolverEmpresaActiva } from '@/modules/empresa/empresa-activa';
import { construirResumenInicio } from '@/modules/inicio/resumen-inicio';
import { DashboardClient } from './dashboard-client';

/**
 * Server Component: resuelve la empresa activa del usuario autenticado
 * (RLS scopes rows to cuenta_id = auth.uid(), ver .context/SRS/12-security.md)
 * para poder pasar un `empresaId` real al flujo de import de TD-13.
 *
 * TD-5 (2026-07-28): la empresa activa la fija /empresas en la cookie
 * `empresa_activa_id` -- ver `resolverEmpresaActiva`. Antes de esto siempre
 * se tomaba la empresa creada más recientemente, sin importar qué eligiera
 * el usuario en /empresas.
 */
export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const cookieStore = await cookies();
  const empresaActiva = await resolverEmpresaActiva(supabase, cookieStore.get(EMPRESA_ACTIVA_COOKIE)?.value);
  if (!empresaActiva) {
    redirect('/empresas');
  }

  const { data: declaraciones, error: declaracionesError } = await supabase
    .from('declaracion')
    .select('periodo, estado, updated_at')
    .eq('empresa_id', empresaActiva.id)
    .order('periodo', { ascending: false });

  if (declaracionesError) {
    throw new Error(`No se pudieron cargar las declaraciones: ${declaracionesError.message}`);
  }

  const { data: declaraciones1376, error: declaraciones1376Error } = await supabase
    .from('declaracion_1376')
    .select('periodo, estado, updated_at')
    .eq('empresa_id', empresaActiva.id);

  if (declaraciones1376Error) {
    throw new Error(`No se pudieron cargar las declaraciones 1376: ${declaraciones1376Error.message}`);
  }

  const cotizacionBcuInicial = await resolverCotizacionBcu(createAdminClient());

  const { data: cuenta, error: cuentaError } = await supabase.from('cuenta').select('nombre').eq('id', user.id).maybeSingle();
  if (cuentaError) {
    console.error('[dashboard] cuenta:', cuentaError);
  }
  const { saludo } = construirResumenInicio({ nombre: cuenta?.nombre ?? null, empresas: null, pendientes: null });

  return (
    <DashboardClient
      saludo={saludo}
      empresaId={empresaActiva.id}
      empresaNombre={empresaActiva.nombre}
      declaraciones={declaraciones ?? []}
      periodos={armarPeriodos(declaraciones ?? [], declaraciones1376 ?? [])}
      cotizacionBcuInicial={cotizacionBcuInicial}
    />
  );
}
