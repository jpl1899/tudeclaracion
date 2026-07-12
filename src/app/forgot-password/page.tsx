'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/infrastructure/supabase/client';

/**
 * Recuperar acceso (forgot password) — .context/design/master-design-plan.md
 * §4.6, mockup en .context/designs/tudeclaracion/password-recovery/forgot-password.html
 *
 * Built against the live login/signup shell and tokens, not the mockup's own
 * palette/composition — see §5 D3 for the ratified divergence. Only the
 * confirmation-state copy/flow is taken from the mockup.
 *
 * Wired to real Supabase Auth (resetPasswordForEmail). The recovery link
 * routes through the same /auth/confirm handler TD-4 built for signup
 * verification — see that route's `type === 'recovery'` branch.
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showRequiredError, setShowRequiredError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleEmailChange(value: string) {
    setEmail(value);
    if (showRequiredError) {
      setShowRequiredError(false);
    }
  }

  async function handleSubmit() {
    const trimmedEmail = email.trim();

    if (trimmedEmail === '') {
      setShowRequiredError(true);
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/auth/confirm?type=recovery&next=/reset-password`,
    });
    setIsSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <main className="grid min-h-screen place-items-center bg-gradient-to-b from-background to-white p-6">
        <div className="grid w-full max-w-[980px] grid-cols-1 overflow-hidden rounded-lg border border-border bg-card shadow-md md:grid-cols-[1fr_420px]">
          <IntroPanel />
          <section className="grid gap-4 p-10">
            <div className="rounded-md border border-success/25 bg-success-bg px-4 py-3 text-success-text">
              <strong className="mb-1 block">Revisá tu correo.</strong>
              {`Enviamos el enlace de recuperación a ${email.trim()}. Cuando abras ese correo vas a poder definir una contraseña nueva.`}
            </div>
            <ul className="grid gap-2 rounded-md border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              <li>Estado: correo enviado</li>
              <li>Acción siguiente: abrir el enlace recibido</li>
              <li>Recordatorio: revisá la carpeta de spam</li>
            </ul>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setSubmitted(false)}
            >
              Usar otro correo
            </Button>
            <FooterLink />
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-b from-background to-white p-6">
      <div className="grid w-full max-w-[980px] grid-cols-1 overflow-hidden rounded-lg border border-border bg-card shadow-md md:grid-cols-[1fr_420px]">
        <IntroPanel />

        <section className="grid gap-4 p-10">
          <div>
            <strong className="text-lg">Recuperar acceso</strong>
            <p className="text-muted-foreground">
              Ingresá el correo de tu cuenta y te enviaremos un enlace para restablecer la contraseña.
            </p>
          </div>

          {showRequiredError && (
            <div className="rounded-md border border-error/25 bg-error-bg px-4 py-3 text-error-text">
              Ingresá un correo válido para continuar.
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
              onChange={e => handleEmailChange(e.target.value)}
            />
          </div>

          <Button type="button" size="lg" className="h-[52px]" onClick={() => void handleSubmit()} disabled={isSubmitting}>
            {isSubmitting ? 'Enviando…' : 'Enviar enlace de recuperación'}
          </Button>

          <FooterLink />
        </section>
      </div>
    </main>
  );
}

function IntroPanel() {
  return (
    <section className="grid gap-6 bg-gradient-to-b from-primary/5 to-white p-10">
      <div>
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-primary font-bold text-primary-foreground">
          TD
        </div>
        <h1 className="mb-3 font-heading text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl">
          Recuperá acceso sin perder el avance de tu declaración.
        </h1>
        <p className="text-muted-foreground">
          Pedí un enlace de recuperación y retomá tu trabajo con el mismo flujo claro que usa el resto del producto.
        </p>
      </div>
    </section>
  );
}

function FooterLink() {
  return (
    <p className="text-muted-foreground">
      <a href="/login" className="font-semibold text-primary hover:underline">
        Volver a iniciar sesión
      </a>
    </p>
  );
}
