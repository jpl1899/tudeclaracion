import type { EmailOtpType } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';
import { redirect } from 'next/navigation';
import { createClient } from '@/infrastructure/supabase/server';

/**
 * Confirms a Supabase Auth email-verification link (signup, per TD-4) and
 * exchanges the token for a session before redirecting. This project uses
 * the PKCE flow via @supabase/ssr, so the confirmation link must route here
 * rather than to Supabase's own hosted confirmation page — see the TD-4
 * implementation plan, Dependencies, for the required email-template change.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/empresas';

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });

    if (!error) {
      redirect(next);
    }
  }

  redirect('/login?error=verification-failed');
}
