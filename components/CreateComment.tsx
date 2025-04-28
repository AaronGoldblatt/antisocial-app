"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createComment } from "@/actions/comments"
import { toast } from "sonner"

interface CreateCommentProps {
  postId: string
}

export function CreateComment({ postId }: CreateCommentProps) {
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!content.trim()) {
      toast.error("Comment cannot be empty")
      return
    }
    
    setIsLoading(true)
    try {
      await createComment({ postId, content })
      setContent("")
      toast.success("Comment added!")
      router.refresh()
    } catch (error) {
      toast.error("Failed to add comment")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <Textarea 
        placeholder="Write a comment..." 
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={2}
        className="resize-none text-sm"
      />
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={isLoading || !content.trim()}>
          {isLoading ? "Posting..." : "Comment"}
        </Button>
      </div>
    </form>
  )
} 