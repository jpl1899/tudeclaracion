'use client';

import type { CuentaSinMapear } from '@/modules/validaciones-1376/detectar-cuentas-sin-mapear';
import Link from 'next/link';
import { useState } from 'react';
import { VerAyuda } from '@/components/ayuda/ver-ayuda';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { createClient } from '@/infrastructure/supabase/client';
import { ANCLAS_AYUDA } from '@/modules/ayuda/anclas';
import { generarArchivoPadi1376 } from '@/modules/exporter/generate-padi-file-1376';

export interface TotalRevision1376 {
  codigoLinea: string
  concepto: string
  importe: number
}

/**
 * Resultado que arma el Server Component. No hay estado "procesando" real
 * que observar: el cálculo (TD-41) es síncrono, igual que en el 2181.
 */
export type Revision1376
  = | { tipo: 'sin-datos' }
    | { tipo: 'error' }
    | { tipo: 'resultado', estado: string, totales: TotalRevision1376[], cuentasSinMapear: CuentaSinMapear[], codigosIvaSinMapear: number[] };

interface Revision1376ClientProps {
  empresaId: string
  empresaNombre: string
  periodo: string
  revision: Revision1376
}

function nombreArchivo(periodo: string) {
  return `1376_${periodo}.txt`;
}

/** "2 cuentas y 1 código de IVA", omitiendo la parte que esté vacía. */
function describirSinMapear(cuentas: number, codigosIva: number) {
  const partes = [
    cuentas === 0 ? '' : `${cuentas} ${cuentas === 1 ? 'cuenta' : 'cuentas'}`,
    codigosIva === 0 ? '' : `${codigosIva} ${codigosIva === 1 ? 'código de IVA' : 'códigos de IVA'}`,
  ];
  return partes.filter(Boolean).join(' y ');
}

