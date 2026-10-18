import type { User } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';
import { redirect } from 'next/navigation';
import { createClient } from '@/infrastructure/supabase/server';
import { safeInternalPath } from '@/lib/validation/safe-redirect';

/**
 * Fills cuenta.nombre from the Google profile when the account has no name
 * yet. Never overwrites a name the user set in Mi cuenta, and never blocks
 * the login: failures are only logged.
 */
async function completarNombreDesdeGoogle(supabase: Awaited<ReturnType<typeof createClient>>, user: User): Promise<void> {
  const metadata = user.user_metadata as { full_name?: unknown, name?: unknown };
  const candidato = [metadata.full_name, metadata.name].find(
    (valor): valor is string => typeof valor === 'string' && valor.trim() !== '',
  );
  if (!candidato) {
    return;
  }

  const { error } = await supabase
    .from('cuenta')
    .update({ nombre: candidato.trim().slice(0, 80) })
    .eq('id', user.id)
    .is('nombre', null);
  if (error) {
    console.error('[auth/callback] could not save Google name:', error);
  }
}

/**
 * Exchanges the OAuth PKCE code from Supabase Auth's Google provider for a
 * session (TD-32, ADR-0004). Separate from `/auth/confirm`, which stays
 * exclusive to the email-OTP flow (signup verification, password recovery).
 *
 * Supabase forwards a provider denial (e.g. the user dismisses the Google
 * consent screen) as an `error` query param instead of a `code` — handled
 * the same way as a failed exchange.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const providerError = searchParams.get('error');
  const next = safeInternalPath(searchParams.get('next'), '/inicio');

  if (code && !providerError) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      await completarNombreDesdeGoogle(supabase, data.user);
      redirect(next);
    }
  }

  redirect('/login?error=google-auth-failed');
}
