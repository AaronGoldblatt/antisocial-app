import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "@/styles/globals.css"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import { Header } from "@/components/header"
import { Providers } from "./providers"
import { Toaster } from "sonner"
import { FontEnforcer } from "@/components/FontEnforcer"
import { redirect } from "next/navigation"

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
            <head>
                <style dangerouslySetInnerHTML={{
                    __html: `
                    /* Direct targeting with highest specificity */
                    html body div.flex.flex-col.gap-3.rounded-lg.border.p-4.shadow-sm p:not(.text-xs),
                    html body .post-content, 
                    html body .comment-content, 
                    html body p.post-content, 
                    html body p.comment-content, 
                    html body .whitespace-pre-wrap.break-words, 
                    html body [class*="post-content"], 
                    html body [class*="comment-content"],
                    html body p.whitespace-pre-wrap,
                    html body span.whitespace-pre-wrap,
                    html body div p.whitespace-pre-wrap,
                    html body div span.whitespace-pre-wrap {
                        font-family: "Comic Sans MS", "Comic Sans", "Comic Neue", cursive !important;
                        font-weight: normal !important;
                        letter-spacing: normal !important;
                        line-height: 1.5 !important;
                        font-style: normal !important;
                        font-variant: normal !important;
                        text-transform: none !important;
                    }
                    
                    /* !important to override any inline styles */
                    p[style], span[style], div p[style], div span[style] {
                        font-family: "Comic Sans MS", "Comic Sans", "Comic Neue", cursive !important;
                    }
                    
                    /* Target EXACTLY what we see in the screenshot */
                    body div div.flex.flex-col.gap-3.rounded-lg.border.p-4.shadow-sm p,
                    [id^="__"] div.flex.flex-col.gap-3.rounded-lg.border.p-4.shadow-sm p,
                    #__next div.flex.flex-col.gap-3.rounded-lg.border.p-4.shadow-sm p,
                    html > body > div > main > div > div.flex.flex-col.gap-3.rounded-lg.border.p-4.shadow-sm > p,
                    html > body * div.flex.flex-col.gap-3.rounded-lg.border.p-4.shadow-sm > p {
                        font-family: "Comic Sans MS", "Comic Sans", "Comic Neue", cursive !important;
                        font-weight: normal !important;
                        letter-spacing: normal !important;
                        font-style: normal !important;
                        line-height: 1.5 !important;
                        color: #FF6600 !important;
                    }
                    
                    /* Brute force approach - style ALL paragraphs */
                    div.flex.flex-col p:not(.text-xs) {
                        font-family: "Comic Sans MS", "Comic Sans", "Comic Neue", cursive !important;
                    }
                    `
                }} />
                <script dangerouslySetInnerHTML={{
                    __html: `
                    // Run immediately
                    (function() {
                        function forceComicSans() {
                            // Target posts directly with specific selectors
                            const posts = document.querySelectorAll('.flex.flex-col.gap-3.rounded-lg.border.p-4.shadow-sm p:not(.text-xs)');
                            posts.forEach(post => {
                                post.style.cssText = 'font-family: \"Comic Sans MS\", \"Comic Sans\", \"Comic Neue\", cursive !important; font-weight: normal !important;';
                            });
                            
                            // Target by whitespace-pre-wrap class which is on the post content
                            const postContents = document.querySelectorAll('p.whitespace-pre-wrap, .whitespace-pre-wrap, p.whitespace-pre-wrap.break-words');
                            postContents.forEach(el => {
                                el.style.cssText = 'font-family: \"Comic Sans MS\", \"Comic Sans\", \"Comic Neue\", cursive !important; font-weight: normal !important;';
                            });
                        }
                        
                        // Run immediately
                        forceComicSans();
                        
                        // Also run after DOM is fully loaded
                        document.addEventListener('DOMContentLoaded', forceComicSans);
                        
                        // And after everything is loaded
                        window.addEventListener('load', forceComicSans);
                        
                        // Run periodically
                        setInterval(forceComicSans, 1000);
                        
                        // Last resort - overwrite all CREEPSTER font with COMIC SANS
                        if (document.fonts) {
                            document.fonts.ready.then(() => {
                                const styleSheets = document.styleSheets;
                                for (let i = 0; i < styleSheets.length; i++) {
                                    try {
                                        const rules = styleSheets[i].cssRules || styleSheets[i].rules;
                                        for (let j = 0; j < rules.length; j++) {
                                            if (rules[j].style && rules[j].style.fontFamily) {
                                                if (rules[j].style.fontFamily.includes('Creepster')) {
                                                    rules[j].style.fontFamily = '"Comic Sans MS", "Comic Sans", "Comic Neue", cursive';
                                                }
                                            }
                                        }
                                    } catch (e) {
                                        // Ignore CORS errors for external stylesheets
                                    }
                                }
                            });
                        }
                    })();
                    `
                }} />
            </head>
            <body className={inter.className}>
                <Providers>
                    <FontEnforcer />
                    <Header user={session?.user} />
                    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
                        {children}
                    </div>
                    <Toaster position="bottom-right" />
                </Providers>
                
                {/* Last resort script to enforce Comic Sans */}
                <script src="/comic-sans-fixer.js" async></script>
            </body>
        </html>
    )
}
