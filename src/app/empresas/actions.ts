'use server';

import { cookies } from 'next/headers';
import { EMPRESA_ACTIVA_COOKIE } from '@/modules/empresa/empresa-activa';

const UN_MES_EN_SEGUNDOS = 60 * 60 * 24 * 30;

/**
 * TD-5 (2026-07-28): fija qué empresa queda activa para toda la cuenta --
 * llamado desde /empresas al confirmar "Ingresar al dashboard". El resto de
 * las páginas del dashboard leen esta cookie vía `resolverEmpresaActiva`.
 */
export async function seleccionarEmpresaActiva(empresaId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(EMPRESA_ACTIVA_COOKIE, empresaId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: UN_MES_EN_SEGUNDOS,
  });
}
