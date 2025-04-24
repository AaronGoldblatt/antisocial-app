"use client"

import { User } from "next-auth"
import { Post } from "@/database/schema/social"
import { PostItem } from "./PostItem"

interface PostListProps {
  initialPosts: Array<Post & {
    user: User
    _count?: {
      comments: number
      reactions: {
        like: number
        dislike: number
        superDislike: number
      }
    }
    userReaction?: string | null
  }>
  onReaction: (postId: string, type: string) => Promise<void>
}

export function PostList({ initialPosts, onReaction }: PostListProps) {
  // We keep the posts state even if not using setPosts yet
  // for potential future use (like real-time updates)
  const posts = initialPosts

  return (
    <div className="flex flex-col gap-4">
      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <h3 className="text-lg font-medium">No posts yet</h3>
          <p className="text-sm text-muted-foreground">Be the first to rant!</p>
        </div>
      ) : (
        posts.map((post) => (
          <PostItem key={post.id} post={post} onReaction={onReaction} />
        ))
      )}
    </div>
  )
} 