import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth"
import { PostList } from "@/components/PostList"
import { UserProfile } from "@/components/UserProfile"
import { getUserProfile } from "@/actions/users"
import { getUserPosts, reactToPost } from "@/actions/posts"
import { headers } from "next/headers"

type UserPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function UserPage({ params }: UserPageProps) {
  const { id } = await params;
  
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/auth/sign-in")
  }

  try {
    const [userProfile, userPosts] = await Promise.all([
      getUserProfile(id),
      getUserPosts(id)
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
              <h2 className="mb-4 text-xl font-bold">Rants</h2>
              
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