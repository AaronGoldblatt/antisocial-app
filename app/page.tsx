import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { PostList } from "@/components/PostList"
import { CreatePost } from "@/components/CreatePost"
import { getFeedPosts } from "@/actions/posts"
import { reactToPost } from "@/actions/posts"
import { headers } from "next/headers"

export default async function Home() {
  // Check if user is authenticated
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/auth/sign-in")
  }

  // Get feed posts
  const posts = await getFeedPosts()

  return (
    <div style={{ display: "flex", justifyContent: "center", width: "100%", margin: "0 auto" }}>
      <main className="py-6" style={{ width: "65%", maxWidth: "850px" }}>
        <div className="flex flex-col gap-6" style={{ width: "100%" }}>
          <h1 className="text-3xl font-bold">Your Feed</h1>
          
          <CreatePost />
          
          <div className="flex flex-col gap-4">
            <PostList 
              initialPosts={posts} 
              onReaction={reactToPost} 
            />
          </div>
        </div>
      </main>
    </div>
  )
}
