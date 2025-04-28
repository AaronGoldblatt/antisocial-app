"use client"

import { AuthCard } from "@daveyplate/better-auth-ui"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { authClient } from "@/lib/auth-client"

export function AuthView({ pathname }: { pathname: string }) {
    const router = useRouter()

    useEffect(() => {
        // Force refresh the router to ensure we have latest auth state
        router.refresh()
    }, [router])

    // Handle sign-out pathname specifically
    useEffect(() => {
        if (pathname === "sign-out") {
            const handleSignOut = async () => {
                // Clear any session cookies
                document.cookie = "has_posted_this_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;"
                
                // Use the auth client to sign out
                await authClient.signOut()
                
                // Force a complete page refresh to update UI state
                window.location.href = "/auth/sign-in"
            }
            
            handleSignOut()
        }
    }, [pathname])

    return (
        <main className="flex grow flex-col items-center justify-center p-4">
            <AuthCard pathname={pathname} />
        </main>
    )
}
