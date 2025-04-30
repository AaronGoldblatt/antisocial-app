import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { PostList } from "@/components/PostList"
import { CreatePost } from "@/components/CreatePost"
import { getFeedPosts, getFollowingPosts } from "@/actions/posts"
import { reactToPost } from "@/actions/posts"
import { cookies } from "next/headers"
import { SortOption } from "@/components/SortDropdown"
import { FeedControls } from "@/components/FeedControls"

// Define default values
const DEFAULT_SORT: SortOption = "most-disliked";

// Page component
export default async function Home({
  params = {},
  searchParams,
}: {
  params?: {};
  searchParams: {
    sort?: string;
    following?: string;
  };
}) {
  // Create a minimal headers object with just the cookie
  // This satisfies the BetterAuth requirement
  const cookieHeader = cookies().toString();
  const session = await auth.api.getSession({
    headers: {
      cookie: cookieHeader
    } as any
  });
  
  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/auth/sign-in")
  }

  // Get parameters safely with explicit destructuring
  const { sort: sortParam = DEFAULT_SORT, following: followingParam = 'false' } = searchParams;
  
  // Set typing and defaults
  const sort = sortParam as SortOption;
  const following = followingParam === 'true';

  // Get posts based on filter
  const posts = following 
    ? await getFollowingPosts(sort) 
    : await getFeedPosts(sort)

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
