"use client"

import { useRouter, usePathname } from "next/navigation"
import { UserButton } from "@daveyplate/better-auth-ui"
import { useEffect } from "react"

export function CustomUserButton() {
  const router = useRouter()
  const pathname = usePathname()
  
  // Clear cookie if we're at the sign-out page
  useEffect(() => {
    if (pathname === "/auth/sign-out") {
      clearCookie()
    }
  }, [pathname])
  
  // Clear cookie if user explicitly clicks sign out
  useEffect(() => {
    const handleLogout = () => {
      const logoutBtn = document.querySelector('[aria-label="Sign out"]')
      
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          clearCookie()
        })
      }
    }
    
    // Wait for the DOM to fully load and potentially have the logout button
    setTimeout(handleLogout, 500)
    
    return () => {
      const logoutBtn = document.querySelector('[aria-label="Sign out"]')
      if (logoutBtn) {
        logoutBtn.removeEventListener('click', clearCookie)
      }
    }
  }, [])
  
  // Helper function to clear cookie
  const clearCookie = () => {
    document.cookie = "has_posted_this_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;"
    console.log("Session cookie cleared")
  }

  // We'll just use the default UserButton since we can't customize its logout behavior directly
  return <UserButton />
} 