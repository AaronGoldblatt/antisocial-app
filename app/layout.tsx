import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

import { auth } from "@/auth"
import { Header } from "@/components/header"
import { Providers } from "./providers"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "AntiSocial",
    description: "A social media platform focused on dislikes",
}

export default async function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode
}>) {
    const session = await auth()

    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <Providers>
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
