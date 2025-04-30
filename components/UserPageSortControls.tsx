"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { SortDropdown, SortOption } from "./SortDropdown"
import { usePostContext } from "@/context/PostContext"

// Specialized version of sort controls for the user page
export function UserPageSortControls() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  
  // Get sort from URL or use default
  const sortFromUrl = searchParams.get('sort') as SortOption || "most-disliked"
  
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
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }
  
  return (
    <div className="flex justify-end">
      <SortDropdown
        currentSort={sortOption}
        onSortChange={handleSortChange}
      />
    </div>
  )
} 