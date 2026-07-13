'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/infrastructure/supabase/client';
import { getPasswordRules, passwordMeetsRequirements } from '@/lib/validation/password-rules';

/**
 * Crear cuenta (signup) — .context/design/master-design-plan.md §4.5, mockup en
 * .context/designs/tudeclaracion/signup-screen/signup-2.html
 *
 * Wired to real Supabase Auth (signUp). Duplicate-email detection relies on
 * Supabase's anti-enumeration response shape (empty identities array on an
 * otherwise-successful signUp call) — see the story's implementation plan,
 * Decision 1, before changing this branch.
 */
type AuthError = 'duplicate' | 'required-email' | null;

const RULE_LABELS: { key: keyof ReturnType<typeof getPasswordRules>, label: string }[] = [
  { key: 'length', label: 'Al menos 10 caracteres.' },
  { key: 'upper', label: 'Al menos una letra mayúscula.' },
  { key: 'lower', label: 'Al menos una letra minúscula.' },
  { key: 'digit', label: 'Al menos un número.' },
];

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [authError, setAuthError] = useState<AuthError>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPendingVerification, setIsPendingVerification] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState('');

  const rules = getPasswordRules(password);
  const showPasswordError = (passwordTouched || submitted) && !passwordMeetsRequirements(password);

  function handleEmailChange(value: string) {
    setEmail(value);
    if (authError === 'duplicate' || authError === 'required-email') {
      setAuthError(null);
    }
  }

  async function handleSubmit() {
    setSubmitted(true);
    setPasswordTouched(true);

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (trimmedEmail === '') {
      setAuthError('required-email');
      return;
    }

    if (!passwordMeetsRequirements(trimmedPassword)) {
      return;
    }

    setAuthError(null);
    setIsSubmitting(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password: trimmedPassword,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/auth/confirm?next=/empresas`,
      },
    });
    setIsSubmitting(false);

    const isDuplicate = error?.message.toLowerCase().includes('already registered')
      || (!error && data.user?.identities?.length === 0);

    if (isDuplicate) {
      setAuthError('duplicate');
      return;
    }

    if (error) {
      setAuthError('required-email');
      return;
    }

    setVerifiedEmail(trimmedEmail);
    setIsPendingVerification(true);
  }

  if (isPendingVerification) {
    return (
      <main className="grid min-h-screen place-items-center bg-gradient-to-b from-background to-white p-6">
        <div className="grid w-full max-w-[980px] grid-cols-1 overflow-hidden rounded-lg border border-border bg-card shadow-md md:grid-cols-[1fr_420px]">
          <IntroPanel />
          <section className="grid gap-4 p-10">
            <div className="rounded-md border border-success/25 bg-success-bg px-4 py-3 text-success-text">
              <strong className="mb-1 block">Revisa tu correo para continuar.</strong>
              {`Hemos enviado un mensaje de verificación a ${verifiedEmail}. Hasta confirmar ese correo, el acceso al dashboard permanecerá bloqueado.`}
            </div>
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
            <strong className="text-lg">Crear cuenta</strong>
            <p className="text-muted-foreground">
              Usa un correo profesional y una contraseña robusta para habilitar el acceso de tu estudio.
            </p>
          </div>

          {authError === 'duplicate' && (
            <div className="rounded-md border border-error/25 bg-error-bg px-4 py-3 text-error-text">
              <strong className="mb-1 block">Este correo ya está registrado.</strong>
              {`Ya existe una cuenta asociada a ${email.trim()}. Inicia sesión o recupera el acceso para continuar.`}
            </div>
          )}

          {authError === 'required-email' && (
            <div className="rounded-md border border-error/25 bg-error-bg px-4 py-3 text-error-text">
              <strong className="mb-1 block">Introduce un correo electrónico.</strong>
              Necesitamos un correo profesional válido para crear la cuenta.
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

          <div className="grid gap-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="Crea una contraseña"
              className="h-[52px]"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordTouched(true);
              }}
            />
            <p className="text-sm text-muted-foreground">
              Antes de enviar, la contraseña debe cumplir todas las reglas indicadas debajo.
            </p>
            {showPasswordError && (
              <div className="rounded-md border border-warning/25 bg-warning-bg px-4 py-3 text-sm leading-relaxed text-warning-text">
                La contraseña no cumple el mínimo requerido. Debe tener al menos 10 caracteres, una letra
                mayúscula, una letra minúscula y un número.
              </div>
            )}
          </div>

          <ul aria-label="Requisitos de contraseña" className="grid gap-2 rounded-md border border-border bg-muted/40 p-4">
            {RULE_LABELS.map(({ key, label }) => (
              <li key={key} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <span
                  className={`mt-1.5 h-2 w-2 flex-none rounded-full ${rules[key] ? 'bg-success' : 'bg-border'}`}
                />
                {label}
              </li>
            ))}
          </ul>

          <Button type="button" size="lg" className="h-[52px]" onClick={() => void handleSubmit()} disabled={isSubmitting}>
            {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
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
          Crear cuenta para empezar con seguridad.
        </h1>
        <p className="text-muted-foreground">
          Alta autoservicio para profesionales contables. El flujo aclara reglas de contraseña antes del
          rechazo, informa errores concretos y detiene acceso al panel hasta verificar el correo.
        </p>
      </div>
    </section>
  );
}

function FooterLink() {
  return (
    <p className="text-muted-foreground">
      ¿Ya tienes cuenta?
      {' '}
      <a href="/login" className="font-semibold text-primary hover:underline">
        Iniciar sesión
      </a>
      .
    </p>
  );
}
