import type { Database } from '@/types/supabase';
import { createClient } from '@supabase/supabase-js';
import { supabaseUrl } from './env';

/**
 * Privileged Supabase client (secret key, bypasses RLS). SERVER ONLY.
 *
 * Scope: writes to `cotizacion_bcu_cache`, a cache of public BCU data that is
 * shared by every tenant. Users have SELECT only on that table (threat-model
 * item 5), so only the server can fill it. Never use this client for tenant
 * data: it ignores `cuenta_id` isolation.
 *
 * The key is read lazily (not at import) and has no `NEXT_PUBLIC_` prefix, so
 * it never reaches the browser bundle.
 */
export function createAdminClient() {
  const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();
  if (!secretKey) {
    throw new Error('Missing required environment variable: SUPABASE_SECRET_KEY.');
  }

  return createClient<Database>(supabaseUrl, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
