import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { createAdminClient } from '@/infrastructure/supabase/admin';
import { createClient } from '@/infrastructure/supabase/server';
import { CODIGO_DOLAR_INTERBANCARIO_FONDO } from '@/modules/cotizacion/fetch-cotizacion-bcu';
import { asegurarCotizacionesBcuCacheadas } from '@/modules/cotizacion/resolve-cotizacion-por-dia';

interface CotizacionesPageProps {
  searchParams: Promise<{ periodo?: string }>
}

function periodoActual(): string {
  const hoy = new Date();
  return `${hoy.getUTCFullYear()}${String(hoy.getUTCMonth() + 1).padStart(2, '0')}`;
}

function periodoAdyacente(periodo: string, delta: number): string {
  const anio = Number(periodo.slice(0, 4));
  const mes = Number(periodo.slice(4, 6));
  const fecha = new Date(Date.UTC(anio, mes - 1 + delta, 1));
  return `${fecha.getUTCFullYear()}${String(fecha.getUTCMonth() + 1).padStart(2, '0')}`;
}

function formatearPeriodo(periodo: string): string {
  const anio = periodo.slice(0, 4);
  const mes = Number(periodo.slice(4, 6));
  return new Date(Date.UTC(Number(anio), mes - 1, 1)).toLocaleDateString('es-UY', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

function formatearValor(valor: number): string {
  return `$ ${valor.toLocaleString('es-UY', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}`;
}

function formatearFecha(fecha: string): string {
  return new Date(`${fecha}T00:00:00`).toLocaleDateString('es-UY', { weekday: 'long', day: 'numeric', month: 'long' });
}

/**
 * Server Component: tabla de solo lectura con la cotización BCU día a día
 * del período (TD-27, 2026-07-28) — referencia para que el usuario entienda
 * qué valor va a tomar el motor para las líneas en dólares sin cotización
 * propia (día hábil anterior al asiento, ver resolve-cotizacion-por-dia.ts).
 * Sin mockup ratificado (Regla 14): tabla spec-only, mismo lenguaje visual
 * de Card/tabla que dashboard-client.tsx.
 */
export default async function CotizacionesPage({ searchParams }: CotizacionesPageProps) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { periodo: periodoParam } = await searchParams;
  const periodo = periodoParam && /^\d{6}$/.test(periodoParam) ? periodoParam : periodoActual();

  await asegurarCotizacionesBcuCacheadas(createAdminClient(), periodo);

  const anio = Number(periodo.slice(0, 4));
  const mes = Number(periodo.slice(4, 6));
  const primerDia = `${periodo.slice(0, 4)}-${periodo.slice(4, 6)}-01`;
  const ultimoDia = new Date(Date.UTC(anio, mes, 0)).toISOString().slice(0, 10);

  const { data: cotizaciones, error } = await supabase
    .from('cotizacion_bcu_cache')
    .select('fecha, valor')
    .eq('moneda_codigo', CODIGO_DOLAR_INTERBANCARIO_FONDO)
    .gte('fecha', primerDia)
    .lte('fecha', ultimoDia)
    .order('fecha', { ascending: true });

  if (error) {
    throw new Error(`No se pudieron cargar las cotizaciones: ${error.message}`);
  }

  return (
    <div className="grid min-h-screen content-start gap-5 p-6">
      <div>
        <Link href="/dashboard" className="text-primary hover:underline">← Volver al dashboard</Link>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight capitalize">
          Cotizaciones BCU —
          {' '}
          {formatearPeriodo(periodo)}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Dólar interbancario fondo, día hábil. Este es el valor de referencia que el motor usa
          (día hábil anterior al del asiento) para las líneas en dólares que no traen su propia
          cotización en el TXT.
        </p>
      </div>

      <div className="flex gap-3">
        <Link href={`/dashboard/cotizaciones?periodo=${periodoAdyacente(periodo, -1)}`} className="text-primary hover:underline">
          ← Mes anterior
        </Link>
        <Link href={`/dashboard/cotizaciones?periodo=${periodoAdyacente(periodo, 1)}`} className="text-primary hover:underline">
          Mes siguiente →
        </Link>
      </div>

      <Card className="p-6">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border-b border-border p-3 text-left text-xs uppercase tracking-wide text-muted-foreground">Fecha</th>
              <th className="border-b border-border p-3 text-left text-xs uppercase tracking-wide text-muted-foreground">Cotización</th>
            </tr>
          </thead>
          <tbody>
            {(cotizaciones ?? []).map(fila => (
              <tr key={fila.fecha}>
                <td className="border-b border-border p-3 capitalize">{formatearFecha(fila.fecha)}</td>
                <td className="border-b border-border p-3 font-mono">{formatearValor(fila.valor)}</td>
              </tr>
            ))}
            {(cotizaciones ?? []).length === 0 && (
              <tr>
                <td colSpan={2} className="border-b border-border p-3 text-center text-muted-foreground">
                  No hay cotizaciones cargadas para este período.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
