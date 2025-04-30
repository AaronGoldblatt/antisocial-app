"use client"

import { useState } from "react"
import { Comment } from "@/database/schema/social"
import { CommentItem } from "./CommentItem"
import { ReactionType } from "@/database/schema/social"

interface Reaction {
  userId: string;
  type: string;
}

interface CommentListProps {
  initialComments: Array<Comment & {
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
    reactions?: Reaction[]
  }>
  onReaction: (commentId: string, reactionType: string) => Promise<void>
}

type ReactionKey = 'like' | 'dislike' | 'superDislike';

export function CommentList({ initialComments, onReaction }: CommentListProps) {
  // Keep track of comments in simple state - simple is best here
  const [comments, setComments] = useState(initialComments);

  // Map reaction types to their keys in the _count object
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

  // Handle reactions by updating the local state directly
  const handleReaction = async (commentId: string, reactionType: string) => {
    // Update locally first for instant feedback
    setComments(prevComments => {
      return prevComments.map(comment => {
        if (comment.id !== commentId) return comment;

        // Deep clone to avoid mutation
        const updatedComment = JSON.parse(JSON.stringify(comment));
        
        // Ensure reactions array exists
        if (!updatedComment.reactions) {
          updatedComment.reactions = [];
        }
        
        // Initialize _count if it doesn't exist
        if (!updatedComment._count) {
          updatedComment._count = {
            reactions: {
              like: 0,
              dislike: 0,
              superDislike: 0
            }
          };
        }
        
        // Get the keys for the reaction counts
        const reactionKey = getReactionKey(reactionType);
        const prevReactionKey = updatedComment.userReaction ? getReactionKey(updatedComment.userReaction) : null;
        
        // Find if the current user already reacted
        const currentUserReaction = updatedComment.reactions.find(
          (reaction: Reaction) => reaction.userId === updatedComment.user.id
        );

        if (currentUserReaction) {
          // If the reaction type is the same, remove it
          if (currentUserReaction.type === reactionType) {
            updatedComment.reactions = updatedComment.reactions.filter(
              (reaction: Reaction) => !(reaction.userId === updatedComment.user.id && reaction.type === reactionType)
            );
            updatedComment.userReaction = null;
            
            // Decrement the reaction count
            updatedComment._count.reactions[reactionKey] = Math.max(0, (updatedComment._count.reactions[reactionKey] || 1) - 1);
          } else {
            // If the reaction type is different, update it
            currentUserReaction.type = reactionType;
            updatedComment.userReaction = reactionType;
            
            // Increment the new reaction count
            updatedComment._count.reactions[reactionKey] = (updatedComment._count.reactions[reactionKey] || 0) + 1;
            
            // Decrement the previous reaction count if it exists
            if (prevReactionKey && prevReactionKey !== reactionKey) {
              updatedComment._count.reactions[prevReactionKey] = Math.max(0, (updatedComment._count.reactions[prevReactionKey] || 1) - 1);
            }
          }
        } else {
          // Add new reaction
          updatedComment.reactions.push({
            userId: updatedComment.user.id,
            type: reactionType,
          });
          updatedComment.userReaction = reactionType;
          
          // Increment the reaction count
          updatedComment._count.reactions[reactionKey] = (updatedComment._count.reactions[reactionKey] || 0) + 1;
        }

        return updatedComment;
      });
    });
    
    // Make the actual API call
    await onReaction(commentId, reactionType);
  };

  return (
    <div className="flex flex-col gap-4">
      {comments.map((comment) => (
        <CommentItem 
          key={comment.id} 
          comment={comment} 
          onReaction={handleReaction} 
        />
      ))}
    </div>
  );
} 