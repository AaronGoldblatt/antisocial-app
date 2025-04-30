"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { SortDropdown, SortOption } from "./SortDropdown"
import { FollowingToggle } from "./FollowingToggle"
import { usePostContext } from "@/context/PostContext"

// This component combines all feed controls (sort and filters)
export function FeedControls() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get parameters from URL
  const sortFromUrl = searchParams.get('sort') as SortOption || "most-disliked"
  const followingFromUrl = searchParams.get('following') === 'true'
  
  // Get access to context
  const { sortOption, setSortOption } = usePostContext()
  
  // Initialize sort from URL on mount
  useEffect(() => {
    if (sortFromUrl) {
      setSortOption(sortFromUrl)
    }
  }, [sortFromUrl, setSortOption])
  
  const handleSortChange = (newSort: SortOption) => {
    // Update state in context
    setSortOption(newSort)
    
    // Update URL to reflect the sort (but don't cause a page refresh)
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', newSort)
    router.push(`?${params.toString()}`, { scroll: false })
  }
  
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <FollowingToggle initialValue={followingFromUrl} />
      <SortDropdown
        currentSort={sortOption}
        onSortChange={handleSortChange}
      />
    </div>
  )
} 