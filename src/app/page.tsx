import type { Plan } from '@/modules/planes/planes';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DIAS_DE_PRUEBA, PLANES } from '@/modules/planes/planes';

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
        <header className="flex min-h-[72px] flex-wrap items-center gap-3 py-4">
          <Logo variant="mark" className="h-11 w-11" priority alt="" />
          <span className="font-semibold text-foreground">tuDeclaracion</span>
          <nav aria-label="Principal" className="ml-auto flex items-center gap-1 sm:gap-2">
            <Button asChild variant="ghost" className="h-12 px-3">
              <a href="#planes">Planes</a>
            </Button>
            <Button asChild variant="ghost" className="h-12 px-3">
              <Link href="/login">Ingresar</Link>
            </Button>
            <Button asChild className="hidden h-12 px-4 sm:inline-flex">
              <Link href="/signup">Crear cuenta</Link>
            </Button>
          </nav>
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

        <section id="planes" aria-labelledby="planes-titulo" className="scroll-mt-6 py-8 md:py-12">
          <h2 id="planes-titulo" className="font-heading text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Planes
          </h2>
          <p className="mt-2 max-w-[60ch] text-muted-foreground">
            {`Probalo gratis ${DIAS_DE_PRUEBA} días, sin tarjeta. Todos los planes incluyen las cuatro declaraciones; lo que cambia es cuántas empresas gestionás.`}
          </p>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {PLANES.map(plan => <PlanCard key={plan.id} plan={plan} />)}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Precios en dólares, por mes. Pagando el año completo, dos meses son gratis.
          </p>
        </section>

        <footer className="py-8 text-sm text-muted-foreground">
          Herramienta de apoyo. No reemplaza asesoramiento contable ni legal.
        </footer>
      </div>
    </main>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <Card
      data-testid={`plan_${plan.id}`}
      className={plan.recomendado ? 'relative border-2 border-primary shadow-md' : 'relative'}
    >
      <CardContent className="grid h-full content-start gap-4 pt-6">
        {plan.recomendado && (
          <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary-foreground">
            Recomendado
          </span>
        )}
        <div>
          <strong className="text-lg text-foreground">{plan.nombre}</strong>
          <p className="text-sm text-muted-foreground">{plan.paraQuien}</p>
        </div>
        <p className="flex items-baseline gap-1 text-foreground">
          <span className="font-heading text-4xl font-semibold">{`USD ${plan.precioMensualUsd}`}</span>
          <span className="text-muted-foreground">/ mes</span>
        </p>
        <p className="-mt-3 text-sm text-muted-foreground">{`o USD ${plan.precioAnualUsd} al año`}</p>
        <ul className="grid gap-2 text-sm">
          {[plan.empresas, ...plan.incluye].map(item => (
            <li key={item} className="flex items-start gap-2 text-foreground">
              <Check aria-hidden="true" className="mt-0.5 h-4 w-4 flex-none text-primary" />
              {item}
            </li>
          ))}
        </ul>
        <Button asChild size="lg" variant={plan.recomendado ? 'default' : 'outline'} className="mt-auto h-[52px]">
          <Link href={`/signup?plan=${plan.id}`}>{`Empezar con ${plan.nombre}`}</Link>
        </Button>
      </CardContent>
    </Card>
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
