import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

/**
 * Portada (landing) — .context/design/master-design-plan.md §4.1, mockup en
 * .context/designs/tudeclaracion/mvp-core-screens/landing-2.html
 *
 * Public marketing page presenting the product before login. Static content
 * only — no client state, no data fetching.
 */
export default function RootPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-white">
      <div className="mx-auto w-full max-w-[1200px] px-4">
        <header className="flex min-h-[72px] items-center gap-3 py-4">
          <Logo variant="mark" className="h-11 w-11" priority />
          <span className="font-semibold text-foreground">tuDeclaracion</span>
        </header>

        <section className="grid gap-6 py-8 md:py-12">
          <span className="inline-flex h-9 w-fit items-center rounded-full bg-primary/10 px-3 text-xs font-bold uppercase tracking-wide text-primary">
            Declaraciones DGI sin fricción
          </span>
          <h1 className="max-w-[16ch] font-heading text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-6xl">
            Prepara tus declaraciones DGI, con un flujo claro y seguro.
          </h1>
          <p className="max-w-[60ch] text-muted-foreground">
            tuDeclaracion acompaña al estudio contable desde la carga del TXT contable hasta la
            generación del archivo PADI. Sin pantallas recargadas, sin navegación confusa y con foco
            total en productividad diaria.
          </p>
          <div className="grid w-fit gap-3">
            <Button asChild size="lg" className="h-[52px] w-fit px-8">
              <Link href="/login">Ingresar al sistema</Link>
            </Button>
            <p className="text-muted-foreground">
              ¿Todavía no tenés cuenta?
              {' '}
              <Link href="/signup" className="font-semibold text-primary hover:underline">
                Creá tu cuenta
              </Link>
              .
            </p>
          </div>
        </section>

        <section className="py-8">
          <h2 className="mb-4 font-heading text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Criterios de confianza
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <TrustCard
              title="Lectura inmediata"
              description="Tipografía grande, contraste alto y bloques con buena respiración."
            />
            <TrustCard
              title="Próximo paso obvio"
              description="Cada pantalla tiene una acción principal y contexto breve de apoyo."
            />
            <TrustCard
              title="Escalable"
              description="La estructura permite sumar nuevas declaraciones sin rehacer la base."
            />
          </div>
        </section>

        <footer className="py-8 text-sm text-muted-foreground">
          Herramienta de apoyo. No reemplaza asesoramiento contable ni legal.
        </footer>
      </div>
    </main>
  );
}

function TrustCard({ title, description }: { title: string, description: string }) {
  return (
    <Card>
      <CardContent className="grid gap-2 pt-6">
        <strong className="text-foreground">{title}</strong>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
