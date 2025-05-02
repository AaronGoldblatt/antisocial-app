import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth"
import { PostList } from "@/components/PostList"
import { UserProfile } from "@/components/UserProfile"
import { getUserProfile } from "@/actions/users"
import { getUserPosts, reactToPost } from "@/actions/posts"
import { headers } from "next/headers"
import { SortOption } from "@/components/SortDropdown"
import { UserPageSortControls } from "@/components/UserPageSortControls"

// Define the component with Next.js standard page props
export default async function UserPage({
  params,
  searchParams,
}: {
  params: any;
  searchParams: any;
}) {
  // Explicitly await params (required for production build)
  const routeParams = await params;
  const id = routeParams.id;
  
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/auth/sign-in")
  }

  // Explicitly await searchParams (required for production build)
  const urlParams = await searchParams;
  
  // Get sort parameter from URL or use default
  // Validate that it's a valid sort option
  const validSortOptions = ["most-disliked", "least-disliked", "newest", "oldest"];
  const sortParam = typeof urlParams.sort === 'string' ? urlParams.sort : "";
  const sortBy = validSortOptions.includes(sortParam) ? sortParam as SortOption : "most-disliked";

  try {
    const [userProfile, userPosts] = await Promise.all([
      getUserProfile(id),
      getUserPosts(id, sortBy)
    ])

    return (
      <div style={{ display: "flex", justifyContent: "center", width: "100%", margin: "0 auto" }}>
        <main className="py-6" style={{ width: "65%", maxWidth: "850px" }}>
          <div className="flex flex-col gap-8" style={{ width: "100%" }}>
            <UserProfile 
              user={userProfile.user}
              isFollowing={userProfile.isFollowing}
              isCurrentUser={userProfile.isCurrentUser}
              followerCount={userProfile.followerCount}
              followingCount={userProfile.followingCount}
              postCount={userProfile.postCount}
            />
            
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Rants</h2>
                <UserPageSortControls />
              </div>
              
              <PostList 
                initialPosts={userPosts} 
                onReaction={reactToPost} 
              />
            </div>
          </div>
        </main>
      </div>
    )
  } catch (error) {
    console.error("Error fetching user profile:", error)
    notFound()
  }
} 