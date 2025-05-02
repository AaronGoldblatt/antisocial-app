import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth"
import { PostList } from "@/components/PostList"
import { UserProfile } from "@/components/UserProfile"
import { getUserProfile } from "@/actions/users"
import { getUserPosts, reactToPost } from "@/actions/posts"
import { headers } from "next/headers"
import { SortOption } from "@/components/SortDropdown"
import { UserPageSortControls } from "@/components/UserPageSortControls"

// Valid sort options to validate against
const VALID_SORT_OPTIONS = ["most-disliked", "least-disliked", "newest", "oldest"];

// Define the component with Next.js standard page props
export default async function UserPage({
  params,
  searchParams,
}: {
  params: any;
  searchParams: any;
}) {
  try {
    // Handle both development (object) and production (Promise) modes safely
    const routeParams = params ? (params.then ? await params : params) : {};
    const userId = routeParams.id;
    
    if (!userId) {
      notFound();
    }
    
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    // Redirect to login if not authenticated
    if (!session?.user) {
      redirect("/auth/sign-in")
    }

    // Get sort parameter and sanitize it
    let sortBy: SortOption = "most-disliked"; // Default sort option
    
    // Handle both development (object) and production (Promise) modes
    const urlParams = searchParams ? (searchParams.then ? await searchParams : searchParams) : {};
    
    // Extract and validate the sort parameter
    if (urlParams.sort && typeof urlParams.sort === 'string') {
      const sortParam = urlParams.sort as string;
      if (VALID_SORT_OPTIONS.includes(sortParam)) {
        sortBy = sortParam as SortOption;
      }
    }

    const [userProfile, userPosts] = await Promise.all([
      getUserProfile(userId),
      getUserPosts(userId, sortBy)
    ]);

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
    );
  } catch (error) {
    console.error("Error fetching user profile:", error);
    notFound();
  }
} 