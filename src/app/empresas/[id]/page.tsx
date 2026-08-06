import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/infrastructure/supabase/server';
import { CODIGO_PADI_EXENTA } from '@/modules/empresa/plan-cuentas';
import { EmpresaDetalleClient } from './empresa-detalle-client';

/**
 * Detalle/edición de empresa existente — TD-30, .context/design/master-design-plan.md
 * §4.9, mockup en .context/designs/tudeclaracion/company-detail-edit/empresa-detalle-edicion.html
 *
 * Server Component: fetch de la empresa + su plan_cuentas (ambos scoped por
 * RLS a `cuenta_id = auth.uid()`, ver empresa_select_own/plan_cuentas_select_own),
 * separado en filas de IVA vs. Compras Exentas y pasado ya precargado al
 * client component — mismo patrón que /empresas (page.tsx + *-client.tsx).
 */
export default async function EmpresaDetallePage({ params }: { params: Promise<{ id: string }> }) {
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

  // Fila null: el id no existe o pertenece a otra cuenta -- RLS ya scopeó la
  // consulta, así que ambos casos son indistinguibles por diseño (nunca
  // revelar a un caller no autorizado si el id "existe pero no es tuyo").
  if (!empresa) {
    notFound();
  }

  const { data: planCuentas, error: planCuentasError } = await supabase
    .from('plan_cuentas')
    .select('id, cuenta_contable, codigo_padi, codigo_iva')
    .eq('empresa_id', id);

  if (planCuentasError) {
    throw new Error(`No se pudo cargar el plan de cuentas: ${planCuentasError.message}`);
  }

  const rows = planCuentas ?? [];
  const ivaRows = rows
    .filter(row => row.codigo_padi !== CODIGO_PADI_EXENTA)
    .map(row => ({
      id: row.id,
      codigoIva: row.codigo_iva !== null ? String(row.codigo_iva) : '',
      cuentaContable: row.cuenta_contable,
      codigoPadi: row.codigo_padi,
    }));
  const exentaRows = rows
    .filter(row => row.codigo_padi === CODIGO_PADI_EXENTA)
    .map(row => ({
      id: row.id,
      cuentaContable: row.cuenta_contable,
    }));

  return <EmpresaDetalleClient empresa={empresa} ivaRowsIniciales={ivaRows} exentaRowsIniciales={exentaRows} />;
}
