"use client"

import { useState } from "react"
import Image from "next/image"
import { followUser, unfollowUser } from "@/actions/users"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface UserProfileProps {
  user: {
    id: string
    name: string | null
    image: string | null
  }
  isFollowing: boolean
  isCurrentUser: boolean
  followerCount: number
  followingCount: number
  postCount: number
}

export function UserProfile({
  user,
  isFollowing,
  isCurrentUser,
  followerCount,
  followingCount,
  postCount
}: UserProfileProps) {
  const [following, setFollowing] = useState(isFollowing)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleFollowToggle = async () => {
    if (isLoading) return
    
    setIsLoading(true)
    try {
      if (following) {
        await unfollowUser(user.id)
        toast.success(`Unstalked ${user.name}`)
      } else {
        await followUser(user.id)
        toast.success(`Now stalking ${user.name}`)
      }
      setFollowing(!following)
      router.refresh()
    } catch (error) {
      toast.error("Failed to update following status")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-4 sm:flex-nowrap">
        <div className="relative h-24 w-24 overflow-hidden rounded-full">
          {user.image ? (
            <Image 
              src={user.image} 
              alt={user.name || "Profile"} 
              fill 
              className="object-cover" 
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted text-2xl font-bold">
              {user.name?.charAt(0) || "?"}
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{user.name}</h1>
          
          <div className="mt-2 flex gap-4">
            <div>
              <span className="font-bold">{followerCount}</span> Stalkers
            </div>
            <div>
              <span className="font-bold">{followingCount}</span> Stalking
            </div>
            <div>
              <span className="font-bold">{postCount}</span> Rants
            </div>
          </div>
        </div>
        
        {!isCurrentUser && (
          <Button
            onClick={handleFollowToggle}
            disabled={isLoading}
            variant={following ? "outline" : "default"}
          >
            {isLoading 
              ? "Loading..." 
              : following 
                ? "Unstalk" 
                : "Stalk"}
          </Button>
        )}
      </div>
    </div>
  )
} 