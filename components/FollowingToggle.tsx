"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, Users } from "lucide-react"
import { toast } from "sonner"

interface FollowingToggleProps {
  initialValue?: boolean
  onChange?: (value: boolean) => void
}

export function FollowingToggle({ initialValue = false, onChange }: FollowingToggleProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get value from URL or use initial
  const [showFollowing, setShowFollowing] = useState(
    searchParams.get('following') === 'true' || initialValue
  )
  
  // Show toast when stalker mode is enabled/disabled
  useEffect(() => {
    // Only show on client-side changes, not initial load
    if (typeof window !== 'undefined' && document.readyState === 'complete') {
      if (showFollowing) {
        toast("🕵️‍♀️ Stalker Mode Activated", {
          description: "Now showing posts only from users you follow",
          duration: 3000,
        })
      } else if (searchParams.get('following') === 'true') {
        // Only show when turning OFF from ON state
        toast("Stalker Mode Deactivated", {
          description: "Now showing all posts",
          duration: 3000,
        })
      }
    }
  }, [showFollowing, searchParams])
  
  // Update URL when toggle changes
  const handleToggleChange = () => {
    const newValue = !showFollowing
    setShowFollowing(newValue)
    
    // Update URL parameter
    const params = new URLSearchParams(searchParams.toString())
    if (newValue) {
      params.set('following', 'true')
    } else {
      params.delete('following')
    }
    
    // Update URL without scroll
    router.push(`?${params.toString()}`, { scroll: false })
    
    // Call external onChange if provided
    if (onChange) {
      onChange(newValue)
    }
  }
  
  return (
    <div className="flex items-center space-x-2">
      <button 
        type="button"
        onClick={handleToggleChange}
        className="relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none"
        style={{ 
          backgroundColor: '#000000',
          border: `2px solid ${showFollowing ? '#ff6600' : '#ff6600'}`,
          padding: '2px'
        }}
      >
        <span className="sr-only">{showFollowing ? 'Disable' : 'Enable'} stalker mode</span>
        
        <span 
          className="pointer-events-none block h-6 w-6 transform rounded-full shadow-lg transition duration-200 ease-in-out"
          style={{ 
            backgroundColor: '#ff6600',
            transform: showFollowing ? 'translateX(100%)' : 'translateX(0)'
          }}
        />
      </button>

      <label 
        className="flex items-center gap-1.5 cursor-pointer text-sm font-medium"
        onClick={handleToggleChange}
      >
        {showFollowing ? (
          <>
            <Eye size={16} className="text-orange-500" />
            <span className="text-orange-500 font-medium">Stalker Mode</span>
          </>
        ) : (
          <>
            <Users size={16} className="text-orange-500" />
            <span className="text-orange-500">All Posts</span>
          </>
        )}
      </label>
    </div>
  )
} 