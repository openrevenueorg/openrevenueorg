import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(_request: NextRequest) {
  // Add security headers
  const response = NextResponse.next();

//   const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
//   const cspHeader = `
//     default-src 'self';
//     script-src 'self' 'https://openpanel.dev/op1.js' 'nonce-${nonce}' 'strict-dynamic';
//     style-src 'self' 'nonce-${nonce}' ;
//     img-src 'self' blob: data:;
//     font-src 'self';
//     object-src 'none';
//     base-uri 'self';
//     form-action 'self';
//     frame-ancestors 'none';
//     upgrade-insecure-requests;
// `
//   // Replace newline characters and spaces
//   const contentSecurityPolicyHeaderValue = cspHeader
//     .replace(/\s{2,}/g, ' ')
//     .trim();


  // response.headers.set('x-nonce', nonce);
  // response.headers.set('Content-Security-Policy', contentSecurityPolicyHeaderValue);
  
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
