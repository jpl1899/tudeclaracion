'use client';

import Link from 'next/link';
import { useState } from 'react';
import { UserMenu } from '@/components/auth/user-menu';
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/infrastructure/supabase/client';

type SaveState = 'idle' | 'success' | 'error';

const NOMBRE_MAX = 80;

export function CuentaClient({ userId, email, nombreInicial }: {
  userId: string
  email: string
  nombreInicial: string | null
}) {
  const [nombre, setNombre] = useState(nombreInicial ?? '');
  const [nombreGuardado, setNombreGuardado] = useState(nombreInicial);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>('idle');

  function handleNombreChange(value: string) {
    setNombre(value);
    setSaveState('idle');
  }

  async function handleSubmit() {
    const valor = nombre.trim() || null;

    setIsSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.from('cuenta').update({ nombre: valor }).eq('id', userId);
    setIsSubmitting(false);

    if (error) {
      console.error('[cuenta] update nombre failed:', error);
      setSaveState('error');
      return;
    }

    setNombre(valor ?? '');
    setNombreGuardado(valor);
    setSaveState('success');
  }

  return (
    <main className="mx-auto w-[min(760px,calc(100%-32px))] py-6 pb-10">
      <header className="mb-10 flex items-center justify-between gap-4">
        <Link href="/inicio" className="flex items-center gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Logo variant="mark" className="h-[42px] w-[42px]" priority alt="" />
          <div className="font-semibold tracking-tight">tuDeclaracion</div>
        </Link>
        <UserMenu perfil={{ nombre: nombreGuardado, email }} />
      </header>

      <h1 className="mb-6 font-heading text-4xl font-semibold leading-tight tracking-tight">Mi cuenta</h1>

      <section aria-labelledby="perfil" className="grid gap-5 rounded-xl border border-border bg-card p-7 shadow-sm">
        <h2 id="perfil" className="text-lg font-semibold">Perfil</h2>

        {saveState === 'success' && (
          <div className="rounded-md border border-success/25 bg-success-bg px-4 py-3 text-success-text">
            Los cambios quedaron guardados.
          </div>
        )}
        {saveState === 'error' && (
          <div className="rounded-md border border-error/25 bg-error-bg px-4 py-3 text-error-text">
            <strong className="mb-1 block">No fue posible guardar los cambios.</strong>
            Ocurrió un error inesperado. Intentá nuevamente en unos minutos.
          </div>
        )}

        <div className="grid gap-2">
          <Label htmlFor="nombre">Nombre</Label>
          <Input
            id="nombre"
            type="text"
            placeholder="Tu nombre y apellido"
            className="h-[52px]"
            maxLength={NOMBRE_MAX}
            value={nombre}
            onChange={e => handleNombreChange(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">Se usa para saludarte y en el menú de tu cuenta.</p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input id="email" type="email" className="h-[52px]" value={email} readOnly disabled />
        </div>

        <div className="flex flex-wrap gap-3">
          <Button size="lg" className="h-[52px]" onClick={() => void handleSubmit()} disabled={isSubmitting}>
            {isSubmitting ? 'Guardando…' : 'Guardar cambios'}
          </Button>
          <Button asChild variant="outline" size="lg" className="h-[52px]">
            <Link href="/inicio">Volver a Inicio</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
