"use client"

import { createContext, useContext, useState, ReactNode, useCallback, useMemo } from "react"
import { Post, ReactionType } from "@/database/schema/social"
import { User } from "next-auth"
import { SortOption } from "@/components/SortDropdown"

// Define the shape of a post with all its properties
export type ExtendedPost = Post & {
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
  isNewlyCreated?: boolean
}

// Define the context type
interface PostContextType {
  posts: ExtendedPost[]
  setPosts: (posts: ExtendedPost[]) => void
  addPost: (post: ExtendedPost) => void
  updatePostReaction: (postId: string, type: string) => void
  sortOption: SortOption
  setSortOption: (option: SortOption) => void
}

// Create the context with a default value
const PostContext = createContext<PostContextType | undefined>(undefined)

// Provider component
export function PostProvider({ children, initialPosts = [] }: { children: ReactNode, initialPosts?: ExtendedPost[] }) {
  const [posts, setPosts] = useState<ExtendedPost[]>(initialPosts)
  const [newPosts, setNewPosts] = useState<ExtendedPost[]>([])
  const [sortOption, setSortOption] = useState<SortOption>("most-disliked")

  // Add a new post to the beginning of the list and mark it as newly created
  const addPost = (post: ExtendedPost) => {
    const postWithFlag = {
      ...post,
      isNewlyCreated: true
    }
    setNewPosts(current => [postWithFlag, ...current])
  }

  // Function to sort posts based on the selected option
  const sortPosts = useCallback((postsToSort: ExtendedPost[]): ExtendedPost[] => {
    if (!postsToSort.length) return postsToSort

    const sorted = [...postsToSort]
    
    switch (sortOption) {
      case "most-disliked":
        // Sort by total dislikes (dislike count + 2*super_dislike count)
        return sorted.sort((a, b) => {
          const aDislikeScore = (a._count?.reactions.dislike || 0) + 2 * (a._count?.reactions.superDislike || 0)
          const bDislikeScore = (b._count?.reactions.dislike || 0) + 2 * (b._count?.reactions.superDislike || 0)
          return bDislikeScore - aDislikeScore
        })
      
      case "least-disliked":
        // Sort by inverse of total dislikes
        return sorted.sort((a, b) => {
          const aDislikeScore = (a._count?.reactions.dislike || 0) + 2 * (a._count?.reactions.superDislike || 0)
          const bDislikeScore = (b._count?.reactions.dislike || 0) + 2 * (b._count?.reactions.superDislike || 0)
          return aDislikeScore - bDislikeScore
        })
      
      case "newest":
        // Sort by creation date (newest first)
        return sorted.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      
      case "oldest":
        // Sort by creation date (oldest first)
        return sorted.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
      
      default:
        return sorted
    }
  }, [sortOption])

  // Apply sorting to regular posts
  const sortedPosts = useMemo(() => 
    sortPosts(posts), [posts, sortPosts]
  )

  // Get the combined posts (new posts at the top, followed by sorted posts)
  const combinedPosts = useMemo(() => [
    ...newPosts, 
    ...sortedPosts.filter(post => !newPosts.some(newPost => newPost.id === post.id))
  ], [newPosts, sortedPosts])

  // Update a post's reaction
  const updatePostReaction = (postId: string, type: string) => {
    // Function to update posts in a list
    const updatePostsInList = (postsList: ExtendedPost[]) => {
      return postsList.map(post => {
        if (post.id !== postId) return post
        
        // Deep clone to avoid mutations
        const updatedPost = JSON.parse(JSON.stringify(post))
        
        // Get the reaction keys
        const reactionKey = getReactionKey(type)
        const prevReactionKey = post.userReaction ? getReactionKey(post.userReaction) : null
        
        // Initialize _count if it doesn't exist
        if (!updatedPost._count) {
          updatedPost._count = {
            comments: 0,
            reactions: {
              like: 0,
              dislike: 0,
              superDislike: 0
            }
          }
        }
        
        // Toggle userReaction state
        updatedPost.userReaction = post.userReaction === type ? null : type
        
        // Update the reaction counts
        if (updatedPost._count?.reactions) {
          // If removing existing reaction
          if (post.userReaction === type) {
            updatedPost._count.reactions[reactionKey] = Math.max(0, (post._count?.reactions[reactionKey] || 1) - 1)
          } 
          // If adding new reaction
          else {
            updatedPost._count.reactions[reactionKey] = (post._count?.reactions[reactionKey] || 0) + 1
            
            // If replacing a different reaction, decrement the previous one
            if (prevReactionKey && prevReactionKey !== reactionKey) {
              updatedPost._count.reactions[prevReactionKey] = Math.max(
                0,
                (post._count?.reactions[prevReactionKey] || 1) - 1
              )
            }
          }
        }
        
        // Preserve the isNewlyCreated flag
        updatedPost.isNewlyCreated = post.isNewlyCreated
        
        return updatedPost
      })
    }
    
    // Update both lists
    setPosts(currentPosts => updatePostsInList(currentPosts))
    setNewPosts(currentNewPosts => updatePostsInList(currentNewPosts))
  }

  return (
    <PostContext.Provider value={{ 
      posts: combinedPosts, 
      setPosts, 
      addPost, 
      updatePostReaction,
      sortOption,
      setSortOption
    }}>
      {children}
    </PostContext.Provider>
  )
}

// Helper function to map reaction type to the key used in _count
function getReactionKey(type: string): 'like' | 'dislike' | 'superDislike' {
  switch (type) {
    case ReactionType.LIKE:
      return 'like'
    case ReactionType.DISLIKE:
      return 'dislike'
    case ReactionType.SUPER_DISLIKE:
      return 'superDislike'
    default:
      return 'like'
  }
}

// Custom hook to use the post context
export function usePostContext() {
  const context = useContext(PostContext)
  if (!context) {
    throw new Error("usePostContext must be used within a PostProvider")
  }
  return context
} 