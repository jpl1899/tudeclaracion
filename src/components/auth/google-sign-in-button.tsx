'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/infrastructure/supabase/client';

/**
 * "Continuar con Google" (TD-32, ADR-0004) — shared between /login and
 * /signup. Both land on the same /auth/callback exchange; Supabase's
 * automatic identity linking (by verified email) decides whether that
 * creates a new account or links to an existing one, so this component
 * doesn't need to know which case it is.
 */
export function GoogleSignInButton() {
  const [isRedirecting, setIsRedirecting] = useState(false);

  async function handleClick() {
    setIsRedirecting(true);
    const supabase = createClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${appUrl}/auth/callback` },
    });

    if (error) {
      setIsRedirecting(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className="h-[52px] gap-3"
      onClick={() => void handleClick()}
      disabled={isRedirecting}
    >
      <GoogleIcon />
      {isRedirecting ? 'Redirigiendo…' : 'Continuar con Google'}
    </Button>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.46c-.28 1.5-1.13 2.78-2.4 3.63v3.02h3.89c2.28-2.1 3.57-5.2 3.57-8.84z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.94-2.9l-3.89-3.02c-1.08.72-2.45 1.15-4.05 1.15-3.11 0-5.75-2.1-6.69-4.92H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
      <path fill="#FBBC05" d="M5.31 14.31c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28V6.66H1.29A11.96 11.96 0 0 0 0 12c0 1.93.46 3.76 1.29 5.34z" />
      <path fill="#EA4335" d="M12 4.75c1.76 0 3.34.6 4.59 1.79l3.44-3.44C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.66l4.02 3.09C6.25 6.86 8.89 4.75 12 4.75z" />
    </svg>
  );
}
