import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AyudaMarkdown } from '@/components/ayuda/ayuda-markdown';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { Card } from '@/components/ui/card';
import { createClient } from '@/infrastructure/supabase/server';
import { ANCLAS_AYUDA, hrefAyuda } from '@/modules/ayuda/anclas';
import { cargarSeccionesAyuda } from '@/modules/ayuda/contenido';
import { EMPRESA_ACTIVA_COOKIE, resolverEmpresaActiva } from '@/modules/empresa/empresa-activa';

interface AyudaPageProps {
  searchParams: Promise<{ formulario?: string }>
}

/**
 * Server Component: help organised by topic —
 * docs/superpowers/specs/2026-10-18-ayuda-contextual-design.md. Content lives
 * in content/ayuda/*.md (reusable for the manual); in-app messages link to
 * its heading anchors. Spec-only build (Rule 14), DashboardShell + Card.
 */
export default async function AyudaPage({ searchParams }: AyudaPageProps) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Legacy per-form links (e.g. the 1376 missing-header warning before this rework).
  const { formulario } = await searchParams;
  if (formulario !== undefined) {
    redirect(formulario === '1376' ? hrefAyuda(ANCLAS_AYUDA.encabezado1376) : '/dashboard/ayuda');
  }

  const cookieStore = await cookies();
  // Help content does not depend on a company: without one, the shell shows
  // "Elegir empresa" instead of redirecting away.
  const empresaActiva = await resolverEmpresaActiva(supabase, cookieStore.get(EMPRESA_ACTIVA_COOKIE)?.value);
  const secciones = await cargarSeccionesAyuda();

  return (
    <DashboardShell activeNav="ayuda" empresaNombre={empresaActiva?.nombre}>
      <main className="grid content-start gap-5 p-6">
        <div>
          <Link href="/inicio" className="text-primary hover:underline">← Volver a Inicio</Link>
          <h1 className="mt-2 font-heading text-3xl font-semibold leading-tight tracking-tight">Ayuda</h1>
          <p className="mt-1 text-muted-foreground">Cómo funciona la carga de declaraciones y qué hacer ante cada mensaje.</p>
        </div>

        <div className="grid items-start gap-5 md:grid-cols-[220px_1fr]">
          <nav aria-label="Secciones de ayuda" className="grid content-start gap-1 md:sticky md:top-6">
            {secciones.filter(seccion => seccion.id).map(seccion => (
              <a
                key={seccion.id}
                href={`#${seccion.id}`}
                className="min-h-11 content-center rounded-md px-3.5 font-semibold text-muted-foreground hover:bg-accent/60 hover:text-primary"
              >
                {seccion.titulo}
              </a>
            ))}
          </nav>

          <div className="grid min-w-0 gap-5">
            {secciones.map(seccion => (
              <Card key={seccion.titulo} className="grid gap-3 p-6">
                <AyudaMarkdown markdown={seccion.markdown} />
              </Card>
            ))}
          </div>
        </div>
      </main>
    </DashboardShell>
  );
}
