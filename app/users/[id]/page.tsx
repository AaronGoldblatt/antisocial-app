import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth"
import { PostList } from "@/components/PostList"
import { UserProfile } from "@/components/UserProfile"
import { getUserProfile } from "@/actions/users"
import { getUserPosts, reactToPost } from "@/actions/posts"

interface UserPageProps {
  params: {
    id: string
  }
}

export default async function UserPage({ params }: UserPageProps) {
  const session = await auth()
  
  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/auth/sign-in")
  }

  try {
    const [userProfile, userPosts] = await Promise.all([
      getUserProfile(params.id),
      getUserPosts(params.id)
    ])

    return (
      <main className="container max-w-3xl py-6">
        <div className="flex flex-col gap-8">
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
    )
  } catch (error) {
    console.error("Error fetching user profile:", error)
    notFound()
  }
} 