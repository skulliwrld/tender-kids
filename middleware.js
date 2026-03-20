import { NextResponse } from 'next/server';

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // 1. THE BYPASS (Critical to stop the loop)
  // This tells the engine to ignore these paths entirely.
  if (
    pathname === '/' ||
    pathname.startsWith('/signin') || 
    pathname.startsWith('/signup') || 
    pathname.startsWith('/api') || 
    pathname.startsWith('/_next') ||
    pathname.includes('.') // Allows student photos and CSS to load
  ) {
    return NextResponse.next();
  }

  // 2. THE COOKIE CHECK
  // We check for the session cookie name. 
  // 'next-auth.session-token' is for local development.
  // '__Secure-next-auth.session-token' is for production (https).
  const sessionToken = req.cookies.get('next-auth.session-token')?.value || 
                       req.cookies.get('__Secure-next-auth.session-token')?.value;

  // 3. THE REDIRECT
  // If there is no session token, send them to the sign-in page.
  if (!sessionToken) {
    const url = new URL('/signin', req.url);
    // This allows the user to come back to the "Add Student" page after logging in
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // 4. THE GATEKEEPER
  // If they have a token, let them pass to the page.
  return NextResponse.next();
}

// Ensure the middleware runs on all routes except static assets
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};