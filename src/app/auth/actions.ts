'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/infrastructure/supabase/server';
import { EMPRESA_ACTIVA_COOKIE } from '@/modules/empresa/empresa-activa';

/**
 * Signs out and forgets the active company, so the next person on the same
 * machine does not inherit it. A sign-out error is logged but never keeps the
 * user inside: the cookie is cleared and the redirect still happens.
 */
export async function salir(): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('[salir] signOut failed:', error);
  }

  const cookieStore = await cookies();
  cookieStore.delete(EMPRESA_ACTIVA_COOKIE);

  redirect('/login');
}
