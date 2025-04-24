import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { PostList } from "@/components/PostList"
import { CreatePost } from "@/components/CreatePost"
import { getFeedPosts } from "@/actions/posts"
import { reactToPost } from "@/actions/posts"

export default async function Home() {
  const session = await auth()
  
  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/auth/sign-in")
  }

  const posts = await getFeedPosts()

  return (
    <main className="container max-w-2xl py-6">
      <div className="flex flex-col gap-6">
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
  )
}
