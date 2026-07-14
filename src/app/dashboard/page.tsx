'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ImportarAsientoDialog } from '@/components/importar-asiento-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * Dashboard / Panel principal — .context/design/master-design-plan.md §4.3,
 * mockup en .context/designs/tudeclaracion/mvp-core-screens/dashboard.html
 *
 * Punto de entrada a la operación diaria, scoped a la empresa activa elegida
 * en /empresas (gap D2, ratificado 2026-07-05): agrega un indicador de
 * empresa activa en el sidebar (ausente del mockup original, checklist §4.3)
 * y filtra "Actividad reciente" a esa única empresa. El wizard real de
 * "Iniciar nueva declaración" (US 3.x) no está mockeado — "Importar asiento"
 * (TD-11) es un build spec-only ratificado en master-design-plan.md §5 D5;
 * el resto del wizard (parseo/carga real, TD-12/TD-13) sigue sin mockup.
 */
const EMPRESA_ACTIVA = 'Estudio Rivera';

const ACTIVIDAD_RECIENTE = [
  { periodo: '202506', estado: 'Validado' as const, actualizado: 'Hace 12 min' },
  { periodo: '202505', estado: 'Generado' as const, actualizado: 'Hace 3 días' },
  { periodo: '202504', estado: 'Generado' as const, actualizado: 'Hace 1 mes' },
];

const badgeVariant: Record<'Validado' | 'Generado', 'success' | 'warning'> = {
  Validado: 'success',
  Generado: 'success',
};

export default function DashboardPage() {
  const [importarAbierto, setImportarAbierto] = useState(false);

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
            {EMPRESA_ACTIVA}
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
            {EMPRESA_ACTIVA}
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
              {ACTIVIDAD_RECIENTE.map(fila => (
                <tr key={fila.periodo}>
                  <td className="border-b border-border p-3">2181</td>
                  <td className="border-b border-border p-3 font-mono">{fila.periodo}</td>
                  <td className="border-b border-border p-3">
                    <Badge variant={badgeVariant[fila.estado]}>{fila.estado}</Badge>
                  </td>
                  <td className="border-b border-border p-3 text-muted-foreground">{fila.actualizado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </main>

      <ImportarAsientoDialog
        open={importarAbierto}
        onOpenChange={setImportarAbierto}
        empresaActiva={EMPRESA_ACTIVA}
        onImportar={() => setImportarAbierto(false)}
      />
    </div>
  );
}
