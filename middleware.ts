import { type NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
    // Create a response so we can add custom headers
    const response = NextResponse.next()
    
    // Add current pathname as a header for use in layout.tsx
    response.headers.set('x-pathname', request.nextUrl.pathname)
    
    // Handle sign-out redirection by allowing the request through
    if (request.nextUrl.pathname === '/auth/sign-out') {
        return response
    }

    // Also clear cookie on fresh sign-in
    if (request.nextUrl.pathname === '/auth/sign-in') {
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
    // Exclude welcome page, homepage, API routes, and static assets to avoid redirect loops
    if (!request.nextUrl.pathname.startsWith('/auth') && 
        !request.nextUrl.pathname.startsWith('/api') &&
        request.nextUrl.pathname !== '/welcome' &&
        request.nextUrl.pathname !== '/') { // Allow access to homepage
        
        // Check if they've posted this session
        const hasPostedThisSession = request.cookies.get('has_posted_this_session')?.value === 'true'
        
        if (!hasPostedThisSession) {
            return NextResponse.redirect(new URL('/welcome', request.url))
        }
    }

    return response
}

export const config = {
    runtime: "nodejs",
    matcher: [
        '/auth/:path*',
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ]
}
