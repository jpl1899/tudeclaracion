import { redirect } from 'next/navigation';
import { createClient } from '@/infrastructure/supabase/server';
import { CuentaClient } from './cuenta-client';

/**
 * Mi cuenta — docs/superpowers/specs/2026-10-18-post-login-home-design.md §3.
 * Built as stacked sections: Perfil now; Plan and Seguridad will slot in once
 * the business model is defined.
 */
export default async function CuentaPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data, error } = await supabase.from('cuenta').select('nombre').eq('id', user.id).maybeSingle();
  if (error) {
    console.error('[cuenta] load failed:', error);
  }

  return <CuentaClient userId={user.id} email={user.email ?? ''} nombreInicial={data?.nombre ?? null} />;
}
