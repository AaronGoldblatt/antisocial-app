"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User } from "lucia"

import { cn } from "@/lib/utils"
import { UserButton } from "@daveyplate/better-auth-ui"
import { Home, Users, Heart, Bell, Search } from "lucide-react"

interface HeaderProps {
  user?: User | null
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="hidden font-bold text-xl sm:inline-block"
          >
            AntiSocial
          </Link>
          
          {user && (
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
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-md transition-colors hover:bg-muted sm:h-10 sm:w-10",
                  pathname === "/search" && "bg-muted"
                )}
              >
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Link>
              <Link
                href="/notifications"
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-md transition-colors hover:bg-muted sm:h-10 sm:w-10",
                  pathname === "/notifications" && "bg-muted"
                )}
              >
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Link>
              <Link
                href={`/users/${user.id}`}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-md transition-colors hover:bg-muted sm:h-10 sm:w-10",
                  pathname === `/users/${user.id}` && "bg-muted"
                )}
              >
                <Users className="h-5 w-5" />
                <span className="sr-only">Profile</span>
              </Link>
            </nav>
          )}
        </div>
        
        <UserButton />
      </div>
    </header>
  )
}
