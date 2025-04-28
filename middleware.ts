import { type NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
    // Handle sign-out page redirection
    if (request.nextUrl.pathname === '/auth/sign-out') {
        return NextResponse.redirect(new URL('/auth/sign-in', request.url))
    }

    // Handle other auth redirects as needed
    if (request.nextUrl.pathname.startsWith('/auth') && 
        request.nextUrl.pathname !== '/auth/sign-in' && 
        request.nextUrl.pathname !== '/auth/sign-up') {
        
        const redirectUrl = new URL('/auth/sign-in', request.url)
        return NextResponse.redirect(redirectUrl)
    }

    // For non-auth pages, check if the user has posted in this session
    // Exclude welcome page, API routes, and static assets to avoid redirect loops
    if (!request.nextUrl.pathname.startsWith('/auth') && 
        !request.nextUrl.pathname.startsWith('/api') &&
        request.nextUrl.pathname !== '/welcome') {
        
        // Check if they've posted this session
        const hasPostedThisSession = request.cookies.get('has_posted_this_session')?.value === 'true'
        
        if (!hasPostedThisSession) {
            return NextResponse.redirect(new URL('/welcome', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    runtime: "nodejs",
    matcher: [
        '/auth/:path*',
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ]
}
