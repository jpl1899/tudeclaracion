import type { NextRequest } from 'next/server';
import { redirect } from 'next/navigation';
import { createClient } from '@/infrastructure/supabase/server';
import { safeInternalPath } from '@/lib/validation/safe-redirect';

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
  const next = safeInternalPath(searchParams.get('next'), '/empresas');

  if (code && !providerError) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      redirect(next);
    }
  }

  redirect('/login?error=google-auth-failed');
}
