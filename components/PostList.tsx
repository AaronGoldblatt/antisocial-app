"use client"

import { useEffect } from "react"
import { User } from "next-auth"
import { Post, ReactionType } from "@/database/schema/social"
import { PostItem } from "./PostItem"
import { usePostContext, ExtendedPost } from "@/context/PostContext"

interface PostListProps {
  initialPosts: ExtendedPost[]
  onReaction: (postId: string, type: string) => Promise<void>
}

export function PostList({ initialPosts, onReaction }: PostListProps) {
  // Use the post context instead of local state
  const { posts, setPosts, updatePostReaction } = usePostContext()
  
  // Initialize posts when component mounts - but only for non-newly created posts
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