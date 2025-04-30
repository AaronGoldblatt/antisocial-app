import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"

import { db } from "@/database/db"
import * as schema from "@/database/schema"
import { nextCookies } from "better-auth/next-js"

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        usePlural: true,
        schema
    }),
    session: {
        cookieCache: {
            enabled: false
        },
        // Add transformer to remove image from session data
        transformer: {
            serialize: (user) => {
                // Remove the image field from session to prevent large cookies
                if (user && typeof user === 'object' && 'image' in user) {
                    const { image, ...userWithoutImage } = user;
                    return userWithoutImage;
                }
                return user;
            },
            deserialize: (data) => data
        }
    },
    emailAndPassword: {
        enabled: true,
        callbackURL: "/welcome" // Redirect to welcome page after sign in/sign up
    },
    // Configure default callbacks for all auth methods
    callbacks: {
        session: {
            onSuccess: {
                signIn: "/welcome",
                signUp: "/welcome"
            }
        }
    },
    plugins: [
        nextCookies() // keep this last in `plugins` array
    ]
})
