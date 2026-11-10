import { LoginClient } from './login-client';

/**
 * Server Component: reads the `error` query param `/auth/callback` sets on
 * a failed Google sign-in (TD-32) and passes it down — same server/client
 * split used elsewhere (e.g. /empresas/nueva).
 */
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return <LoginClient googleAuthFailed={error === 'google-auth-failed'} />;
}
