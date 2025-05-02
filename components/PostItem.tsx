"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

import { Post } from "@/database/schema/social"
import { ReactionType } from "@/database/schema/social"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DetailedThumbsUp } from "./DetailedThumbsUp"
import { DetailedThumbsDown } from "./DetailedThumbsDown"
import { MiddleFinger } from "./MiddleFinger"
import { ExtendedPost } from "@/context/PostContext"

interface PostItemProps {
  post: ExtendedPost
  onReaction: (postId: string, type: string) => void
}

export function PostItem({ post, onReaction }: PostItemProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formattedTime] = useState(() => 
    formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
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
    if (post.userReaction !== type) {
      setClickedButton(type);
    }
    
    try {
      await onReaction(post.id, type);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={cn(
      "flex flex-col gap-3 rounded-lg border p-4 shadow-sm",
      post.isNewlyCreated && "border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30 animate-pulse-gentle"
    )}>
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
          ref={dislikeButtonRef}
          variant="outline"
          size="default"
          className={cn(
            "flex h-9 gap-2 items-center px-3",
            post.userReaction === ReactionType.DISLIKE && "bg-orange-100 dark:bg-orange-900"
          )}
          onClick={() => handleReaction(ReactionType.DISLIKE)}
          disabled={isLoading}
          data-just-clicked={clickedButton === ReactionType.DISLIKE ? "true" : undefined}
        >
          <DetailedThumbsDown size={22} />
          <span>{post._count?.reactions.dislike || 0}</span>
        </Button>
        <Button
          ref={superDislikeButtonRef}
          variant="outline"
          size="default"
          className={cn(
            "flex h-9 gap-2 items-center px-3",
            post.userReaction === ReactionType.SUPER_DISLIKE && "bg-red-100 dark:bg-red-900"
          )}
          onClick={() => handleReaction(ReactionType.SUPER_DISLIKE)}
          disabled={isLoading}
          data-just-clicked={clickedButton === ReactionType.SUPER_DISLIKE ? "true" : undefined}
        >
          <MiddleFinger size={22} />
          <span>{post._count?.reactions.superDislike || 0}</span>
        </Button>
        <Button
          ref={likeButtonRef}
          variant="outline"
          size="default"
          className={cn(
            "flex h-9 gap-2 items-center px-3",
            post.userReaction === ReactionType.LIKE && "bg-green-100 dark:bg-green-900"
          )}
          onClick={() => handleReaction(ReactionType.LIKE)}
          disabled={isLoading}
          data-just-clicked={clickedButton === ReactionType.LIKE ? "true" : undefined}
        >
          <DetailedThumbsUp size={20} />
          <span>{post._count?.reactions.like || 0}</span>
        </Button>
        <Link href={`/posts/${post.id}`} passHref>
          <Button variant="ghost" size="sm">
            {post._count?.comments || 0} {(post._count?.comments || 0) === 1 ? 'Comment' : 'Comments'}
          </Button>
        </Link>
      </div>
    </div>
  )
} 