"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect } from "react"
import Image from "next/image"
// Import the banner image directly to ensure proper bundling
import bannerImage from "../public/banner.png"

import { cn } from "@/lib/utils"
import { Home, Users, Search } from "lucide-react"
import { CustomUserButton } from "./CustomUserButton"
import { NotificationBadge } from "./NotificationBadge"

interface HeaderProps {
  user?: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname()
  
  // Debug user object
  useEffect(() => {
    console.log("Header user:", user)
  }, [user])

  // Don't show navigation on auth pages or welcome page
  const isAuthPage = pathname?.startsWith('/auth')
  const isWelcomePage = pathname === '/welcome'
  const showNav = !isAuthPage && !isWelcomePage && !!user
  
  // Handle search icon click - refresh page if already on /search
  const handleSearchClick = (e: React.MouseEvent) => {
    if (pathname === "/search") {
      e.preventDefault()
      // Force hard navigation to reset search state
      window.location.href = "/search"
    }
  }
  
  // Simple banner display using the imported image
  const renderBanner = () => {
    return (
      <Image
        src={bannerImage}
        alt="AntiSocial Banner"
        width={220}
        height={40}
        style={{ maxWidth: "220px", height: "auto" }}
        priority
      />
    )
  }
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur-sm">
      <div style={{ display: "flex", justifyContent: "center", width: "100%", margin: "0 auto" }}>
        <div className="flex h-16 items-center justify-between px-4" style={{ width: "65%", maxWidth: "850px" }}>
          <div className="flex items-center gap-6">
            <Link
              href="/landing"
              className="font-bold text-xl"
            >
              {renderBanner()}
            </Link>

            {showNav && (
              <nav className="flex items-center gap-1 sm:gap-2">
                <Link
                  href="/"
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-md transition-colors hover:bg-muted sm:h-10 sm:w-10",
                    pathname === "/" && "bg-muted"
                  )}
                >
                  <Home className="h-5 w-5" />
                  <span className="sr-only">Home</span>
                </Link>
                <Link
                  href="/search"
                  onClick={handleSearchClick}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-md transition-colors hover:bg-muted sm:h-10 sm:w-10",
                    pathname === "/search" && "bg-muted"
                  )}
                >
                  <Search className="h-5 w-5" />
                  <span className="sr-only">Search</span>
                </Link>
                
                <NotificationBadge pathname={pathname || ""} />
                
                <Link
                  href={`/users/${user?.id}`}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-md transition-colors hover:bg-muted sm:h-10 sm:w-10",
                    pathname === `/users/${user?.id}` && "bg-muted"
                  )}
                >
                  <Users className="h-5 w-5" />
                  <span className="sr-only">Profile</span>
                </Link>
              </nav>
            )}
          </div>
          
          <CustomUserButton />
        </div>
      </div>
    </header>
  )
}
