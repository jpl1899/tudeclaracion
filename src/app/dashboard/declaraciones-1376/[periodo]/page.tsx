import type { Revision1376 } from './revision-1376-client';
import type { LadoMapeo } from '@/modules/mapeo-1376/mapeo-1376';
import type { AsientoLine } from '@/modules/parser/parse-asientos';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/infrastructure/supabase/server';
import { EMPRESA_ACTIVA_COOKIE, resolverEmpresaActiva } from '@/modules/empresa/empresa-activa';
import { calcularTotalesLinea1376 } from '@/modules/generacion-1376/calcular-totales-1376';
import { UNIQUE_VIOLATION_CODE } from '@/modules/mapeo-1376/mapeo-1376';
import { detectarCuentasSinMapear } from '@/modules/validaciones-1376/detectar-cuentas-sin-mapear';
import { Revision1376Client } from './revision-1376-client';

interface Revision1376PageProps {
  params: Promise<{ periodo: string }>
}

interface CargarRevisionInput {
  supabase: Awaited<ReturnType<typeof createClient>>
  empresaId: string
  periodo: string
}

// La pantalla muestra un estado de error guiado en vez de tirar la página, así
// que la causa real solo queda en el log del servidor.
function fallo(contexto: string, error: { message: string } | null): Revision1376 {
  console.error(`[revision-1376] ${contexto}:`, error?.message);
  return { tipo: 'error' };
}

/**
 * Revisión de totales del Formulario 1376 — TD-43. Build spec-only (sin fila
 * en master-design-plan §8): reutiliza la pantalla de detalle del 2181
 * (`/dashboard/declaraciones/[periodo]`) como plantilla.
 *
 * Los asientos del período son los de la `declaracion` 2181 (mismo TXT
 * mensual, TD-41); `declaracion_1376` solo trackea el estado propio del 1376
 * y se crea en `abierta` la primera vez que se abre esta pantalla con datos.
 * A diferencia del 2181, un fallo al cargar/calcular no tira la página: se
 * muestra como estado "error" guiado (AC "Calculation error").
 */
async function cargarRevision({ supabase, empresaId, periodo }: CargarRevisionInput): Promise<Revision1376> {
  const { data: declaracion, error: declaracionError } = await supabase
    .from('declaracion')
    .select('id')
    .eq('empresa_id', empresaId)
    .eq('periodo', periodo)
    .maybeSingle();

  if (declaracionError) {
    return fallo('declaracion', declaracionError);
  }
  if (!declaracion) {
    return { tipo: 'sin-datos' };
  }

  const [asientosRes, mapeoRes, planCuentasRes, catalogoRes] = await Promise.all([
    supabase
      .from('asiento')
      .select('dia, rut, total, codigo_iva, iva, libro, tipo, debe, haber, moneda, cotizacion, concepto')
      .eq('declaracion_id', declaracion.id),
    supabase
      .from('mapeo_1376')
      .select('codigo_iva, codigo_linea, cuenta_contable, lado')
      .eq('empresa_id', empresaId),
    supabase
      .from('plan_cuentas')
      .select('cuenta_contable, codigo_padi')
      .eq('empresa_id', empresaId)
      .eq('declaracion', '1376'),
    supabase
      .from('codigo_linea_1376')
      .select('codigo, concepto')
      .order('orden'),
  ]);

  if (asientosRes.error || mapeoRes.error || planCuentasRes.error || catalogoRes.error) {
    return fallo(
      'carga de asientos/mapeo/plan de cuentas/catálogo',
      asientosRes.error ?? mapeoRes.error ?? planCuentasRes.error ?? catalogoRes.error,
    );
  }

  const asientos: AsientoLine[] = asientosRes.data.map(asiento => ({
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

  if (asientos.length === 0) {
    return { tipo: 'sin-datos' };
  }

  const mapeo = mapeoRes.data.map(fila => ({
    codigoIva: fila.codigo_iva,
    codigoLinea: fila.codigo_linea,
    cuentaContable: fila.cuenta_contable,
    lado: fila.lado as LadoMapeo,
  }));

  const conceptoPorCodigo = new Map(catalogoRes.data.map(linea => [linea.codigo, linea.concepto]));
  const orden = catalogoRes.data.map(linea => linea.codigo);

  const totales = calcularTotalesLinea1376(asientos, mapeo)
    .sort((a, b) => orden.indexOf(a.codigoLinea) - orden.indexOf(b.codigoLinea))
    .map(total => ({ ...total, concepto: conceptoPorCodigo.get(total.codigoLinea) ?? '' }));

  const cuentasSinMapear = detectarCuentasSinMapear({
    asientos,
    planCuentas: planCuentasRes.data.map(p => ({ cuentaContable: p.cuenta_contable, codigoPadi: p.codigo_padi })),
    codigosLinea: orden,
    cuentasMapeadas: mapeo.map(fila => fila.cuentaContable),
  });

  const buscarEstado = () => supabase
    .from('declaracion_1376')
    .select('estado')
    .eq('empresa_id', empresaId)
    .eq('periodo', periodo)
    .maybeSingle();

  const { data: existente, error: existenteError } = await buscarEstado();
  if (existenteError) {
    return fallo('declaracion_1376', existenteError);
  }
  if (existente) {
    return { tipo: 'resultado', estado: existente.estado, totales, cuentasSinMapear };
  }

  const { data: creada, error: creadaError } = await supabase
    .from('declaracion_1376')
    .insert({ empresa_id: empresaId, periodo })
    .select('estado')
    .single();

  if (creadaError?.code === UNIQUE_VIOLATION_CODE) {
    // Otra pestaña/request la creó entre el select y el insert: se relee.
    const { data: concurrente, error: concurrenteError } = await buscarEstado();
    if (concurrenteError || !concurrente) {
      return fallo('declaracion_1376 (relectura)', concurrenteError);
    }
    return { tipo: 'resultado', estado: concurrente.estado, totales, cuentasSinMapear };
  }
  if (creadaError) {
    return fallo('alta de declaracion_1376', creadaError);
  }

  return { tipo: 'resultado', estado: creada.estado, totales, cuentasSinMapear };
}

export default async function Revision1376Page({ params }: Revision1376PageProps) {
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

  const revision = await cargarRevision({ supabase, empresaId: empresaActiva.id, periodo });

  return (
    <Revision1376Client
      empresaId={empresaActiva.id}
      empresaNombre={empresaActiva.nombre}
      periodo={periodo}
      revision={revision}
    />
  );
}
