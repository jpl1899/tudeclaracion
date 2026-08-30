'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';
import { Logo } from '@/components/brand/logo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { seleccionarEmpresaActiva } from './actions';

/**
 * Selección de empresa — .context/design/master-design-plan.md §4.4, mockup en
 * .context/designs/tudeclaracion/mvp-core-screens/companySelector.html
 *
 * Paso intermedio entre login y dashboard: el contador elige la empresa
 * activa (1 Cuenta de contador → N Empresas, ver .context/SRS/04-domain-model.md).
 * Recibe `empresas` ya resueltas por el Server Component (page.tsx), scoped
 * por RLS a la cuenta del usuario autenticado.
 *
 * TD-5 (2026-07-28): la selección ahora persiste -- "Ingresar al dashboard"
 * fija la empresa elegida en una cookie (`seleccionarEmpresaActiva`) que el
 * resto del dashboard lee vía `resolverEmpresaActiva`. Antes este paso era
 * solo visual y el dashboard siempre operaba sobre la empresa más reciente.
 */
export interface Empresa {
  id: string
  nombre: string
  rut: string
  estado: 'Operativa' | 'Pendiente'
  ultimoMovimiento: string
  responsable: string
}

export function EmpresasClient({ empresas, empresaActivaIdInicial }: { empresas: Empresa[], empresaActivaIdInicial: string | null }) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Empresa | null>(
    empresas.find(e => e.id === empresaActivaIdInicial) ?? empresas[0] ?? null,
  );
  const [ingresando, startIngresar] = useTransition();

  function handleIngresar(empresaId: string) {
    startIngresar(async () => {
      await seleccionarEmpresaActiva(empresaId);
      router.push('/dashboard');
    });
  }

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) { return empresas; }
    return empresas.filter(e => `${e.nombre} ${e.rut}`.toLowerCase().includes(term));
  }, [search, empresas]);

  return (
    <main className="mx-auto w-[min(1200px,calc(100%-32px))] py-6 pb-10">
      <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Logo variant="mark" className="h-[42px] w-[42px]" priority alt="" />
          <div>
            <div className="font-semibold tracking-tight">tuDeclaracion</div>
            <div className="text-sm text-muted-foreground">Selección de empresa</div>
          </div>
        </div>
        <Button variant="outline" onClick={() => router.push('/login')}>
          Volver al acceso
        </Button>
      </header>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <div className="grid gap-5 rounded-xl border border-border bg-card p-7 shadow-sm">
          <span className="inline-flex w-fit items-center rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent-foreground">
            Paso previo al panel principal
          </span>
          <div>
            <h1 className="max-w-[11ch] font-heading text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
              Elige empresa para continuar.
            </h1>
            <p className="mt-3 max-w-[62ch] text-muted-foreground">
              Después de iniciar sesión, el sistema te muestra las empresas habilitadas para
              trabajar. Seleccioná una y continuá al panel principal con contexto claro desde el
              primer momento.
            </p>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <Input
              placeholder="Buscar por nombre de empresa o RUT"
              aria-label="Buscar empresa"
              className="h-[52px]"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div className="flex h-11 items-center rounded-md border border-border bg-muted px-3.5 font-semibold text-muted-foreground">
              {filtered.length}
              {' '}
              {filtered.length === 1 ? 'empresa' : 'empresas'}
            </div>
          </div>

          <div className="grid gap-3">
            {filtered.map(empresa => (
              <div
                key={empresa.id}
                className={`grid gap-3 rounded-2xl border p-4.5 transition-colors ${
                  selected?.id === empresa.id
                    ? 'border-primary/40 bg-primary/5 shadow-md'
                    : 'border-border bg-card has-[button:hover]:border-primary/25 has-[button:hover]:shadow-sm has-[button:focus-visible]:border-primary/25 has-[button:focus-visible]:shadow-sm'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSelected(empresa)}
                  className="grid gap-3.5 text-left"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="grid gap-1.5">
                      <strong>{empresa.nombre}</strong>
                      <span className="font-mono text-sm text-muted-foreground">
                        RUT
                        {' '}
                        {empresa.rut}
                      </span>
                    </div>
                    <Badge variant={empresa.estado === 'Operativa' ? 'success' : 'warning'}>
                      {empresa.estado}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap justify-between gap-4 text-sm text-muted-foreground">
                    <span>
                      Último movimiento:
                      {' '}
                      {empresa.ultimoMovimiento}
                    </span>
                    <span>
                      Responsable:
                      {' '}
                      {empresa.responsable}
                    </span>
                  </div>
                </button>
                <div className="flex justify-end">
                  <Button asChild variant="secondary" size="sm">
                    <Link href={`/empresas/${empresa.id}`}>Ver empresa</Link>
                  </Button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => router.push('/empresas/nueva')}
              className="flex items-center gap-4 rounded-2xl border-2 border-dashed border-primary/25 bg-muted p-4.5 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/15 text-xl font-bold text-primary">
                +
              </span>
              <span>
                <strong>Agregar nueva empresa</strong>
                <p className="mt-1 text-sm text-muted-foreground">
                  Dar de alta un cliente nuevo bajo tu cuenta.
                </p>
              </span>
            </button>

            {empresas.length === 0 && (
              <div className="rounded-2xl border border-border bg-muted p-4.5 text-muted-foreground">
                Todavía no tenés empresas registradas. Usá &quot;Agregar nueva empresa&quot; para dar
                de alta tu primer cliente.
              </div>
            )}

            {empresas.length > 0 && filtered.length === 0 && (
              <div className="rounded-2xl border border-border bg-muted p-4.5 text-muted-foreground">
                No hay empresas que coincidan con la búsqueda. Probá con otro nombre o con el RUT.
              </div>
            )}
          </div>
        </div>

        <aside className="grid content-start gap-4.5 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div>
            <strong className="text-lg">Empresa seleccionada</strong>
            <p className="mt-2 text-sm text-muted-foreground">
              Mostramos contexto suficiente antes de entrar al dashboard para evitar errores de
              empresa activa.
            </p>
          </div>

          {selected
            ? (
                <>
                  <div className="rounded-md border border-primary/20 bg-primary/10 px-4 py-3.5 font-semibold text-primary">
                    Entrarás con
                    {' '}
                    {selected.nombre}
                    .
                  </div>

                  <div className="grid gap-2 rounded-md border border-border bg-muted p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Empresa</span>
                      <strong>{selected.nombre}</strong>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">RUT</span>
                      <strong className="font-mono">{selected.rut}</strong>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Responsable</span>
                      <strong>{selected.responsable}</strong>
                    </div>
                  </div>

                  <div className="grid gap-2 rounded-md border border-border bg-muted p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Estado</span>
                      <strong>{selected.estado}</strong>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Último movimiento</span>
                      <strong>{selected.ultimoMovimiento}</strong>
                    </div>
                  </div>

                  <Button size="lg" className="h-[52px]" disabled={ingresando} onClick={() => handleIngresar(selected.id)}>
                    {ingresando ? 'Ingresando…' : 'Ingresar al dashboard'}
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Siguiente paso único: abrir panel principal con empresa activa ya definida.
                  </p>
                </>
              )
            : (
                <p className="text-sm text-muted-foreground">
                  Seleccioná o agregá una empresa para continuar al dashboard.
                </p>
              )}
        </aside>
      </section>
    </main>
  );
}
