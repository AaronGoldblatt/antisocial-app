"use client"

import { useState } from "react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"

export type SortOption = 
  | "most-disliked" 
  | "least-disliked" 
  | "newest" 
  | "oldest"

interface SortDropdownProps {
  currentSort: SortOption
  onSortChange: (sort: SortOption) => void
}

export function SortDropdown({ currentSort, onSortChange }: SortDropdownProps) {
  const sortOptions = [
    { value: "most-disliked", label: "Most Disliked" },
    { value: "least-disliked", label: "Least Disliked" },
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
  ]

  // Get the label for the current sort option
  const currentLabel = sortOptions.find(option => option.value === currentSort)?.label || "Sort"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-[180px] justify-between">
          <span>{currentLabel}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {sortOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            className={option.value === currentSort ? "bg-muted font-medium" : ""}
            onClick={() => onSortChange(option.value as SortOption)}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 