function formatearImporte(importe: number) {
  return importe.toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Client Component: TD-43. Pantalla de revisión de totales del 1376 —
 * build spec-only sobre la plantilla del detalle 2181
 * (`declaracion-detalle-client.tsx`): mismo shell, mismas cards/badges.
 *
 * TD-44: el botón descarga el archivo PADI (mismo patrón Blob que el 2181)
 * y deja el 1376 en `generada`. Las cuentas o códigos de IVA sin mapear no
 * bloquean la descarga: lo que no está mapeado no corresponde al 1376
 * (confirmado con el contador 2026-10-21), así que el aviso es informativo.
 */
export function Revision1376Client({ empresaId, empresaNombre, periodo, revision }: Revision1376ClientProps) {
  const [descargando, setDescargando] = useState(false);
  const [estadoActual, setEstadoActual] = useState(revision.tipo === 'resultado' ? revision.estado : '');
  const [errorEstado, setErrorEstado] = useState(false);

  const conAdvertencia = revision.tipo === 'resultado'
    && (revision.cuentasSinMapear.length > 0 || revision.codigosIvaSinMapear.length > 0);
  const sinTotales = revision.tipo === 'resultado' && revision.totales.length === 0;
  const puedeDescargar = revision.tipo === 'resultado' && !sinTotales && !descargando;

  async function handleDescargar() {
    if (revision.tipo !== 'resultado' || !puedeDescargar) {
      return;
    }
    setDescargando(true);
    setErrorEstado(false);

    const contenido = generarArchivoPadi1376(revision.totales);
    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombreArchivo(periodo);
    enlace.click();
    URL.revokeObjectURL(url);

    if (estadoActual !== 'generada') {
      const supabase = createClient();
      const { error } = await supabase
        .from('declaracion_1376')
        .update({ estado: 'generada' })
        .eq('empresa_id', empresaId)
        .eq('periodo', periodo);
      if (error) {
        setErrorEstado(true);
      }
      else {
        setEstadoActual('generada');
      }
    }

    setDescargando(false);
  }

  return (
    <DashboardShell activeNav="declaraciones" empresaNombre={empresaNombre}>

      <main className="grid content-start gap-5 p-6">
        <div>
          <Link href="/dashboard" className="text-sm text-primary">
            ← Volver a declaraciones
          </Link>
          <h1 className="mt-2 font-heading text-3xl font-semibold leading-tight tracking-tight">
            Declaración 1376 —
            {' '}
            {periodo}
          </h1>
        </div>

        {revision.tipo === 'sin-datos' && (
          <Card data-testid="revision_1376_sin_datos" className="grid gap-3 p-6">
            <strong>Todavía no hay datos para este período</strong>
            <p className="text-muted-foreground">
              El 1376 se calcula a partir del TXT mensual de asientos. Importá el TXT de este período desde el inicio
              y volvé a esta pantalla para revisar los totales.
            </p>
            <div>
              <Button asChild variant="outline">
                <Link href="/dashboard">Ir a importar el TXT</Link>
              </Button>
            </div>
          </Card>
        )}

        {revision.tipo === 'error' && (
          <Card
            data-testid="revision_1376_error"
            className="grid gap-3 border-error/25 bg-error-bg p-6 text-error-text"
          >
            <strong>No pudimos calcular el 1376 de este período</strong>
            <p>
              Hubo un problema al leer los asientos o el mapeo del 1376. No se muestran totales para evitar que
              presentes un número incompleto. Recargá la página en unos minutos; si el problema sigue, revisá que el
              mapeo del 1376 de la empresa esté guardado.
            </p>
            <VerAyuda ancla={ANCLAS_AYUDA.mapeo1376} />
          </Card>
        )}

        {revision.tipo === 'resultado' && (
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <Card className="grid content-start gap-3.5 p-6">
              <div className="flex items-center justify-between gap-3">
                <strong>Totales por código de línea</strong>
                {conAdvertencia
                  ? <Badge variant="warning">Con advertencias</Badge>
                  : estadoActual === 'generada'
                    ? <Badge variant="success">Generada</Badge>
                    : <Badge variant="warning">Pendiente de generar</Badge>}
              </div>

              <p data-testid="revision_1376_agregacion" className="text-sm text-muted-foreground">
                Estos totales están agregados por cuenta contable, sin apertura por RUT (a diferencia del 2181).
              </p>

              {conAdvertencia && (
                <div
                  data-testid="revision_1376_cuentas_sin_mapear"
                  className="grid gap-2 rounded-md border border-warning/25 bg-warning-bg px-4 py-3 text-warning-text"
                >
                  <p className="font-semibold">
                    {`Hay ${describirSinMapear(revision.cuentasSinMapear.length, revision.codigosIvaSinMapear.length)} con movimiento sin mapear a ningún código del 1376.`}
                  </p>
                  <p className="text-sm">
                    Lo que no está mapeado no se incluye en el 1376. Si alguno debería ir, asignalo en el mapeo del 1376
                    de la empresa.
                    {' '}
                    <VerAyuda ancla={ANCLAS_AYUDA.movimientosSinMapear1376} />
                  </p>
                  <ul className="grid gap-1 pl-4 text-sm">
                    {revision.cuentasSinMapear.map(cuenta => (
                      <li key={cuenta.cuentaContable} className="list-disc">
                        {`Cuenta ${cuenta.cuentaContable} (código PADI ${cuenta.codigoLinea} en el plan de cuentas)`}
                      </li>
                    ))}
                    {revision.codigosIvaSinMapear.map(codigo => (
                      <li key={`iva-${codigo}`} data-testid="revision_1376_codigo_iva_sin_mapear" className="list-disc">
                        {`Código de IVA ${codigo} (asientos en formato rápido)`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {revision.totales.length === 0
                ? (
                    <p className="text-muted-foreground">
                      Ningún código de línea recibió movimiento en este período.
                    </p>
                  )
                : (
                    <table data-testid="revision_1376_totales" className="w-full border-collapse">
                      <thead>
                        <tr>
                          <th className="border-b border-border p-3 text-left text-xs uppercase tracking-wide text-muted-foreground">Código</th>
                          <th className="border-b border-border p-3 text-left text-xs uppercase tracking-wide text-muted-foreground">Concepto</th>
                          <th className="border-b border-border p-3 text-right text-xs uppercase tracking-wide text-muted-foreground">Importe</th>
                        </tr>
                      </thead>
                      <tbody>
                        {revision.totales.map(total => (
                          <tr key={total.codigoLinea}>
                            <td className="border-b border-border p-3 font-mono">{total.codigoLinea}</td>
                            <td className="border-b border-border p-3">{total.concepto}</td>
                            <td className="border-b border-border p-3 text-right font-mono">{formatearImporte(total.importe)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
            </Card>

            <Card className="grid content-start gap-3 p-6">
              <strong>Archivo PADI</strong>
              <p className="text-sm text-muted-foreground">
                Revisá los totales antes de descargar el archivo del 1376.
              </p>
              <Button
                size="lg"
                className="h-[52px]"
                data-testid="revision_1376_descargar"
                disabled={!puedeDescargar}
                onClick={() => void handleDescargar()}
              >
                {descargando ? 'Descargando…' : 'Descargar archivo PADI'}
              </Button>
              {sinTotales && (
                <p data-testid="revision_1376_sin_totales_descarga" className="text-sm text-muted-foreground">
                  No hay totales para descargar en este período.
                </p>
              )}
              {errorEstado && (
                <p
                  data-testid="revision_1376_error_estado"
                  className="rounded-md border border-error/25 bg-error-bg px-3 py-2 text-sm text-error-text"
                >
                  El archivo se descargó, pero no pudimos marcar el 1376 como generado. Volvé a descargarlo para reintentar.
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                La presentación ante DGI se hace fuera de tuDeclaracion, con este archivo.
              </p>
            </Card>
          </section>
        )}
      </main>
    </DashboardShell>
  );
}
