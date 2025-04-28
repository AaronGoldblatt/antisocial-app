"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOutIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function CustomLogoutButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      // Clear our session cookies first
      document.cookie = "has_posted_this_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;"
      
      // Redirect to sign-out page (which our middleware will redirect to sign-in)
      router.push("/auth/sign-out")
      
      toast.success("Logged out successfully")
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("Failed to log out")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={handleLogout}
      disabled={isLoading}
      aria-label="Log out"
    >
      <LogOutIcon className="h-5 w-5" />
    </Button>
  )
} 