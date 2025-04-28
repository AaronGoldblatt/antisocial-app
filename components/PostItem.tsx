"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

import { Post } from "@/database/schema/social"
import { ReactionType } from "@/database/schema/social"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown, AlertTriangle } from "lucide-react"

interface PostItemProps {
  post: Post & {
    user: {
      id: string;
      name?: string | null;
      image?: string | null;
    }
    _count?: {
      comments: number
      reactions: {
        like: number
        dislike: number
        superDislike: number
      }
    }
    userReaction?: string | null
  }
  onReaction: (postId: string, type: string) => void
}

export function PostItem({ post, onReaction }: PostItemProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formattedTime] = useState(() => 
    formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
  )

  const handleReaction = async (type: string) => {
    if (isLoading) return
    setIsLoading(true)
    try {
      await onReaction(post.id, type)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4 shadow-sm">
      <div className="flex items-center gap-3">
        {post.user.image ? (
          <Image
            src={post.user.image}
            alt={post.user.name || "User"}
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            {post.user.name?.charAt(0) || "U"}
          </div>
        )}
        <div>
          <Link href={`/users/${post.userId}`} className="font-medium hover:underline">
            {post.user.name}
          </Link>
          <p className="text-xs text-muted-foreground">
            {formattedTime}
          </p>
        </div>
      </div>

      {/* Post content in Comic Sans */}
      <p className="post-content whitespace-pre-wrap break-words">{post.content}</p>

      {post.imageUrl && (
        <div className="overflow-hidden rounded-md">
          <Image 
            src={post.imageUrl} 
            alt="Post image" 
            width={500} 
            height={300} 
            className="h-auto w-full object-cover"
          />
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "flex gap-1",
            post.userReaction === ReactionType.DISLIKE && "bg-orange-100 dark:bg-orange-900"
          )}
          onClick={() => handleReaction(ReactionType.DISLIKE)}
          disabled={isLoading}
        >
          <ThumbsDown size={16} />
          <span>{post._count?.reactions.dislike || 0}</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "flex gap-1",
            post.userReaction === ReactionType.SUPER_DISLIKE && "bg-red-100 dark:bg-red-900"
          )}
          onClick={() => handleReaction(ReactionType.SUPER_DISLIKE)}
          disabled={isLoading}
        >
          <AlertTriangle size={16} />
          <span>{post._count?.reactions.superDislike || 0}</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "flex gap-1 scale-90",
            post.userReaction === ReactionType.LIKE && "bg-green-100 dark:bg-green-900"
          )}
          onClick={() => handleReaction(ReactionType.LIKE)}
          disabled={isLoading}
          style={{ transform: "scale(0.85)" }}
        >
          <ThumbsUp size={14} />
          <span>{post._count?.reactions.like || 0}</span>
        </Button>
        <Link href={`/posts/${post.id}`} passHref>
          <Button variant="ghost" size="sm">
            {post._count?.comments || 0} Comments
          </Button>
        </Link>
      </div>
    </div>
  )
} 