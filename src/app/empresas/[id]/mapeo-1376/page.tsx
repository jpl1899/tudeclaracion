import type { ColumnaImporte, LadoMapeo } from '@/modules/mapeo-1376/mapeo-1376';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/infrastructure/supabase/server';
import { combinarCatalogoConAsignaciones } from '@/modules/mapeo-1376/mapeo-1376';
import { Mapeo1376Client } from './mapeo-1376-client';

/**
 * Configuración del mapeo del Formulario 1376 — TD-38,
 * `.context/design/master-design-plan.md` §5 D10 (build spec-only: reutiliza el
 * patrón de tabla editable de `/empresas/[id]`, sin mockup propio).
 *
 * Server Component: resuelve la empresa (RLS), el catálogo `codigo_linea_1376`,
 * las asignaciones ya guardadas de esta empresa y su plan de cuentas (TD-40:
 * fuente de la sugerencia de mapeo base), los combina en una fila por código y
 * los pasa precargados al client component — mismo patrón que
 * `/empresas/[id]/page.tsx`.
 */
export default async function Mapeo1376Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_PATTERN.test(id)) {
    notFound();
  }

  const { data: empresa, error: empresaError } = await supabase
    .from('empresa')
    .select('id, nombre, rut')
    .eq('id', id)
    .maybeSingle();

  if (empresaError) {
    throw new Error(`No se pudo cargar la empresa: ${empresaError.message}`);
  }

  // Fila null: el id no existe o pertenece a otra cuenta — RLS ya scopeó la
  // consulta, así que ambos casos son indistinguibles por diseño.
  if (!empresa) {
    notFound();
  }

  const { data: catalogo, error: catalogoError } = await supabase
    .from('codigo_linea_1376')
    .select('codigo, concepto')
    .order('orden');

  if (catalogoError) {
    throw new Error(`No se pudo cargar el catálogo de códigos del 1376: ${catalogoError.message}`);
  }

  const { data: asignaciones, error: asignacionesError } = await supabase
    .from('mapeo_1376')
    .select('codigo_linea, cuenta_contable, lado, columna_importe')
    .eq('empresa_id', id);

  if (asignacionesError) {
    throw new Error(`No se pudo cargar el mapeo del 1376: ${asignacionesError.message}`);
  }

  const { data: planCuentas, error: planCuentasError } = await supabase
    .from('plan_cuentas')
    .select('cuenta_contable, codigo_padi')
    .eq('empresa_id', id)
    .eq('declaracion', '1376');

  if (planCuentasError) {
    throw new Error(`No se pudo cargar el plan de cuentas: ${planCuentasError.message}`);
  }

  const filasIniciales = combinarCatalogoConAsignaciones(
    catalogo ?? [],
    (asignaciones ?? []).map(a => ({
      codigoLinea: a.codigo_linea,
      cuentaContable: a.cuenta_contable,
      lado: a.lado as LadoMapeo,
      columnaImporte: a.columna_importe as ColumnaImporte,
    })),
    (planCuentas ?? []).map(p => ({
      codigoPadi: p.codigo_padi,
      cuentaContable: p.cuenta_contable,
    })),
  );

  return <Mapeo1376Client empresa={empresa} filasIniciales={filasIniciales} />;
}
