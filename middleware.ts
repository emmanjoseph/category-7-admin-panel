import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;

  const { pathname } = request.nextUrl;

  // Define public paths that don't require a token
  const isPublicPath = pathname === '/sign-in';

  // If there's no token and it's not a public path, redirect to sign-in
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // If there's a token and user tries to access sign-in, redirect to home
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Match all routes except static files, api routes that don't need auth, etc.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (e.g. logos)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
