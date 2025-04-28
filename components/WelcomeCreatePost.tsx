"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { createPost } from "@/actions/posts"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export function WelcomeCreatePost() {
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim()) {
      toast.error("Post content cannot be empty")
      return
    }
    
    setIsLoading(true)
    try {
      await createPost({ content })
      
      // Set cookie to indicate user has posted this session
      document.cookie = "has_posted_this_session=true; path=/;"
      
      setContent("")
      toast.success("Post created! You may now use the site.")
      
      // Redirect to home page
      router.push("/")
    } catch (error) {
      toast.error("Failed to create post")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
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
  )
} 