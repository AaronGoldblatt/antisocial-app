"use client"

import { useState } from "react"
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
  const [posts, setPosts] = useState(initialPosts)

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