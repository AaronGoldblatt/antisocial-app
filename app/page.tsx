import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { PostList } from "@/components/PostList"
import { CreatePost } from "@/components/CreatePost"
import { getFeedPosts, getFollowingPosts } from "@/actions/posts"
import { reactToPost } from "@/actions/posts"
import { headers } from "next/headers"
import { SortOption } from "@/components/SortDropdown"
import { FeedControls } from "@/components/FeedControls"

// Valid sort options to validate against
const VALID_SORT_OPTIONS = ["most-disliked", "least-disliked", "newest", "oldest"];

// Define the component with Next.js standard page props
export default async function Home({
  searchParams,
}: {
  searchParams: any;
}) {
  // Check if user is authenticated
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/auth/sign-in")
  }

  // Get sort parameter and sanitize it
  let sortBy: SortOption = "most-disliked"; // Default sort option
  
  try {
    // Handle both development (object) and production (Promise) modes
    const params = searchParams ? (searchParams.then ? await searchParams : searchParams) : {};
    
    // Extract and validate the sort parameter
    if (params.sort && typeof params.sort === 'string') {
      const sortParam = params.sort as string;
      if (VALID_SORT_OPTIONS.includes(sortParam)) {
        sortBy = sortParam as SortOption;
      }
    }
    
    // Extract following parameter
    const showFollowing = params.following === 'true';
    
    // Get posts based on filter - either all feed posts or just following posts
    const posts = showFollowing 
      ? await getFollowingPosts(sortBy) 
      : await getFeedPosts(sortBy);

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
    );
  } catch (error) {
    console.error("Error loading home page:", error);
    // Fallback to default view with default sort
    const posts = await getFeedPosts("most-disliked");
    
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
    );
  }
}
