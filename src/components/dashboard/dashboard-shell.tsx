import type { ReactNode } from 'react';
import Link from 'next/link';
import { UserMenu } from '@/components/auth/user-menu';
import { Logo } from '@/components/brand/logo';

/**
 * Shared authenticated chrome for every /dashboard screen: brand, main nav and
 * the active-company link — .context/design/master-design-plan.md §4.3 (D2, D6).
 * Screens pass their own sidebar extras (e.g. the BCU quote card) and render
 * their <main> as children.
 */
type DashboardNavItem = 'panel' | 'declaraciones' | 'ayuda';

interface DashboardShellProps {
  activeNav: DashboardNavItem
  /** Absent when there is no active company (only Ayuda allows that). */
  empresaNombre?: string
  sidebarExtra?: ReactNode
  children: ReactNode
}

const navItemClassName = 'min-h-12 rounded-md border px-3.5 text-left font-semibold';
const activeClassName = 'border-primary/15 bg-accent text-primary';
const inactiveClassName = 'border-transparent text-muted-foreground hover:bg-accent/60';

function navClassName(isActive: boolean, extra = '') {
  return `${navItemClassName} ${isActive ? activeClassName : inactiveClassName} ${extra}`.trim();
}

export function DashboardShell({ activeNav, empresaNombre, sidebarExtra, children }: DashboardShellProps) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]">
      <aside className="grid content-start gap-[18px] border-b border-border bg-card p-5 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/inicio"
            className="flex items-center gap-3 rounded-md font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Logo variant="mark" className="h-10 w-10" priority alt="" />
            <div>tuDeclaracion</div>
          </Link>
          <UserMenu />
        </div>

        <nav className="grid gap-2">
          <Link
            href="/dashboard"
            aria-current={activeNav === 'panel' ? 'page' : undefined}
            className={navClassName(activeNav === 'panel', 'content-center')}
          >
            Panel
          </Link>
          <button
            type="button"
            aria-current={activeNav === 'declaraciones' ? 'page' : undefined}
            className={navClassName(activeNav === 'declaraciones')}
          >
            Declaraciones generadas
          </button>
          <Link
            href="/dashboard/cotizaciones"
            className={navClassName(false, 'content-center')}
          >
            Cotizaciones
          </Link>
          <Link
            href="/dashboard/ayuda"
            aria-current={activeNav === 'ayuda' ? 'page' : undefined}
            className={navClassName(activeNav === 'ayuda', 'content-center')}
          >
            Ayuda
          </Link>
        </nav>

        <Link
          href="/empresas"
          className="mt-2 grid gap-0.5 rounded-md border border-border bg-muted p-3.5 text-sm transition-colors hover:border-primary/30"
        >
          <span className="text-muted-foreground">Empresa activa</span>
          {empresaNombre
            ? (
                <span className="font-semibold text-foreground">
                  {empresaNombre}
                  {' '}
                  <span className="font-normal text-primary">(cambiar)</span>
                </span>
              )
            : <span className="font-semibold text-primary">Elegir empresa</span>}
        </Link>

        {sidebarExtra}
      </aside>

      {children}
    </div>
  );
}
