'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/infrastructure/supabase/client';

/**
 * Acceso (login) — .context/design/master-design-plan.md §4.2, mockup en
 * .context/designs/tudeclaracion/mvp-core-screens/login.html
 *
 * Wired to real Supabase Auth (signInWithPassword).
 */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = email.trim() !== '' && password.trim() !== '';
  const showValidationError = touched && !isValid;
  const showError = showValidationError || authError !== null;

  async function handleSubmit() {
    setTouched(true);
    setAuthError(null);

    if (email.trim() === '' || password.trim() === '') {
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setIsSubmitting(false);

    if (error) {
      setAuthError(error.message);
      return;
    }

    router.push('/empresas');
    router.refresh();
  }

  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-b from-background to-white p-6">
      <div className="grid w-full max-w-[980px] grid-cols-1 overflow-hidden rounded-lg border border-border bg-card shadow-md md:grid-cols-[1fr_420px]">
        <section className="grid gap-6 bg-gradient-to-b from-primary/5 to-white p-10">
          <div>
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-primary font-bold text-primary-foreground">
              TD
            </div>
            <h1 className="mb-3 font-heading text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl">
              Acceso simple para trabajo diario.
            </h1>
            <p className="text-muted-foreground">
              Accedé a tu espacio de trabajo para cargar archivos, revisar validaciones y generar la
              declaración 2181 sin pasos innecesarios.
            </p>
          </div>
          <p className="text-muted-foreground">
            Si necesitás ayuda, el acceso a soporte está visible antes y después de iniciar sesión.
          </p>
        </section>

        <section className="grid gap-4 p-10">
          <div>
            <strong className="text-lg">Iniciar sesión</strong>
            <p className="text-muted-foreground">Usá tu correo profesional y tu contraseña.</p>
          </div>

          {showError && (
            <div className="rounded-md border border-error/25 bg-error-bg px-4 py-3 text-error-text">
              {authError ?? 'Revisá los datos ingresados. Ambos campos son obligatorios.'}
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="nombre@estudio.com"
              className="h-[52px]"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="Ingresá tu contraseña"
              className="h-[52px]"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex min-h-6 items-center gap-2 text-sm">
              <input type="checkbox" className="h-4 w-4 rounded border-border" />
              Mantener sesión iniciada
            </label>
            <a href="#" className="text-sm font-semibold text-primary hover:underline">
              Recuperar acceso
            </a>
          </div>

          <Button type="button" size="lg" className="h-[52px]" onClick={() => void handleSubmit()} disabled={isSubmitting}>
            {isSubmitting ? 'Ingresando…' : 'Entrar al sistema'}
          </Button>

          <p className="text-muted-foreground">
            ¿Primera vez?
            {' '}
            <a href="/signup" className="font-semibold text-primary hover:underline">
              Creá tu cuenta
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
