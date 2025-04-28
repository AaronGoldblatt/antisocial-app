"use client"

import { useState } from "react"
import { User } from "next-auth"
import { Post, ReactionType } from "@/database/schema/social"
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

type ReactionKey = 'like' | 'dislike' | 'superDislike';

export function PostList({ initialPosts, onReaction }: PostListProps) {
  // Just use a simple state array - more reliable
  const [posts, setPosts] = useState(initialPosts);
  
  // Helper function to map reaction type to the key used in _count
  const getReactionKey = (type: string): ReactionKey => {
    switch (type) {
      case ReactionType.LIKE:
        return 'like';
      case ReactionType.DISLIKE:
        return 'dislike';
      case ReactionType.SUPER_DISLIKE:
        return 'superDislike';
      default:
        return 'like';
    }
  };

  const handleReaction = async (postId: string, type: string) => {
    // Update the UI first for immediate feedback
    setPosts(prev => {
      return prev.map(post => {
        if (post.id !== postId) return post;
        
        // Deep clone to avoid mutations
        const updatedPost = JSON.parse(JSON.stringify(post));
        
        // Get the reaction keys
        const reactionKey = getReactionKey(type);
        const prevReactionKey = post.userReaction ? getReactionKey(post.userReaction) : null;
        
        // Initialize _count if it doesn't exist
        if (!updatedPost._count) {
          updatedPost._count = {
            comments: 0,
            reactions: {
              like: 0,
              dislike: 0,
              superDislike: 0
            }
          };
        }
        
        // Toggle userReaction state
        updatedPost.userReaction = post.userReaction === type ? null : type;
        
        // Update the reaction counts
        if (updatedPost._count?.reactions) {
          // If removing existing reaction
          if (post.userReaction === type) {
            updatedPost._count.reactions[reactionKey] = Math.max(0, (post._count?.reactions[reactionKey] || 1) - 1);
          } 
          // If adding new reaction
          else {
            updatedPost._count.reactions[reactionKey] = (post._count?.reactions[reactionKey] || 0) + 1;
            
            // If replacing a different reaction, decrement the previous one
            if (prevReactionKey && prevReactionKey !== reactionKey) {
              updatedPost._count.reactions[prevReactionKey] = Math.max(
                0,
                (post._count?.reactions[prevReactionKey] || 1) - 1
              );
            }
          }
        }
        
        return updatedPost;
      });
    });
    
    // Make the actual API call
    await onReaction(postId, type);
  };

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
  );
} 