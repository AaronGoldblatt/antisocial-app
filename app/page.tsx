import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { PostList } from "@/components/PostList"
import { CreatePost } from "@/components/CreatePost"
import { getFeedPosts, getFollowingPosts } from "@/actions/posts"
import { reactToPost } from "@/actions/posts"
import { headers } from "next/headers"
import { SortOption } from "@/components/SortDropdown"
import { FeedControls } from "@/components/FeedControls"

type HomeProps = {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function Home({ searchParams }: HomeProps) {
  // Check if user is authenticated
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/auth/sign-in")
  }

  // Get sort parameter from URL or use default
  const sortBy = (searchParams.sort as SortOption) || "most-disliked"
  
  // Get following filter from URL
  const showFollowing = searchParams.following === 'true'

  // Get posts based on filter - either all feed posts or just following posts
  const posts = showFollowing 
    ? await getFollowingPosts(sortBy) 
    : await getFeedPosts(sortBy)

  return (
    <div style={{ display: "flex", justifyContent: "center", width: "100%", margin: "0 auto" }}>
      <main className="py-6" style={{ width: "65%", maxWidth: "850px" }}>
        <div className="flex flex-col gap-6" style={{ width: "100%" }}>
          <h1 className="text-3xl font-bold">Your Feed</h1>
          
          <CreatePost />
          
          <FeedControls />
          
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
