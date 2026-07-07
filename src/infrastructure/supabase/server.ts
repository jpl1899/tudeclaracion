import type { Database } from '@/types/supabase';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabasePublishableKey, supabaseUrl } from './env';

/**
 * Supabase client for Server Components, Server Actions and Route Handlers.
 * `cookies()` is async in Next.js 15 — always `await createClient()`.
 *
 * `setAll` can throw when called from a Server Component render (cookies are
 * read-only there); that's expected and safe to ignore because `middleware.ts`
 * is responsible for refreshing the session cookie on every request.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        }
        catch {
          // Ignored — called from a Server Component; middleware.ts refreshes the session.
        }
      },
    },
  });
}
