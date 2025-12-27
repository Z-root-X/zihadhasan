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
            const { payload } = await jwtVerify(authToken, JWKS, {
                issuer: `https://securetoken.google.com/zihadhasan`, // Project ID needed here? Use generic check if unsure of ID.
                algorithms: ['RS256']
            });

            // 3. Optional: Check auth_role cookie for fast failure (User vs Admin)
            // Note: Use Firestore Security Rules for real authorization.
            // This just prevents "User" UI from loading "Admin" Dashboard for UX.
            if (!authRole || authRole !== 'admin') {
                return NextResponse.redirect(new URL('/my-account', request.url));
            }

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
