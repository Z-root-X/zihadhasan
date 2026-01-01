import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createRemoteJWKSet, jwtVerify } from 'jose';

// Initialize JWKS (JSON Web Key Set) for Firebase Auth
const JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'));

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Only protect Dashboard Routes
    if (pathname.startsWith('/dashboard')) {
        const authToken = request.cookies.get('auth_token')?.value;
        const authRole = request.cookies.get('auth_role')?.value;

        // 1. Check if token exists
        if (!authToken) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // 2. Verify Token Signature
        try {
            const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'zihadhasan';
            const { payload } = await jwtVerify(authToken, JWKS, {
                issuer: `https://securetoken.google.com/${projectId}`,
                algorithms: ['RS256']
            });

            // 3. Security Check: Custom Claims VS Cookie
            // Priority: Trust the JWT payload (secure) over the cookie (insecure)
            const isAdmin = payload.admin === true || payload.role === 'admin';

            if (isAdmin) {
                // Verified Admin via Custom Claim - Allow
                return NextResponse.next();
            }

            // Fallback: Check cookie for "soft" verification (less secure, but handles legacy)
            // Ideally, you should migrate to strict Custom Claims only.
            if (authRole === 'admin') {
                return NextResponse.next();
            }

            // If neither matches, deny access
            return NextResponse.redirect(new URL('/my-account', request.url));

        } catch (error) {
            console.error("Middleware Auth Error:", error);
            // Invalid Token (Expired or Forged)
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*'],
};
