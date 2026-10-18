import type { LucideIcon } from 'lucide-react';
import { ArrowRight, Building2, CircleHelp, Plus } from 'lucide-react';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { UserMenu } from '@/components/auth/user-menu';
import { Logo } from '@/components/brand/logo';
import { createClient } from '@/infrastructure/supabase/server';
import { cn } from '@/lib/utils';
import { EMPRESA_ACTIVA_COOKIE } from '@/modules/empresa/empresa-activa';
import { construirResumenInicio } from '@/modules/inicio/resumen-inicio';

interface Accion {
  href: string
  titulo: string
  descripcion: string
  icono: LucideIcon
  destacada: boolean
  deshabilitada: boolean
}

/**
 * Post-login home — docs/superpowers/specs/2026-10-18-post-login-home-design.md.
 * No mockup (Rule 14): spec-only build reusing the live login/empresas
 * visual language. "Continuar donde quedaste" reads only the saved active
 * company, without resolverEmpresaActiva's most-recent fallback, so it shows
 * up only after the user actually picked one.
 */
export default async function InicioPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const cookieStore = await cookies();
  const empresaActivaId = cookieStore.get(EMPRESA_ACTIVA_COOKIE)?.value;

  const [cuentaResult, empresasResult, pendientesResult, empresaActivaResult] = await Promise.all([
    supabase.from('cuenta').select('nombre').eq('id', user.id).maybeSingle(),
    supabase.from('empresa').select('id', { count: 'exact', head: true }),
    supabase.from('declaracion').select('id', { count: 'exact', head: true }).eq('estado', 'abierta'),
    empresaActivaId
      ? supabase.from('empresa').select('id, nombre, rut').eq('id', empresaActivaId).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  for (const [contexto, result] of [
    ['cuenta', cuentaResult],
    ['empresas', empresasResult],
    ['pendientes', pendientesResult],
    ['empresa activa', empresaActivaResult],
  ] as const) {
    if (result.error) {
      console.error(`[inicio] ${contexto}:`, result.error);
    }
  }

  const nombre = cuentaResult.data?.nombre ?? null;
  const empresas = empresasResult.error ? null : (empresasResult.count ?? 0);
  const pendientes = pendientesResult.error ? null : (pendientesResult.count ?? 0);
  const empresaActiva = empresaActivaResult.data;
  const { saludo, resumen } = construirResumenInicio({ nombre, empresas, pendientes });

  const sinEmpresas = empresas === 0;
  const acciones: Accion[] = [
    { href: '/empresas', titulo: 'Empresas', descripcion: sinEmpresas ? 'Disponible cuando crees tu primera empresa' : 'Elegí con qué empresa trabajar', icono: Building2, destacada: false, deshabilitada: sinEmpresas },
    { href: '/empresas/nueva', titulo: 'Crear empresa', descripcion: 'Alta de una empresa con su plan de cuentas', icono: Plus, destacada: sinEmpresas, deshabilitada: false },
    { href: '/dashboard/ayuda', titulo: 'Ayuda', descripcion: 'Guías de cada formulario', icono: CircleHelp, destacada: false, deshabilitada: false },
  ];

  return (
    <main className="mx-auto w-[min(1000px,calc(100%-32px))] py-6 pb-10">
      <header className="mb-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Logo variant="mark" className="h-[42px] w-[42px]" priority alt="" />
          <div className="font-semibold tracking-tight">tuDeclaracion</div>
        </div>
        <UserMenu perfil={{ nombre, email: user.email ?? '' }} />
      </header>

      <section className="mb-8">
        <h1 className="font-heading text-4xl font-semibold leading-tight tracking-tight md:text-5xl">{saludo}</h1>
        {resumen && <p className="mt-2 text-lg text-muted-foreground">{resumen}</p>}
      </section>

      {empresaActiva && (
        <Link
          href="/dashboard"
          className="mb-6 flex min-h-12 flex-wrap items-center justify-between gap-4 rounded-xl border border-primary/20 bg-accent p-5 shadow-sm outline-none ring-offset-background transition-colors hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <div>
            <span className="text-sm font-semibold text-primary">Continuar donde quedaste</span>
            <div className="mt-1 font-semibold">{empresaActiva.nombre}</div>
            <div className="font-mono text-sm text-muted-foreground">{`RUT ${empresaActiva.rut}`}</div>
          </div>
          <span className="inline-flex items-center gap-2 font-semibold text-primary">
            Ir al panel
            <ArrowRight className="h-4 w-4" aria-hidden />
          </span>
        </Link>
      )}

      <nav aria-label="Accesos" className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {acciones.map(({ href, titulo, descripcion, icono: Icono, destacada, deshabilitada }) => {
          const contenido = (
            <>
              <span
                className={cn(
                  'grid h-11 w-11 place-items-center rounded-lg',
                  destacada ? 'bg-primary-foreground/15' : 'bg-accent text-primary',
                )}
              >
                <Icono className="h-5 w-5" aria-hidden />
              </span>
              <span className="text-lg font-semibold">{titulo}</span>
              <span className={cn('text-sm', destacada ? 'text-primary-foreground/85' : 'text-muted-foreground')}>
                {descripcion}
              </span>
            </>
          );
          const base = 'grid min-h-12 content-start gap-3 rounded-xl border p-6 shadow-sm';

          // A disabled card is not a link at all, so it cannot be focused or followed.
          if (deshabilitada) {
            return (
              <div key={href} aria-disabled="true" className={cn(base, 'cursor-not-allowed border-border bg-muted opacity-55 shadow-none')}>
                {contenido}
              </div>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                base,
                'outline-none ring-offset-background transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                destacada
                  ? 'border-primary bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'border-border bg-card hover:border-primary/40 hover:bg-accent/40',
              )}
            >
              {contenido}
            </Link>
          );
        })}
      </nav>
    </main>
  );
}
