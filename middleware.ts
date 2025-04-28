import { type NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
    // Handle sign-out page redirection and cookie clearing
    if (request.nextUrl.pathname === '/auth/sign-out') {
        // Create a response for redirecting to sign-in
        const response = NextResponse.redirect(new URL('/auth/sign-in', request.url))
        
        // Remove the session cookie
        response.cookies.delete('has_posted_this_session')
        
        return response
    }

    // Also clear cookie on fresh sign-in
    if (request.nextUrl.pathname === '/auth/sign-in') {
        // Create a response object so we can modify cookies
        const response = NextResponse.next()
        
        // Remove the session cookie if it exists
        response.cookies.delete('has_posted_this_session')
        
        return response
    }

    // Handle other auth redirects as needed
    if (request.nextUrl.pathname.startsWith('/auth') && 
        request.nextUrl.pathname !== '/auth/sign-in' && 
        request.nextUrl.pathname !== '/auth/sign-up' &&
        request.nextUrl.pathname !== '/auth/settings' &&
        !request.nextUrl.pathname.startsWith('/auth/callback')) {
        
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
