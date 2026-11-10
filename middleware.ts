import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { supabaseCookieOptions, supabasePublishableKey, supabaseUrl } from '@/infrastructure/supabase/env';

const PROTECTED_ROUTES = ['/inicio', '/cuenta', '/empresas', '/dashboard'];
// /reset-password is intentionally excluded — a user lands there via a
// fresh recovery session (established by /auth/confirm), and redirecting
// them away as "already authenticated" would break that flow.
const AUTH_ROUTES = ['/login', '/signup', '/forgot-password'];

/**
 * Refreshes the Supabase session on every request and enforces route access:
 * unauthenticated users are redirected away from protected routes, and
 * authenticated users are redirected away from /login (SRS 12-security.md —
 * tenant isolation is enforced separately by RLS on cuenta_id).
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookieOptions: supabaseCookieOptions,
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // getUser() re-validates the token against Supabase Auth (unlike getSession(),
  // which trusts the local cookie) — required to safely gate routes here.
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));

  if (!user && isProtectedRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isAuthRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/inicio';
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
