import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "@/styles/globals.css"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import { Header } from "@/components/header"
import { Providers } from "./providers"
import { Toaster } from "sonner"
import { FontEnforcer } from "@/components/FontEnforcer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "AntiSocial",
    description: "A social media platform focused on dislikes",
}

// Ensure this layout is not cached and re-renders on every request
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    // Get fresh session data on every request
    const session = await auth.api.getSession({
        headers: await headers()
    });

    return (
        <html lang="en" className="dark" suppressHydrationWarning>
            <body className={inter.className}>
                <Providers>
                    <FontEnforcer />
                    <Header user={session?.user} />
                    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
                        {children}
                    </div>
                    <Toaster position="bottom-right" />
                </Providers>
            </body>
        </html>
    )
}
