import { NextResponse } from "next/server";

export function middleware(request) {
    const path = request.nextUrl.pathname;
    const isPublicPath = path === '/login' || path === '/signup';
    const token = request.cookies.get('authToken')?.value || '';

    if (isPublicPath && token) {
        // Redirect authenticated users trying to access login/signup to their profile
        return NextResponse.redirect(new URL('/profile', request.nextUrl));
    }
    if (!isPublicPath && !token) {
        // Redirect unauthenticated users trying to access protected routes to login
        return NextResponse.redirect(new URL('/login', request.nextUrl));
    }

    // Allow access if authenticated or accessing a public path
    return NextResponse.next();
}

export const config = {
    matcher: [
        "/profile",
        "/login",
        "/signup",
        "/movies/:path*",
        "/shows/:path*",
        "/animes/:path*",
        "/editprofile/:path*"
    ]
};