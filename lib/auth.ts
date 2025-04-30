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
