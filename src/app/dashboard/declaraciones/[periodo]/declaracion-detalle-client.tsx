'use client';

import type { NormalizedAsiento } from '@/modules/normalizer/normalize-asiento';
import type { LineaDeclaracion } from '@/modules/tax-engine/consolidate-lines';
import Link from 'next/link';
import { useState } from 'react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { createClient } from '@/infrastructure/supabase/client';
import { generarArchivoPadi } from '@/modules/exporter/generate-padi-file';

type AsientoSinResolver = Extract<NormalizedAsiento, { resolved: false }>;

/** TD-18: mensaje de por qué no resolvió, en el mismo lenguaje que ve Rosana en el resto de la app. */
const MENSAJE_POR_RAZON: Record<AsientoSinResolver['reason'], string> = {
  'sin-mapeo': 'no está mapeado en el plan de cuentas',
  'tipo-fuera-de-alcance': 'tiene un tipo fuera del alcance de esta declaración',
  'importe-invalido': 'tiene un importe inválido (no puede ser cero)',
  'libro-inconsistente': 'tiene un Libro que no coincide con el tipo de cuenta resuelta (revisar el TXT de origen)',
};

/**
 * Client Component: TD-20 (ADR-0003). Pantalla de detalle/descarga de una
 * declaración -- .context/design/master-design-plan.md §4.8, mockup en
 * .context/designs/tudeclaracion/declaracion-detalle/ (ver D6: shell real
 * de /dashboard, no el topbar propio del mockup).
 *
 * Los 3 estados del AC se resuelven así, dado que el pipeline (TD-15/TD-23)
 * es síncrono y no hay infraestructura de jobs asíncronos en el repo:
 *  - "con errores": algún asiento de esta declaración no resolvió (TD-15).
 *  - "generada": ya se generó el archivo al menos una vez (declaracion.estado).
 *  - "abierta" (sin errores, sin generar todavía): se muestra como pendiente
 *    de generar -- no hay un estado "procesando" real que observar.
 */
interface DeclaracionDetalleClientProps {
  empresaNombre: string
  empresaRut: string
  declaracionId: string
  periodo: string
  estado: string
  asientosSinResolver: AsientoSinResolver[]
  totalAsientos: number
  lineas: LineaDeclaracion[]
  tieneAsientosNegativos: boolean
}

function nombreArchivo(rut: string, periodo: string) {
  return `2181_${rut}_${periodo}.txt`;
}

export function DeclaracionDetalleClient({
  empresaNombre,
  empresaRut,
  declaracionId,
  periodo,
  estado,
  asientosSinResolver,
  totalAsientos,
  lineas,
  tieneAsientosNegativos,
}: DeclaracionDetalleClientProps) {
  const [estadoActual, setEstadoActual] = useState(estado);
  const [descargando, setDescargando] = useState(false);
  const [errorEstado, setErrorEstado] = useState(false);

  const conErrores = asientosSinResolver.length > 0;
  const generada = !conErrores && estadoActual === 'generada';
  const puedeDescargar = totalAsientos > 0 && !descargando;

  async function handleDescargar() {
    if (!puedeDescargar) { return; }
    setDescargando(true);
    setErrorEstado(false);

    const contenido = generarArchivoPadi({ rut: empresaRut, periodo }, lineas);
    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombreArchivo(empresaRut, periodo);
    enlace.click();
    URL.revokeObjectURL(url);

    if (estadoActual !== 'generada') {
      const supabase = createClient();
      const { error } = await supabase
        .from('declaracion')
        .update({ estado: 'generada' })
        .eq('id', declaracionId);
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
            Declaración 2181 —
            {' '}
            {periodo}
          </h1>
        </div>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="grid gap-3.5 p-6">
            <div className="flex items-center justify-between gap-3">
              <strong>Resultado del procesamiento</strong>
              {conErrores
                ? <Badge variant="warning">Con errores</Badge>
                : generada
                  ? <Badge variant="success">Generada</Badge>
                  : <Badge variant="warning">Pendiente de generar</Badge>}
            </div>

            {conErrores && (
              <div
                data-testid="declaracion_con_errores"
                className="grid gap-2 rounded-md border border-error/25 bg-error-bg px-4 py-3 text-error-text"
              >
                <p>
                  {asientosSinResolver.length === 1 ? 'Hay 1 asiento' : `Hay ${asientosSinResolver.length} asientos`}
                  {' '}
                  de este período que no se pudo resolver a un código PADI. Estas líneas no se incluyen en el archivo
                  PADI generado — si corresponden a una cuenta fiscal real, revisá el plan de cuentas de la empresa.
                </p>
                <ul className="grid gap-1 pl-4 text-sm">
                  {asientosSinResolver.map((asiento, indice) => (
                    <li key={`${asiento.rut}-${asiento.dia}-${indice}`} className="list-disc">
                      {`Día ${asiento.dia}, RUT ${asiento.rut}: ${asiento.valor} ${MENSAJE_POR_RAZON[asiento.reason]}.`}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!conErrores && (
              <p className="text-muted-foreground">
                {generada
                  ? 'El archivo PADI ya fue generado para este período. Podés volver a descargarlo cuando quieras.'
                  : 'Todos los asientos de este período resolvieron correctamente. Generá el archivo PADI cuando estés listo.'}
              </p>
            )}

            {tieneAsientosNegativos && (
              <div
                data-testid="declaracion_asientos_negativos"
                className="rounded-md border border-warning/25 bg-warning-bg px-4 py-3 text-sm text-warning-text"
              >
                Archivo con resultado negativo en algunos asientos. El archivo puede incluir líneas vacías.
              </div>
            )}
          </Card>

          <Card className="grid content-start gap-3 p-6">
            <strong>Archivo PADI</strong>
            <p className="text-sm text-muted-foreground">
              Convención: tipo de declaración + RUT + período + extensión TXT.
            </p>
            <div className="rounded-md border border-border bg-muted px-3 py-2 font-mono text-sm">
              {nombreArchivo(empresaRut, periodo)}
            </div>
            <Button
              size="lg"
              className="h-[52px]"
              disabled={!puedeDescargar}
              onClick={() => void handleDescargar()}
            >
              {descargando ? 'Generando…' : 'Descargar archivo PADI'}
            </Button>
            {errorEstado && (
              <p
                data-testid="declaracion_estado_error"
                className="rounded-md border border-error/25 bg-error-bg px-3 py-2 text-sm text-error-text"
              >
                El archivo se descargó, pero no pudimos guardar el estado "Generada" para este período.
                Volvé a intentar la descarga en unos minutos.
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              La presentación ante DGI se hace fuera de tuDeclaracion, con este archivo.
            </p>
          </Card>
        </section>
      </main>
    </DashboardShell>
  );
}
