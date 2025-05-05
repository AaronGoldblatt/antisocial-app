"use client"

import { useEffect } from "react"
import { PostItem } from "./PostItem"
import { usePostContext, ExtendedPost } from "@/context/PostContext"
import { SortOption } from "@/components/SortDropdown"

interface NotificationsPostListProps {
  initialPosts: ExtendedPost[]
  onReaction: (postId: string, type: string) => Promise<void>
}

export function NotificationsPostList({ initialPosts, onReaction }: NotificationsPostListProps) {
  // Use the post context
  const { posts, setPosts, updatePostReaction, setSortOption } = usePostContext()
  
  // Set the sort option to newest and initialize posts
  useEffect(() => {
    // Set sort option first
    setSortOption("newest" as SortOption)
  }, [setSortOption])  // Include setSortOption in dependencies
  
  // Update posts when initialPosts change
  useEffect(() => {
    setPosts(initialPosts)
  }, [initialPosts, setPosts])

  const handleReaction = async (postId: string, type: string) => {
    // Update the UI through context
    updatePostReaction(postId, type)
    
    // Make the actual API call
    await onReaction(postId, type)
  }

  return (
    <div className="flex flex-col gap-4">
      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <h3 className="text-lg font-medium">No posts yet</h3>
          <p className="text-sm text-muted-foreground">Be the first to rant!</p>
        </div>
      ) : (
        posts.map(post => (
          <PostItem key={post.id} post={post} onReaction={handleReaction} />
        ))
      )}
    </div>
  )
} 