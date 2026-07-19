'use client';

import type { ImportarAsientoError } from '@/components/importar-asiento-dialog';
import type { Json } from '@/types/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ImportarAsientoDialog } from '@/components/importar-asiento-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { createClient } from '@/infrastructure/supabase/client';
import { parseAsientosTxt } from '@/modules/parser/parse-asientos';

/**
 * Dashboard / Panel principal — .context/design/master-design-plan.md §4.3,
 * mockup en .context/designs/tudeclaracion/mvp-core-screens/dashboard.html
 *
 * Client Component: recibe la empresa activa ya resuelta por el Server
 * Component (page.tsx). TD-13 conecta "Importar asiento" (TD-11) al parser
 * real: parsea client-side (puramente técnico, sin red) y solo llama a
 * Supabase si el archivo es 100% válido — inserción atómica vía el RPC
 * insertar_asientos (ver supabase/migrations/20260717171500_*.sql).
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
  empresaId: string
  empresaNombre: string
  declaraciones: DeclaracionResumen[]
}

export function DashboardClient({ empresaId, empresaNombre, declaraciones }: DashboardClientProps) {
  const router = useRouter();
  const [importarAbierto, setImportarAbierto] = useState(false);

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

  async function handleImportar(file: File, periodo: string, reemplazar: boolean): Promise<ImportarAsientoError | null> {
    const contenido = await file.text();
    const resultado = parseAsientosTxt(contenido);

    if (!resultado.ok) {
      return { kind: 'parse', line: resultado.line, field: resultado.field, message: resultado.message };
    }

    const supabase = createClient();
    const { error } = await supabase.rpc('insertar_asientos', {
      p_empresa_id: empresaId,
      p_periodo: periodo,
      p_lineas: resultado.lines as unknown as Json,
      p_reemplazar: reemplazar,
    });

    if (error) {
      return { kind: 'guardado', message: 'No se pudo guardar el archivo. Intentá nuevamente en unos minutos.' };
    }

    router.refresh();
    return null;
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]">
      <aside className="grid content-start gap-4.5 border-b border-border bg-card p-5 lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3 font-semibold">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary font-bold text-primary-foreground">
            TD
          </div>
          <div>tuDeclaracion</div>
        </div>

        <nav className="grid gap-2">
          <button
            type="button"
            className="min-h-12 rounded-md border border-primary/15 bg-accent px-3.5 text-left font-semibold text-primary"
          >
            Inicio
          </button>
          <button
            type="button"
            className="min-h-12 rounded-md border border-transparent px-3.5 text-left font-semibold text-muted-foreground hover:bg-accent/60"
          >
            Declaraciones generadas
          </button>
          <button
            type="button"
            className="min-h-12 rounded-md border border-transparent px-3.5 text-left font-semibold text-muted-foreground hover:bg-accent/60"
          >
            Ayuda
          </button>
        </nav>

        <Link
          href="/empresas"
          className="mt-2 grid gap-0.5 rounded-md border border-border bg-muted p-3.5 text-sm transition-colors hover:border-primary/30"
        >
          <span className="text-muted-foreground">Empresa activa</span>
          <span className="font-semibold text-foreground">
            {empresaNombre}
            {' '}
            <span className="font-normal text-primary">(cambiar)</span>
          </span>
        </Link>
      </aside>

      <main className="grid content-start gap-5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-heading text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
              Hola, Andrea.
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
            <h2 className="text-2xl font-semibold tracking-tight">Crear declaración 2181</h2>
            <p className="text-muted-foreground">
              Cargá el TXT exportado desde Memory, revisá validaciones y generá el archivo PADI en
              un mismo flujo.
            </p>
            <div className="mt-2 flex flex-wrap gap-3">
              <Button size="lg" className="h-[52px]" onClick={() => setImportarAbierto(true)}>
                Iniciar nueva declaración
              </Button>
              <Button variant="outline" size="lg" className="h-[52px]">
                Ver instructivo
              </Button>
            </div>
          </article>

          <Card className="grid content-start gap-3 p-6">
            <strong>Resumen rápido</strong>
            <div className="grid gap-3">
              <div className="flex items-center justify-between border-t border-border pt-3 first:border-t-0 first:pt-0">
                <span className="text-muted-foreground">Declaraciones en curso</span>
                <strong>3</strong>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-muted-foreground">Pendientes de revisión</span>
                <strong>1</strong>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="text-muted-foreground">Última generación PADI</span>
                <strong>Hace 12 min</strong>
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
                  </td>
                  <td className="border-b border-border p-3">
                    <Badge variant={badgeVariant[fila.estado] ?? 'warning'}>{estadoLabel[fila.estado] ?? fila.estado}</Badge>
                  </td>
                  <td className="border-b border-border p-3 text-muted-foreground">
                    {new Date(fila.updated_at).toLocaleDateString('es-UY')}
                  </td>
                </tr>
              ))}
              {declaraciones.length === 0 && (
                <tr>
                  <td colSpan={4} className="border-b border-border p-3 text-center text-muted-foreground">
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
        onOpenChange={setImportarAbierto}
        empresaActiva={empresaNombre}
        onCheckPeriodo={handleCheckPeriodo}
        onImportar={handleImportar}
      />
    </div>
  );
}
