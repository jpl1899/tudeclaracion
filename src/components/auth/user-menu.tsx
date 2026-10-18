'use client';

import { CircleHelp, LogOut, User, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { salir } from '@/app/auth/actions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { createClient } from '@/infrastructure/supabase/client';
import { iniciales } from '@/modules/inicio/resumen-inicio';

/**
 * Account menu (initials avatar): name, email, Mi cuenta, Ayuda, Salir.
 * Screens that already loaded the profile pass it in; otherwise (e.g. inside
 * DashboardShell, rendered by client components) the menu loads it itself,
 * RLS-scoped to the signed-in user.
 */
export interface PerfilUsuario {
  nombre: string | null
  email: string
}

export function UserMenu({ perfil: perfilProp }: { perfil?: PerfilUsuario }) {
  const [perfilCargado, setPerfilCargado] = useState<PerfilUsuario | null>(null);
  const perfil = perfilProp ?? perfilCargado;

  useEffect(() => {
    if (perfilProp) {
      return;
    }
    let cancelled = false;
    const supabase = createClient();
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) {
        return;
      }
      const { data } = await supabase.from('cuenta').select('nombre').eq('id', user.id).maybeSingle();
      if (!cancelled) {
        setPerfilCargado({ nombre: data?.nombre ?? null, email: user.email ?? '' });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [perfilProp]);

  const letras = iniciales(perfil?.nombre ?? null);
  const nombre = perfil?.nombre?.trim() || null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Menú de usuario"
        className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {letras ?? <User className="h-5 w-5" aria-hidden />}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {perfil && (
          <>
            <DropdownMenuLabel>
              {nombre && <span className="block font-semibold">{nombre}</span>}
              <span className="block truncate text-muted-foreground">{perfil.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem asChild>
          <Link href="/cuenta">
            <UserRound aria-hidden />
            Mi cuenta
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/ayuda">
            <CircleHelp aria-hidden />
            Ayuda
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void salir()}>
          <LogOut aria-hidden />
          Salir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
