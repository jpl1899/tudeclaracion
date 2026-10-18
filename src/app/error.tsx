'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

/**
 * Root error boundary. In production Next.js already replaces the message of
 * server-side errors with a generic one plus a digest; this screen keeps the
 * user in Spanish with a way to retry or go back, and never renders the raw
 * error text.
 */
export default function ErrorPage({ error, reset }: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[error-boundary]', error);
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-b from-background to-white p-6">
      <div className="grid w-full max-w-[520px] gap-4 rounded-lg border border-border bg-card p-10 shadow-md">
        <strong className="text-lg">No pudimos cargar esta pantalla.</strong>
        <p className="text-muted-foreground">
          Ocurrió un error inesperado. Intentá nuevamente en unos minutos.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground">{`Código de referencia: ${error.digest}`}</p>
        )}
        <div className="flex flex-wrap gap-3">
          <Button size="lg" onClick={() => reset()}>Reintentar</Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/empresas">Volver a mis empresas</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
