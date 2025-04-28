import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getFollowingPosts } from "@/actions/posts"
import { PostList } from "@/components/PostList"
import { reactToPost } from "@/actions/posts"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function NotificationsPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/auth/sign-in")
  }

  // Fetch posts from users the current user is following
  const followingPosts = await getFollowingPosts();

  return (
    <div style={{ display: "flex", justifyContent: "center", width: "100%", margin: "0 auto" }}>
      <main className="py-6" style={{ width: "65%", maxWidth: "850px" }}>
        <div className="flex flex-col gap-6" style={{ width: "100%" }}>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Notifications</h1>
            <Link href="/">
              <Button variant="outline">View Regular Feed</Button>
            </Link>
          </div>
          
          {followingPosts.length > 0 ? (
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-medium">New Posts from Users You Stalk</h2>
              <PostList 
                initialPosts={followingPosts} 
                onReaction={reactToPost} 
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
              <h3 className="text-2xl font-medium mb-2">No Posts from Stalked Users</h3>
              <p className="text-muted-foreground mb-6">
                You're not stalking anyone yet or they haven't posted anything.
              </p>
              <Link href="/search">
                <Button>Find Users to Stalk</Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 