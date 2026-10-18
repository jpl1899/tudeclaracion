'use client';

import type { ImportarAsientoOpciones, ImportarAsientoResultado } from '@/components/importar-asiento-dialog';
import type { EstadoCotizacionBcu } from '@/modules/cotizacion/resolve-cotizacion-bcu';
import type { PlanCuentaRow } from '@/modules/plan-cuentas/resolver-cuenta-camino-2';
import type { Json } from '@/types/supabase';
import { Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { ImportarAsientoDialog } from '@/components/importar-asiento-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { createClient } from '@/infrastructure/supabase/client';
import { ANCLAS_AYUDA } from '@/modules/ayuda/anclas';
import { poblarCotizacionesBcuParaPeriodo, reintentarCotizacionBcu } from '@/modules/cotizacion/actions';
import { resolverCotizacionParaDia } from '@/modules/cotizacion/resolve-cotizacion-por-dia';
import { parseAsientosTxt, parseAsientosTxt1376 } from '@/modules/parser/parse-asientos';

/**
 * Dashboard / Panel principal — .context/design/master-design-plan.md §4.3,
 * mockup en .context/designs/tudeclaracion/mvp-core-screens/dashboard.html
 *
 * Client Component: recibe la empresa activa ya resuelta por el Server
 * Component (page.tsx). TD-13 conecta "Importar asiento" (TD-11) al parser
 * real: parsea client-side (puramente técnico, sin red) y solo llama a
 * Supabase si el archivo es 100% válido — inserción atómica vía el RPC
 * insertar_asientos (ver supabase/migrations/20260717171500_*.sql).
 *
 * Card "Cotización interbancario fondo" (sidebar) — mockup en
 * .context/designs/tudeclaracion/Dashboard/dashboard.html. Sigue siendo
 * informativa (día hábil anterior a HOY, ver decisión 2026-07-24) — distinta
 * del valor que efectivamente se usa por asiento (día hábil anterior AL
 * ASIENTO, TD-27 2026-07-28, ver `resolverCotizacionParaDia`). `page.tsx`
 * resuelve el estado inicial server-side (evita CORS contra el webservice
 * del BCU); "Reintentar" llama al Server Action `reintentarCotizacionBcu`.
 */
const badgeVariant: Record<string, 'success' | 'warning'> = {
  abierta: 'warning',
  generada: 'success',
};

const estadoLabel: Record<string, string> = {
  abierta: 'Pendiente de generar',
  generada: 'Generada',
};

interface DeclaracionResumen {
  periodo: string
  estado: string
  updated_at: string
}

interface DashboardClientProps {
  saludo: string
  empresaId: string
  empresaNombre: string
  declaraciones: DeclaracionResumen[]
  cotizacionBcuInicial: EstadoCotizacionBcu
}

/**
 * 1376 no tiene carga propia: se calcula sobre los mismos asientos que el
 * 2181, así que ambos botones abren la misma importación. 2183 y 1050 todavía
 * no existen y se muestran deshabilitados.
 */
type TipoDeclaracion = '2181' | '1376' | '2183' | '1050';

const TIPOS_DECLARACION: { tipo: TipoDeclaracion, disponible: boolean }[] = [
  { tipo: '2181', disponible: true },
  { tipo: '1376', disponible: true },
  { tipo: '2183', disponible: false },
  { tipo: '1050', disponible: false },
];

function formatearValorCotizacion(valor: number): string {
  return `$ ${valor.toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatearFechaCotizacion(fecha: string): string {
  return new Date(`${fecha}T00:00:00`).toLocaleDateString('es-UY');
}

/** `202610` → `10/2026`. */
function formatearPeriodo(periodo: string): string {
  return `${periodo.slice(4)}/${periodo.slice(0, 4)}`;
}

export function DashboardClient({ saludo, empresaId, empresaNombre, declaraciones, cotizacionBcuInicial }: DashboardClientProps) {
  const router = useRouter();
  const [importarAbierto, setImportarAbierto] = useState(false);
  const [tipoImportacion, setTipoImportacion] = useState<TipoDeclaracion>('2181');
  const [periodoImportado, setPeriodoImportado] = useState<string | null>(null);
  const [cotizacionBcu, setCotizacionBcu] = useState(cotizacionBcuInicial);
  const [reintentando, startReintentar] = useTransition();
  const [periodoABorrar, setPeriodoABorrar] = useState<string | null>(null);
  const [errorBorrado, setErrorBorrado] = useState<string | null>(null);
  const [borrando, startBorrar] = useTransition();

  const pendientesDeGenerar = declaraciones.filter(d => d.estado === 'abierta').length;
  const generadas = declaraciones.filter(d => d.estado === 'generada').length;
  const ultimaActualizacion = declaraciones.reduce<string | null>(
    (max, d) => (max === null || d.updated_at > max ? d.updated_at : max),
    null,
  );

  function handleAbrirImportacion(tipo: TipoDeclaracion): void {
    setTipoImportacion(tipo);
    setPeriodoImportado(null);
    setImportarAbierto(true);
  }

  /** Al cerrar tras una carga exitosa del 1376, lleva a su revisión del período importado. */
  function handleImportarOpenChange(open: boolean): void {
    setImportarAbierto(open);
    if (!open && tipoImportacion === '1376' && periodoImportado) {
      router.push(`/dashboard/declaraciones-1376/${periodoImportado}`);
    }
  }

  function handleReintentarCotizacion(): void {
    startReintentar(async () => {
      setCotizacionBcu(await reintentarCotizacionBcu());
    });
  }

  function handleBorrarOpenChange(open: boolean): void {
    // No se cierra mientras el borrado está en vuelo.
    if (!open && borrando) { return; }
    if (!open) {
      setPeriodoABorrar(null);
      setErrorBorrado(null);
    }
  }

  /** v1.0: borra el período entero -- 2181, 1376 y sus asientos -- en una sola transacción (`borrar_periodo`). */
  function handleConfirmarBorrado(): void {
    if (!periodoABorrar) { return; }
    const periodo = periodoABorrar;
    startBorrar(async () => {
      const { error } = await createClient().rpc('borrar_periodo', { p_empresa_id: empresaId, p_periodo: periodo });
      if (error) {
        setErrorBorrado('No se pudo borrar el período. Intentá nuevamente en unos minutos.');
        return;
      }
      setPeriodoABorrar(null);
      setErrorBorrado(null);
      router.refresh();
    });
  }

  async function handleCheckPeriodo(periodo: string): Promise<boolean> {
    const supabase = createClient();
    const { data: declaracion } = await supabase
      .from('declaracion')
      .select('id')
      .eq('empresa_id', empresaId)
      .eq('periodo', periodo)
      .maybeSingle();

    if (!declaracion) { return false; }

    const { count } = await supabase
      .from('asiento')
      .select('*', { count: 'exact', head: true })
      .eq('declaracion_id', declaracion.id);

    return (count ?? 0) > 0;
  }

  async function handleImportar(file: File, periodo: string, opciones: ImportarAsientoOpciones): Promise<ImportarAsientoResultado> {
    const supabase = createClient();

    /**
     * El parser necesita el plan de cuentas para cruzar Libro contra el
     * prefijo de la cuenta de IVA resuelta (Camino 2, confirmado con el
     * contador 2026-08-02). Si la consulta falla, se sigue con un plan vacío
     * -- el chequeo simplemente no encuentra candidatos y no bloquea la
     * importación por un problema de red ajeno al archivo.
     */
    const { data: planCuentasRaw } = await supabase
      .from('plan_cuentas')
      .select('cuenta_contable, codigo_padi, codigo_iva')
      .eq('empresa_id', empresaId)
      .eq('declaracion', '2181');
    const planCuentas: PlanCuentaRow[] = (planCuentasRaw ?? []).map(row => ({
      cuentaContable: row.cuenta_contable,
      codigoPadi: row.codigo_padi,
      codigoIva: row.codigo_iva,
    }));

    const contenido = await file.text();
    // ADR-0009: solo el 1376 lee las columnas por el título del encabezado; el 2181 sigue leyendo por posición.
    const parsear = tipoImportacion === '1376' ? parseAsientosTxt1376 : parseAsientosTxt;
    const resultado = parsear(contenido, planCuentas, opciones.camposEspecialesHabilitados);

    if (!resultado.ok) {
      return { kind: 'parse', line: resultado.line, errors: resultado.errors };
    }

    /**
     * TD-27 (2026-07-28): la columna Cotización del TXT manda si viene ≠0
     * (asiento resuelto por el proveedor contable); si viene en 0, se resuelve
     * contra el día hábil anterior al día del asiento en la tabla del BCU.
     */
    const lineasEnDolaresSinCotizacion = resultado.lines.filter(linea => linea.moneda === 1 && linea.cotizacion === 0);
    if (lineasEnDolaresSinCotizacion.length > 0) {
      const { ok } = await poblarCotizacionesBcuParaPeriodo(periodo);
      if (!ok) {
        return { kind: 'cotizacion-no-disponible', message: 'No se pudo obtener la cotización del BCU para este período. Intentá nuevamente en unos minutos.', ayuda: ANCLAS_AYUDA.dolaresYCotizacion };
      }
    }

    const lineas = [];
    for (const linea of resultado.lines) {
      if (linea.moneda !== 1 || linea.cotizacion !== 0) {
        lineas.push(linea);
        continue;
      }
      const valor = await resolverCotizacionParaDia(supabase, periodo, linea.dia);
      if (valor === null) {
        return { kind: 'cotizacion-no-disponible', message: `No se encontró cotización del BCU para el día hábil anterior al ${linea.dia} del período.`, ayuda: ANCLAS_AYUDA.dolaresYCotizacion };
      }
      lineas.push({ ...linea, cotizacion: valor });
    }

    const { error } = await supabase.rpc('insertar_asientos', {
      p_empresa_id: empresaId,
      p_periodo: periodo,
      p_lineas: lineas as unknown as Json,
      p_reemplazar: opciones.reemplazar,
    });

    if (error?.message === 'demasiadas_lineas') {
      return { kind: 'guardado', message: 'El archivo supera el máximo de 20.000 líneas por período.', ayuda: ANCLAS_AYUDA.limiteDeLineas };
    }
    if (error) {
      return { kind: 'guardado', message: 'No se pudo guardar el archivo. Intentá nuevamente en unos minutos.' };
    }

    router.refresh();
    setPeriodoImportado(periodo);
    const tieneAsientosNegativos = lineas.some(linea => linea.total < 0 || linea.iva < 0);
    return { kind: 'ok', tieneAsientosNegativos };
  }

  return (
    <DashboardShell
      activeNav="panel"
      empresaNombre={empresaNombre}
      sidebarExtra={(
        <article
          className={
            cotizacionBcu.estado === 'error'
              ? 'grid gap-0.5 rounded-md border border-destructive/30 bg-destructive/5 p-3.5 text-sm'
              : cotizacionBcu.estado === 'fallback'
                ? 'grid gap-0.5 rounded-md border border-warning/30 bg-warning-bg p-3.5 text-sm'
                : 'grid gap-0.5 rounded-md border border-border bg-muted p-3.5 text-sm'
          }
        >
          <span className="text-muted-foreground">Cotización interbancario fondo</span>

          {reintentando && (
            <span className="font-semibold text-foreground">Consultando BCU...</span>
          )}

          {!reintentando && cotizacionBcu.estado === 'error' && (
            <span className="font-semibold text-destructive">No se pudo obtener la cotización</span>
          )}

          {!reintentando && cotizacionBcu.estado !== 'error' && (
            <span className="font-semibold text-foreground">{formatearValorCotizacion(cotizacionBcu.valor)}</span>
          )}

          {!reintentando && cotizacionBcu.estado === 'normal' && (
            <span className="text-muted-foreground">{`Valor BCU del ${formatearFechaCotizacion(cotizacionBcu.fecha)} (día hábil anterior)`}</span>
          )}

          {!reintentando && cotizacionBcu.estado === 'fallback' && (
            <span className="text-warning-text">{`Último valor disponible — ${formatearFechaCotizacion(cotizacionBcu.fecha)} (no se pudo actualizar hoy)`}</span>
          )}

          {!reintentando && cotizacionBcu.estado === 'error' && (
            <button
              type="button"
              onClick={handleReintentarCotizacion}
              className="mt-1 w-fit rounded-md border border-border bg-card px-3 py-1.5 text-sm font-semibold text-foreground"
            >
              Reintentar
            </button>
          )}

          <Link href="/dashboard/cotizaciones" className="mt-1 w-fit text-primary hover:underline">
            Ver tabla completa
          </Link>
        </article>
      )}
    >

      <main className="grid content-start gap-5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/inicio" className="text-primary hover:underline">← Volver a Inicio</Link>
            <h1 className="mt-2 font-heading text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
              {`${saludo}.`}
            </h1>
            <p className="mt-2 text-muted-foreground">
              Acceso directo a la operación diaria del estudio. El siguiente paso principal está
              primero y sin competencia visual.
            </p>
          </div>
        </div>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="grid gap-3.5 rounded-md border border-border bg-gradient-to-b from-primary/5 to-white p-6 shadow-sm">
            <Badge variant="success">Acción principal</Badge>
            <h2 className="text-2xl font-semibold tracking-tight">Crear declaración</h2>
            <p className="text-muted-foreground">
              Elegí el formulario, cargá el TXT del proveedor contable, revisá validaciones y
              generá el archivo PADI en un mismo flujo.
            </p>
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {TIPOS_DECLARACION.map(({ tipo, disponible }) => (
                <Button
                  key={tipo}
                  size="lg"
                  variant={disponible ? 'default' : 'outline'}
                  className="h-auto min-h-[52px] flex-col gap-0.5 py-2"
                  disabled={!disponible}
                  onClick={() => handleAbrirImportacion(tipo)}
                >
                  <span className="font-mono text-base">{tipo}</span>
                  {!disponible && <span className="text-xs font-normal">Próximamente</span>}
                </Button>
              ))}
            </div>
            <Button variant="outline" size="lg" className="h-[52px] justify-self-start">
              Ver instructivo
            </Button>
          </article>

          <Card className="grid content-start gap-3 p-6">
            <strong>Resumen rápido</strong>
            <div className="grid gap-3">
              <div className="flex items-center justify-between border-t border-border pt-3 first:border-t-0 first:pt-0">
                <span className="text-muted-foreground">Pendientes de generar</span>
                <strong>{pendientesDeGenerar}</strong>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-muted-foreground">Generadas</span>
                <strong>{generadas}</strong>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-muted-foreground">Última actualización</span>
                <strong>{ultimaActualizacion ? new Date(ultimaActualizacion).toLocaleDateString('es-UY') : '—'}</strong>
              </div>
            </div>
          </Card>
        </section>

        <Card className="p-6">
          <strong>
            Actividad reciente —
            {' '}
            {empresaNombre}
          </strong>
          <table className="mt-3 w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b border-border p-3 text-left text-xs uppercase tracking-wide text-muted-foreground">Declaración</th>
                <th className="border-b border-border p-3 text-left text-xs uppercase tracking-wide text-muted-foreground">Período</th>
                <th className="border-b border-border p-3 text-left text-xs uppercase tracking-wide text-muted-foreground">Estado</th>
                <th className="border-b border-border p-3 text-left text-xs uppercase tracking-wide text-muted-foreground">Última actualización</th>
                <th className="border-b border-border p-3">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {declaraciones.map(fila => (
                <tr key={fila.periodo}>
                  <td className="border-b border-border p-3">2181</td>
                  <td className="border-b border-border p-3 font-mono">
                    <Link href={`/dashboard/declaraciones/${fila.periodo}`} className="text-primary hover:underline">
                      {fila.periodo}
                    </Link>
                    <Link
                      href={`/dashboard/declaraciones-1376/${fila.periodo}`}
                      className="ml-3 font-sans text-sm text-primary hover:underline"
                    >
                      Ver 1376
                    </Link>
                  </td>
                  <td className="border-b border-border p-3">
                    <Badge variant={badgeVariant[fila.estado] ?? 'warning'}>{estadoLabel[fila.estado] ?? fila.estado}</Badge>
                  </td>
                  <td className="border-b border-border p-3 text-muted-foreground">
                    {new Date(fila.updated_at).toLocaleDateString('es-UY')}
                  </td>
                  <td className="border-b border-border p-3 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      data-testid={`borrar_periodo_${fila.periodo}`}
                      aria-label={`Borrar período ${formatearPeriodo(fila.periodo)}`}
                      title="Borrar período"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => setPeriodoABorrar(fila.periodo)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {declaraciones.length === 0 && (
                <tr>
                  <td colSpan={5} className="border-b border-border p-3 text-center text-muted-foreground">
                    Todavía no hay declaraciones para esta empresa.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </main>

      <ImportarAsientoDialog
        open={importarAbierto}
        onOpenChange={handleImportarOpenChange}
        empresaActiva={empresaNombre}
        leerEncabezado={tipoImportacion === '1376'}
        onCheckPeriodo={handleCheckPeriodo}
        onImportar={handleImportar}
      />

      <Dialog open={periodoABorrar !== null} onOpenChange={handleBorrarOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Borrar período
              {' '}
              {periodoABorrar ? formatearPeriodo(periodoABorrar) : ''}
            </DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          <div
            data-testid="borrar_periodo_advertencia"
            className="grid gap-1.5 rounded-md border border-warning/25 bg-warning-bg px-4 py-3 text-sm text-warning-text"
          >
            <p className="font-medium">También se borra la declaración vinculada.</p>
            <p>
              El 2181 y el 1376 de este período se calculan sobre los mismos asientos, así que se borran juntos: las dos declaraciones y todos los asientos importados. Para recuperarlos vas a tener que volver a importar el TXT.
            </p>
          </div>

          {errorBorrado && (
            <div
              data-testid="borrar_periodo_error"
              className="rounded-md border border-error/25 bg-error-bg px-4 py-3 text-sm text-error-text"
            >
              {errorBorrado}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" disabled={borrando} onClick={() => handleBorrarOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="button" variant="destructive" disabled={borrando} onClick={handleConfirmarBorrado}>
              {borrando ? 'Borrando…' : 'Sí, borrar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
