import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    // Sign out using BetterAuth
    await auth.api.signOut({
      headers: request.headers
    })
    
    // Create a response with redirect to sign-in
    const response = NextResponse.redirect(new URL("/auth/sign-in", request.url))
    
    // Clear the has_posted_this_session cookie in the response
    response.cookies.set({
      name: "has_posted_this_session",
      value: "",
      path: "/",
      maxAge: 0
    })
    
    return response
  } catch (error) {
    console.error("Error signing out:", error)
    return NextResponse.redirect(new URL("/auth/sign-in", request.url))
  }
} 