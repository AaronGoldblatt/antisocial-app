"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

import { Comment } from "@/database/schema/social"
import { ReactionType } from "@/database/schema/social"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DetailedThumbsUp } from "./DetailedThumbsUp"
import { DetailedThumbsDown } from "./DetailedThumbsDown"
import { MiddleFinger } from "./MiddleFinger"

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
  
  // Refs for the buttons to manage animations
  const dislikeButtonRef = useRef<HTMLButtonElement>(null);
  const superDislikeButtonRef = useRef<HTMLButtonElement>(null);
  const likeButtonRef = useRef<HTMLButtonElement>(null);
  
  // Track which button was just clicked
  const [clickedButton, setClickedButton] = useState<string | null>(null);
  
  // Remove the data-just-clicked attribute after animation completes
  useEffect(() => {
    if (clickedButton) {
      const timer = setTimeout(() => {
        setClickedButton(null);
      }, 1500); // Slightly longer than animation duration
      
      return () => clearTimeout(timer);
    }
  }, [clickedButton]);

  const handleReaction = async (type: string) => {
    if (isLoading) return;
    setIsLoading(true);
    
    // Only set clicked button for animation if this is a new reaction or different from existing
    // Don't animate if removing a reaction (clicking the same reaction type again)
    if (comment.userReaction !== type) {
      setClickedButton(type);
    }
    
    try {
      await onReaction(comment.id, type);
    } finally {
      setIsLoading(false);
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
          ref={dislikeButtonRef}
          variant="outline"
          size="sm"
          className={cn(
            "flex h-7 gap-1 items-center px-2",
            comment.userReaction === ReactionType.DISLIKE && "bg-orange-100 dark:bg-orange-900"
          )}
          onClick={() => handleReaction(ReactionType.DISLIKE)}
          disabled={isLoading}
          data-just-clicked={clickedButton === ReactionType.DISLIKE ? "true" : undefined}
        >
          <DetailedThumbsDown size={16} />
          <span>{comment._count?.reactions.dislike || 0}</span>
        </Button>
        <Button
          ref={superDislikeButtonRef}
          variant="outline"
          size="sm"
          className={cn(
            "flex h-7 gap-1 items-center px-2",
            comment.userReaction === ReactionType.SUPER_DISLIKE && "bg-red-100 dark:bg-red-900"
          )}
          onClick={() => handleReaction(ReactionType.SUPER_DISLIKE)}
          disabled={isLoading}
          data-just-clicked={clickedButton === ReactionType.SUPER_DISLIKE ? "true" : undefined}
        >
          <MiddleFinger size={16} />
          <span>{comment._count?.reactions.superDislike || 0}</span>
        </Button>
        <Button
          ref={likeButtonRef}
          variant="outline"
          size="sm"
          className={cn(
            "flex h-7 gap-1 items-center px-2",
            comment.userReaction === ReactionType.LIKE && "bg-green-100 dark:bg-green-900"
          )}
          onClick={() => handleReaction(ReactionType.LIKE)}
          disabled={isLoading}
          data-just-clicked={clickedButton === ReactionType.LIKE ? "true" : undefined}
        >
          <DetailedThumbsUp size={16} />
          <span>{comment._count?.reactions.like || 0}</span>
        </Button>
      </div>
    </div>
  )
} 