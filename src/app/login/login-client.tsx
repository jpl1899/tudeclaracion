'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button';
import { turnstileEnabled, TurnstileWidget } from '@/components/auth/turnstile-widget';
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/infrastructure/supabase/client';

// Supabase Auth messages are English and implementation-specific; the user
// only sees a fixed Spanish message chosen by the stable error code.
function authErrorMessage(code: string | undefined): string {
  switch (code) {
    case 'invalid_credentials':
      return 'El correo o la contraseña no son correctos.';
    case 'email_not_confirmed':
      return 'Todavía no confirmaste tu correo. Revisá tu bandeja de entrada.';
    case 'captcha_failed':
      return 'No pudimos completar la verificación de seguridad. Intentá nuevamente.';
    case 'over_request_rate_limit':
      return 'Hiciste demasiados intentos. Esperá unos minutos y volvé a intentar.';
    default:
      return 'No se pudo iniciar sesión. Intentá nuevamente en unos minutos.';
  }
}

/**
 * Acceso (login) — .context/design/master-design-plan.md §4.2, mockup en
 * .context/designs/tudeclaracion/mvp-core-screens/login.html
 *
 * Wired to real Supabase Auth (signInWithPassword) plus Google OAuth
 * (TD-32, ADR-0004) — the "Continuar con Google" divergence is not in the
 * mockup, ratified as a spec-only addition (§5).
 */
export function LoginClient({ googleAuthFailed }: { googleAuthFailed: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState(0);

  const captchaReady = !turnstileEnabled || captchaToken !== null;
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
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: { captchaToken: captchaToken ?? undefined },
    });
    setIsSubmitting(false);

    if (error) {
      setCaptchaToken(null);
      setCaptchaKey(key => key + 1);
      console.error('[login] signInWithPassword failed:', error);
      setAuthError(authErrorMessage(error.code));
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
            <Logo variant="mark" className="mb-4 h-11 w-11" priority />
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

          {googleAuthFailed && (
            <div className="rounded-md border border-error/25 bg-error-bg px-4 py-3 text-error-text">
              No se pudo completar el inicio de sesión con Google. Intentá nuevamente.
            </div>
          )}

          {showError && (
            <div className="rounded-md border border-error/25 bg-error-bg px-4 py-3 text-error-text">
              {authError ?? 'Revisá los datos ingresados. Ambos campos son obligatorios.'}
            </div>
          )}

          <GoogleSignInButton />

          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            o
            <span className="h-px flex-1 bg-border" />
          </div>

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
            <a href="/forgot-password" className="text-sm font-semibold text-primary hover:underline">
              Recuperar acceso
            </a>
          </div>

          <TurnstileWidget key={captchaKey} onToken={setCaptchaToken} />

          <Button type="button" size="lg" className="h-[52px]" onClick={() => void handleSubmit()} disabled={isSubmitting || !captchaReady}>
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
