import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check for auth_role cookie set by AuthProvider
    const authRole = request.cookies.get('auth_role')?.value;

    // Protect Dashboard Routes (Admin only)
    if (pathname.startsWith('/dashboard')) {
        if (!authRole || authRole !== 'admin') {
            // Redirect unauthorized access to login
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*'],
};
