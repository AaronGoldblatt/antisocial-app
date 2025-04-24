"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createPost } from "@/actions/posts"
import { toast } from "sonner"

export function CreatePost() {
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
      setContent("")
      toast.success("Post created!")
      router.refresh()
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
          {isLoading ? "Posting..." : "Rant"}
        </Button>
      </div>
    </form>
  )
} 