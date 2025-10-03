import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/token';

export function middleware(request: NextRequest) {
    // กำหนด protected routes
    const protectedPaths = ['/users', '/dashboard', '/profile'];
    const authPaths = ['/login', '/register'];

    const { pathname } = request.nextUrl;

    // เช็คว่าเป็น protected route หรือไม่
    const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
    const isAuthPath = authPaths.some(path => pathname.startsWith(path));
    const isHomePage = pathname === '/';

    // ดึง token จาก cookie
    const token = request.cookies.get('auth-token')?.value;
    const isAuthenticated = token && verifyToken(token);

    // Handle home page redirect based on authentication status
    if (isHomePage) {
        if (isAuthenticated) {
            // ถ้า login แล้ว redirect ไป users
            return NextResponse.redirect(new URL('/users', request.url));
        } else {
            // ถ้ายัง login redirect ไป login
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    if (isProtectedPath) {
        // ถ้าไม่มี token หรือ token ไม่ถูกต้อง
        if (!isAuthenticated) {
            // Redirect ไปหน้า login
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    if (isAuthPath && isAuthenticated) {
        // ถ้ามี token ถูกต้องแล้วยังไปหน้า login/register
        // Redirect ไปหน้า users
        return NextResponse.redirect(new URL('/users', request.url));
    }

    return NextResponse.next();
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