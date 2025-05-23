"use client"

import { useState } from "react"
import { createPost } from "@/actions/posts"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { usePostContext } from "@/context/PostContext"

export function WelcomeCreatePost() {
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { addPost } = usePostContext()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim()) {
      toast.error("Post content cannot be empty")
      return
    }
    
    setIsLoading(true)
    try {
      const newPost = await createPost({ content })
      
      // Set cookie to indicate user has posted this session
      document.cookie = "has_posted_this_session=true; path=/;"
      
      // Add the new post to the context so it appears at the top of the feed
      if (newPost) {
        addPost(newPost)
      }
      
      setContent("")
      toast.success("Post created! You may now use the site.")
      
      // Force a complete page refresh rather than client navigation
      // This ensures the layout re-renders with the new session state
      window.location.href = "/"
    } catch (error) {
      toast.error("Failed to create post")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleSkip = () => {
    // Set cookie to indicate user has posted this session (even though they haven't)
    document.cookie = "has_posted_this_session=true; path=/;"
    
    toast.info("Skipping the rant... Just this once!", {
      description: "You can browse freely, but we expect a rant next time!"
    })
    
    // Force a complete page refresh rather than client navigation
    // This ensures the layout re-renders with the new session state
    window.location.href = "/"
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-lg border p-4 shadow-sm">
        <Textarea 
          placeholder="What's on your mind? Rant away!" 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="resize-none"
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading || !content.trim()}>
            {isLoading ? "Posting..." : "Rant to Continue"}
          </Button>
        </div>
      </form>
      
      <div className="flex justify-center mt-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleSkip}
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          I&apos;m a shy loser, just let me in pwease 🥺
        </Button>
      </div>
    </div>
  )
} 