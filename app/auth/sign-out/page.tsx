"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SignOutPage() {
  const router = useRouter()
  
  useEffect(() => {
    const performSignOut = async () => {
      try {
        // Call our server-side sign-out endpoint
        const response = await fetch("/api/auth/sign-out", {
          method: "GET"
        })
        
        if (response.redirected) {
          // If we got a redirect, follow it
          window.location.href = response.url
        } else {
          // Otherwise force redirect to sign-in
          window.location.href = "/auth/sign-in"
        }
      } catch (error) {
        console.error("Error signing out:", error)
        // If there's an error, still try to redirect
        window.location.href = "/auth/sign-in"
      }
    }
    
    performSignOut()
  }, [router])
  
  return (
    <div className="flex h-full items-center justify-center">
      <p>Signing out...</p>
    </div>
  )
} 