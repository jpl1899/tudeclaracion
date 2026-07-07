import type { Database } from '@/types/supabase';
import { createBrowserClient } from '@supabase/ssr';
import { supabasePublishableKey, supabaseUrl } from './env';

/**
 * Supabase client for Client Components ('use client'). Session cookies are
 * managed automatically by @supabase/ssr's default browser storage.
 */
export function createClient() {
  return createBrowserClient<Database>(supabaseUrl, supabasePublishableKey);
}
