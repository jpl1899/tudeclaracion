import type { PlanCuentaRow } from '@/modules/normalizer/normalize-asiento';
import type { AsientoLine } from '@/modules/parser/parse-asientos';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/infrastructure/supabase/server';
import { EMPRESA_ACTIVA_COOKIE, resolverEmpresaActiva } from '@/modules/empresa/empresa-activa';
import { resolveAsientoFiscal } from '@/modules/normalizer/normalize-asiento';
import { consolidarLineasDeclaracion, detectarLineasSinSaldoPositivo } from '@/modules/tax-engine/consolidate-lines';
import { filtrarAsientosSinResolver } from '@/modules/tax-engine/filter-asientos-sin-resolver';
import { DeclaracionDetalleClient } from './declaracion-detalle-client';

interface DeclaracionDetallePageProps {
  params: Promise<{ periodo: string }>
}

/**
 * Server Component: TD-20 (ADR-0003). Resuelve la declaración de la empresa
 * activa para el período de la ruta, corre la resolución fiscal (TD-15) +
 * la consolidación por RUT+código PADI (TD-23) en vivo sobre los asientos
 * ya guardados, y arma el archivo PADI listo para descargar (src/modules/exporter).
 */
export default async function DeclaracionDetallePage({ params }: DeclaracionDetallePageProps) {
  const { periodo } = await params;
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

  const { data: declaracion, error: declaracionError } = await supabase
    .from('declaracion')
    .select('id, periodo, estado')
    .eq('empresa_id', empresaActiva.id)
    .eq('periodo', periodo)
    .maybeSingle();

  if (declaracionError) {
    throw new Error(`No se pudo cargar la declaración: ${declaracionError.message}`);
  }

  if (!declaracion) {
    redirect('/dashboard');
  }

  const [{ data: asientos, error: asientosError }, { data: planCuentas, error: planCuentasError }] = await Promise.all([
    supabase
      .from('asiento')
      .select('dia, rut, total, codigo_iva, iva, libro, tipo, debe, haber, moneda, cotizacion, concepto')
      .eq('declaracion_id', declaracion.id),
    supabase
      .from('plan_cuentas')
      .select('cuenta_contable, codigo_padi, codigo_iva')
      .eq('empresa_id', empresaActiva.id)
      .eq('declaracion', '2181'),
  ]);

  if (asientosError) {
    throw new Error(`No se pudieron cargar los asientos: ${asientosError.message}`);
  }
  if (planCuentasError) {
    throw new Error(`No se pudo cargar el plan de cuentas: ${planCuentasError.message}`);
  }

  const planCuentasRows: PlanCuentaRow[] = (planCuentas ?? []).map(row => ({
    cuentaContable: row.cuenta_contable,
    codigoPadi: row.codigo_padi,
    codigoIva: row.codigo_iva,
  }));

  const asientoLines: AsientoLine[] = (asientos ?? []).map(asiento => ({
    dia: asiento.dia,
    debe: asiento.debe,
    haber: asiento.haber,
    concepto: asiento.concepto,
    rut: asiento.rut,
    moneda: asiento.moneda as AsientoLine['moneda'],
    total: asiento.total,
    codigoIva: asiento.codigo_iva,
    iva: asiento.iva,
    cotizacion: asiento.cotizacion,
    libro: asiento.libro as AsientoLine['libro'],
    tipo: asiento.tipo as AsientoLine['tipo'],
  }));

  const resueltos = asientoLines.map(linea => resolveAsientoFiscal(linea, planCuentasRows));
  const asientosSinResolver = filtrarAsientosSinResolver(asientoLines, resueltos);
  const lineas = consolidarLineasDeclaracion(resueltos);
  const lineasSinSaldoPositivo = detectarLineasSinSaldoPositivo(resueltos);
  const tieneAsientosNegativos = asientoLines.some(asiento => asiento.total < 0 || asiento.iva < 0);

  return (
    <DeclaracionDetalleClient
      empresaNombre={empresaActiva.nombre}
      empresaRut={empresaActiva.rut}
      declaracionId={declaracion.id}
      periodo={declaracion.periodo}
      estado={declaracion.estado}
      asientosSinResolver={asientosSinResolver}
      totalAsientos={resueltos.length}
      lineas={lineas}
      lineasSinSaldoPositivo={lineasSinSaldoPositivo}
      tieneAsientosNegativos={tieneAsientosNegativos}
    />
  );
}
