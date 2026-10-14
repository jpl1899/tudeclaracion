import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { Card } from '@/components/ui/card';
import { createClient } from '@/infrastructure/supabase/server';
import { EMPRESA_ACTIVA_COOKIE, resolverEmpresaActiva } from '@/modules/empresa/empresa-activa';

interface AyudaPageProps {
  searchParams: Promise<{ formulario?: string }>
}

const FORMULARIOS = ['2181', '1376', '2183', '1050'] as const;
type Formulario = typeof FORMULARIOS[number];

/** Orden canónico de los títulos que acepta el 1376 (ADR-0009). */
const ENCABEZADO_EJEMPLO_1376 = 'DIA,DEBE,HABER,CONCEPTO,RUT,MONEDA,TOTAL,CODIGOIVA,IVA,COTIZACION,LIBRO,TIPO';

function esFormulario(valor: string | undefined): valor is Formulario {
  return FORMULARIOS.includes(valor as Formulario);
}

/**
 * Server Component: módulo Ayuda con una guía por formulario. El formulario
 * elegido vive en `?formulario=` para poder enlazar directo a una sección.
 * Sin mockup ratificado (Regla 14): spec-only, mismo lenguaje visual de
 * DashboardShell + Card que el resto del dashboard.
 */
export default async function AyudaPage({ searchParams }: AyudaPageProps) {
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

  const { formulario: formularioParam } = await searchParams;
  const formulario: Formulario = esFormulario(formularioParam) ? formularioParam : FORMULARIOS[0];

  return (
    <DashboardShell activeNav="ayuda" empresaNombre={empresaActiva.nombre}>
      <main className="grid content-start gap-5 p-6">
        <div>
          <h1 className="font-heading text-3xl font-semibold leading-tight tracking-tight">Ayuda</h1>
          <p className="mt-1 text-muted-foreground">
            Acerca de: Formulario
            {' '}
            {formulario}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-[180px_1fr]">
          <nav aria-label="Formularios" className="grid content-start gap-2">
            {FORMULARIOS.map(codigo => (
              <Link
                key={codigo}
                href={`/dashboard/ayuda?formulario=${codigo}`}
                aria-current={codigo === formulario ? 'page' : undefined}
                className={`min-h-12 content-center rounded-md border px-3.5 font-semibold ${
                  codigo === formulario
                    ? 'border-primary/15 bg-accent text-primary'
                    : 'border-transparent text-muted-foreground hover:bg-accent/60'
                }`}
              >
                {codigo}
              </Link>
            ))}
          </nav>

          <Card data-testid={`ayuda_formulario_${formulario}`} className="grid gap-3 p-6">
            <strong>
              Formulario
              {' '}
              {formulario}
            </strong>
            {formulario === '1376'
              ? (
                  <div data-testid="ayuda_1376_encabezados" className="grid gap-2">
                    <p className="font-medium">Encabezados del archivo TXT</p>
                    <p className="text-muted-foreground">
                      La primera línea del archivo debe traer el título de cada columna. Así cada dato se lee por su título y no por su posición, aunque las columnas vengan en otro orden.
                    </p>
                    <p className="text-muted-foreground">Si tu archivo no la trae, agregá esta línea al principio:</p>
                    <code className="w-fit break-all rounded-md bg-muted px-3 py-2 font-mono text-sm">
                      {ENCABEZADO_EJEMPLO_1376}
                    </code>
                    <p className="text-muted-foreground">
                      Ordená los títulos igual que las columnas de tu archivo. RUC y RUT son el mismo campo.
                    </p>
                  </div>
                )
              : <p className="text-muted-foreground">Contenido en preparación.</p>}
          </Card>
        </div>
      </main>
    </DashboardShell>
  );
}
