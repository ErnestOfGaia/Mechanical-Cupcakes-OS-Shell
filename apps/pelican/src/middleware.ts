/**
 * middleware.ts — Route protection for Pellito.
 *
 * All routes require a valid session cookie except:
 *   /login          — the login page itself
 *   /api/auth/*     — login and logout endpoints
 *   /api/health     — uptime probe (public)
 *   /_next/*        — Next.js internals
 *   /favicon.ico    — browser chrome
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifySession, COOKIE_NAME } from '@/lib/auth';

const PUBLIC_PATHS = ['/login', '/api/auth', '/api/health', '/_next', '/favicon.ico'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths through without a session check
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Verify session cookie
  const cookieValue = req.cookies.get(COOKIE_NAME)?.value;
  const role = cookieValue ? await verifySession(cookieValue) : null;

  if (!role) {
    // Not authenticated — redirect to login, preserving the intended URL
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin-only guard for /admin routes
  if (pathname.startsWith('/admin') && role !== 'admin') {
    const homeUrl = req.nextUrl.clone();
    homeUrl.pathname = '/';
    homeUrl.searchParams.delete('next');
    return NextResponse.redirect(homeUrl);
  }

  // Pass role to page via request header (readable by server components)
  const res = NextResponse.next();
  res.headers.set('x-pellito-role', role);
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
