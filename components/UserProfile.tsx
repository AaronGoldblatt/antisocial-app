"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { followUser, unfollowUser } from "@/actions/users"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"

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
  const [updatingImage, setUpdatingImage] = useState(false)
  const [showEditOptions, setShowEditOptions] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
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

  const handleProfileImageClick = () => {
    if (isCurrentUser) {
      setShowEditOptions(true)
    }
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleCancel = () => {
    setShowEditOptions(false)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image file size must be less than 5MB')
      return
    }

    try {
      setUpdatingImage(true)
      
      // First read the file to create an image for resizing
      const firstReader = new FileReader()
      firstReader.readAsDataURL(file)
      
      firstReader.onload = async () => {
        try {
          // Create an image element to get dimensions
          const img = document.createElement('img') // Use DOM API instead of Image constructor
          img.src = firstReader.result as string
          
          await new Promise((resolve) => {
            img.onload = resolve
          })
          
          // Resize the image to a reasonable profile picture size
          const MAX_WIDTH = 200
          const MAX_HEIGHT = 200
          
          // Calculate new dimensions while maintaining aspect ratio
          let width = img.width
          let height = img.height
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round(height * (MAX_WIDTH / width))
              width = MAX_WIDTH
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round(width * (MAX_HEIGHT / height))
              height = MAX_HEIGHT
            }
          }
          
          // Create canvas for resizing
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          
          // Draw resized image to canvas
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)
          
          // Get the resized image as base64 with reduced quality
          const resizedBase64 = canvas.toDataURL('image/jpeg', 0.85)
          
          // Update user profile image using Better Auth client
          await authClient.updateUser({
            image: resizedBase64
          })
          
          toast.success('Profile image updated successfully')
          setShowEditOptions(false)
          router.refresh() // Refresh the page to show the updated image
        } catch (error) {
          console.error('Error updating profile image:', error)
          toast.error('Failed to update profile image')
        } finally {
          setUpdatingImage(false)
        }
      }
      
      firstReader.onerror = () => {
        toast.error('Failed to read image file')
        setUpdatingImage(false)
      }
    } catch (error) {
      console.error('Error processing image:', error)
      toast.error('Failed to update profile image')
      setUpdatingImage(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-4 sm:flex-nowrap">
        <div className="relative">
          <div 
            className={`relative h-24 w-24 overflow-hidden rounded-full ${isCurrentUser && !showEditOptions ? 'cursor-pointer hover:opacity-80' : ''}`}
            onClick={!showEditOptions ? handleProfileImageClick : undefined}
            title={isCurrentUser && !showEditOptions ? "Click to update profile image" : undefined}
          >
            {updatingImage && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-orange-500"></div>
              </div>
            )}
            
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
            
            {isCurrentUser && !showEditOptions && (
              <div className="absolute bottom-0 right-0 rounded-full bg-black/60 p-1">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
              </div>
            )}
          </div>
          
          {showEditOptions && isCurrentUser && (
            <div className="absolute left-0 right-0 top-full mt-2 flex flex-col gap-2 rounded-md border border-gray-700 bg-black p-3 shadow-lg">
              <button 
                onClick={handleFileSelect}
                className="flex items-center gap-2 rounded-md bg-orange-800 px-3 py-2 text-sm text-white hover:bg-orange-700"
                disabled={updatingImage}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                Upload Image
              </button>
              <button 
                onClick={handleCancel}
                className="flex items-center gap-2 rounded-md border border-gray-600 px-3 py-2 text-sm text-white hover:bg-gray-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                Cancel
              </button>
            </div>
          )}
        </div>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*"
          onChange={handleFileChange}
        />
        
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{user.name}</h1>
          
          <div className="mt-2 flex gap-4">
            <div>
              <span className="font-bold">{followerCount}</span> {followerCount === 1 ? 'Stalker' : 'Stalkers'}
            </div>
            <div>
              <span className="font-bold">{followingCount}</span> Stalking
            </div>
            <div>
              <span className="font-bold">{postCount}</span> {postCount === 1 ? 'Rant' : 'Rants'}
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