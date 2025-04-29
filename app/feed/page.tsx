import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getFeedPosts } from "@/actions/posts"
import { reactToPost } from "@/actions/posts"
import { PostList } from "@/components/PostList"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function FeedPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/auth/sign-in")
  }

  // Fetch feed posts
  const posts = await getFeedPosts();

  return (
    <div style={{ display: "flex", justifyContent: "center", width: "100%", margin: "0 auto" }}>
      <main className="py-6" style={{ width: "65%", maxWidth: "850px" }}>
        <div className="flex flex-col gap-6" style={{ width: "100%" }}>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Your Feed</h1>
            <Link href="/notifications">
              <Button variant="outline">View Notifications</Button>
            </Link>
          </div>
          
          {posts.length > 0 ? (
            <PostList 
              initialPosts={posts} 
              onReaction={reactToPost} 
            />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
              <h3 className="text-2xl font-medium mb-2">No Posts Yet</h3>
              <p className="text-muted-foreground mb-6">
                Looks like people aren&apos;t negative enough yet.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 