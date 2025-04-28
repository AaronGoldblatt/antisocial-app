import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { PostItem } from "@/components/PostItem"
import { CreateComment } from "@/components/CreateComment"
import { CommentItem } from "@/components/CommentItem"
import { getPost } from "@/actions/posts"
import { reactToPost } from "@/actions/posts"
import { reactToComment } from "@/actions/comments"
import { headers } from "next/headers"

type PostPageProps = {
  params: {
    id: string
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/auth/sign-in")
  }

  try {
    const post = await getPost(params.id)

    return (
      <div style={{ display: "flex", justifyContent: "center", width: "100%", margin: "0 auto" }}>
        <main className="py-6" style={{ width: "65%", maxWidth: "850px" }}>
          <div className="flex flex-col gap-6" style={{ width: "100%" }}>
            <PostItem post={post} onReaction={reactToPost} />
            
            <div className="border-t pt-6">
              <h2 className="mb-4 text-xl font-bold">Comments</h2>
              
              <div className="mb-6">
                <CreateComment postId={post.id} />
              </div>
              
              <div className="flex flex-col gap-4">
                {post.comments && post.comments.length > 0 ? (
                  post.comments.map((comment: any) => (
                    <CommentItem 
                      key={comment.id} 
                      comment={comment} 
                      onReaction={reactToComment} 
                    />
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed p-6 text-center">
                    <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  } catch (error) {
    console.error("Error fetching post:", error)
    notFound()
  }
} 