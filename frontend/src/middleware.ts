import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('access_token')?.value;
    const isSetupComplete = request.cookies.get('is_setup_complete')?.value;
    const { pathname } = request.nextUrl;

    // If trying to access protected routes and not logged in
    if ((pathname.startsWith('/dashboard') || pathname.startsWith('/ingest')) && !token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // If logged in
    if (token) {
        // Trying to access auth pages
        if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }


    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/ingest/:path*', '/login', '/register'],
};
