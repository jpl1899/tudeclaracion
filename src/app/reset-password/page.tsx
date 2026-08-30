'use client';

import { useEffect, useState } from 'react';
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/infrastructure/supabase/client';
import { getPasswordRules, passwordMeetsRequirements } from '@/lib/validation/password-rules';

/**
 * Restablecer contraseña (reset password) — .context/design/master-design-plan.md
 * §4.6, mockup en .context/designs/tudeclaracion/password-recovery/reset-password.html
 *
 * Built against the live login/signup shell and tokens, not the mockup's own
 * palette/composition — see §5 D3. Password strength always uses
 * password-rules.ts, never the mockup's own (looser) demo rule.
 *
 * Reachable only via the recovery-email link, which /auth/confirm has
 * already exchanged for a session by the time this page renders. No session
 * on mount means the link was invalid, expired, or already used.
 */
type Status = 'checking' | 'valid' | 'invalid' | 'success';

const RULE_LABELS: { key: keyof ReturnType<typeof getPasswordRules>, label: string }[] = [
  { key: 'length', label: 'Al menos 10 caracteres.' },
  { key: 'upper', label: 'Al menos una letra mayúscula.' },
  { key: 'lower', label: 'Al menos una letra minúscula.' },
  { key: 'digit', label: 'Al menos un número.' },
];

export default function ResetPasswordPage() {
  const [status, setStatus] = useState<Status>('checking');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [confirmError, setConfirmError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data }) => {
      setStatus(data.user ? 'valid' : 'invalid');
    });
  }, []);

  const rules = getPasswordRules(password);
  const showPasswordError = submitted && !passwordMeetsRequirements(password);

  async function handleSubmit() {
    setSubmitted(true);

    if (!passwordMeetsRequirements(password)) {
      return;
    }

    if (password !== confirmPassword) {
      setConfirmError(true);
      return;
    }

    setConfirmError(false);
    setIsSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setIsSubmitting(false);

    if (!error) {
      setStatus('success');
    }
  }

  if (status === 'checking') {
    return (
      <main className="grid min-h-screen place-items-center bg-gradient-to-b from-background to-white p-6">
        <p className="text-muted-foreground">Verificando enlace…</p>
      </main>
    );
  }

  if (status === 'invalid') {
    return (
      <main className="grid min-h-screen place-items-center bg-gradient-to-b from-background to-white p-6">
        <div className="grid w-full max-w-[980px] grid-cols-1 overflow-hidden rounded-lg border border-border bg-card shadow-md md:grid-cols-[1fr_420px]">
          <IntroPanel />
          <section className="grid gap-4 p-10">
            <div className="rounded-md border border-error/25 bg-error-bg px-4 py-3 text-error-text">
              <strong className="mb-1 block">Enlace inválido o vencido.</strong>
              Este enlace ya no se puede usar. Puede haber expirado o ya haber sido utilizado en una recuperación anterior.
            </div>
            <Button asChild size="lg" className="h-[52px]">
              <a href="/forgot-password">Solicitar nuevo enlace</a>
            </Button>
            <FooterLink />
          </section>
        </div>
      </main>
    );
  }

  if (status === 'success') {
    return (
      <main className="grid min-h-screen place-items-center bg-gradient-to-b from-background to-white p-6">
        <div className="grid w-full max-w-[980px] grid-cols-1 overflow-hidden rounded-lg border border-border bg-card shadow-md md:grid-cols-[1fr_420px]">
          <IntroPanel />
          <section className="grid gap-4 p-10">
            <div className="rounded-md border border-success/25 bg-success-bg px-4 py-3 text-success-text">
              <strong className="mb-1 block">Contraseña actualizada.</strong>
              El cambio quedó guardado correctamente. Ya podés volver a iniciar sesión con tu nueva contraseña.
            </div>
            <Button asChild size="lg" className="h-[52px]">
              <a href="/login">Ir al login</a>
            </Button>
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
            <strong className="text-lg">Restablecer contraseña</strong>
            <p className="text-muted-foreground">
              Elegí una contraseña nueva para volver a ingresar a tu cuenta.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Nueva contraseña</Label>
            <Input
              id="password"
              type="password"
              placeholder="Crea una contraseña"
              className="h-[52px]"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
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

          <div className="grid gap-2">
            <Label htmlFor="confirm-password">Confirmar contraseña</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Repetí la contraseña"
              className="h-[52px]"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setConfirmError(false);
              }}
            />
            {confirmError && (
              <div className="rounded-md border border-error/25 bg-error-bg px-4 py-3 text-error-text">
                Las contraseñas no coinciden.
              </div>
            )}
          </div>

          <Button type="button" size="lg" className="h-[52px]" onClick={() => void handleSubmit()} disabled={isSubmitting}>
            {isSubmitting ? 'Guardando…' : 'Guardar nueva contraseña'}
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
        <Logo variant="mark" className="mb-4 h-11 w-11" priority />
        <h1 className="mb-3 font-heading text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl">
          Definí una contraseña segura y volvé a entrar con confianza.
        </h1>
        <p className="text-muted-foreground">
          Usa las mismas reglas de fortaleza del resto del producto para mantener tu cuenta protegida.
        </p>
      </div>
    </section>
  );
}

function FooterLink() {
  return (
    <p className="text-muted-foreground">
      <a href="/login" className="font-semibold text-primary hover:underline">
        Volver al login
      </a>
    </p>
  );
}
