import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function middleware(request: NextRequest) {
    // Handle sign-out redirection by allowing the request through
    if (request.nextUrl.pathname === '/auth/sign-out') {
        return NextResponse.next()
    }

    // Also clear cookie on fresh sign-in
    if (request.nextUrl.pathname === '/auth/sign-in') {
        // Create a response object so we can modify cookies
        const response = NextResponse.next()
        
        // Remove the session cookie if it exists
        response.cookies.delete('has_posted_this_session')
        
        return response
    }

    // Handle successful auth callback - redirect to welcome page
    if (request.nextUrl.pathname.startsWith('/auth/callback')) {
        // Let the auth flow continue, but the callback should redirect to welcome
        return NextResponse.next()
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

    // Check if user is at root and not authenticated
    if (request.nextUrl.pathname === '/') {
        // Check for authentication via session
        const session = await auth.api.getSession({
            headers: await headers()
          });

          if (!session?.user) {
            return NextResponse.redirect(new URL('/landing', request.url))
        }
    }

    // For non-auth pages, check if the user has posted in this session
    // Exclude welcome page, landing page, API routes, and static assets to avoid redirect loops
    // NOTE: We now check the root page ('/') too
    if (!request.nextUrl.pathname.startsWith('/auth') && 
        !request.nextUrl.pathname.startsWith('/api') &&
        request.nextUrl.pathname !== '/welcome' &&
        request.nextUrl.pathname !== '/landing') {
        
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
