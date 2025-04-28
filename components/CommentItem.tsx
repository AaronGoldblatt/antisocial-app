"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ThumbsUp, ThumbsDown, AlertTriangle } from "lucide-react"

import { Comment } from "@/database/schema/social"
import { ReactionType } from "@/database/schema/social"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface CommentItemProps {
  comment: Comment & {
    user: {
      id: string
      name: string | null
      image: string | null
    }
    _count?: {
      reactions: {
        like: number
        dislike: number
        superDislike: number
      }
    }
    userReaction?: string | null
  }
  onReaction: (commentId: string, type: string) => void
}

export function CommentItem({ comment, onReaction }: CommentItemProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formattedTime] = useState(() => 
    formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })
  )

  const handleReaction = async (type: string) => {
    if (isLoading) return
    setIsLoading(true)
    try {
      await onReaction(comment.id, type)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border p-3 shadow-sm">
      <div className="flex items-center gap-2">
        {comment.user.image ? (
          <Image
            src={comment.user.image}
            alt={comment.user.name || "User"}
            width={32}
            height={32}
            className="rounded-full"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs">
            {comment.user.name?.charAt(0) || "U"}
          </div>
        )}
        <div>
          <Link href={`/users/${comment.userId}`} className="text-sm font-medium hover:underline">
            {comment.user.name}
          </Link>
          <p className="text-xs text-muted-foreground">
            {formattedTime}
          </p>
        </div>
      </div>

      {/* Comment content in Comic Sans */}
      <p className="comment-content whitespace-pre-wrap break-words text-sm">{comment.content}</p>

      {comment.imageUrl && (
        <div className="overflow-hidden rounded-md">
          <Image 
            src={comment.imageUrl} 
            alt="Comment image" 
            width={400} 
            height={200} 
            className="h-auto w-full object-cover"
          />
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "flex h-7 gap-1 px-2 text-xs",
            comment.userReaction === ReactionType.DISLIKE && "bg-orange-100 dark:bg-orange-900"
          )}
          onClick={() => handleReaction(ReactionType.DISLIKE)}
          disabled={isLoading}
        >
          <ThumbsDown size={14} />
          <span>{comment._count?.reactions.dislike || 0}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "flex h-7 gap-1 px-2 text-xs",
            comment.userReaction === ReactionType.SUPER_DISLIKE && "bg-red-100 dark:bg-red-900"
          )}
          onClick={() => handleReaction(ReactionType.SUPER_DISLIKE)}
          disabled={isLoading}
        >
          <AlertTriangle size={14} />
          <span>{comment._count?.reactions.superDislike || 0}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "flex h-6 gap-1 px-2 text-xs scale-90",
            comment.userReaction === ReactionType.LIKE && "bg-green-100 dark:bg-green-900"
          )}
          onClick={() => handleReaction(ReactionType.LIKE)}
          disabled={isLoading}
          style={{ transform: "scale(0.85)" }}
        >
          <ThumbsUp size={12} />
          <span>{comment._count?.reactions.like || 0}</span>
        </Button>
      </div>
    </div>
  )
} 