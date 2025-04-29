import { notFound } from "next/navigation"
import Image from "next/image"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/database/db"
import { users } from "@/database/schema/auth"
import { posts } from "@/database/schema/social"
import { eq, desc } from "drizzle-orm"
import { Button } from "@/components/ui/button"
import { User } from "lucide-react"

export default async function UserProfilePage({ params }: { params: { id: string } }) {
  // Get the authenticated user
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session?.user) {
    // You might want to redirect to login instead
    notFound();
  }
  
  const userId = params.id;
  
  try {
    // Fetch the user profile
    const profileUser = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    
    if (!profileUser) {
      notFound();
    }
    
    // Fetch the user's posts
    const userPosts = await db.query.posts.findMany({
      where: eq(posts.userId, userId),
      orderBy: [desc(posts.createdAt)],
      limit: 10,
    });
    
    // Check if viewing own profile
    const isOwnProfile = session.user.id === userId;
    
    return (
      <div style={{ display: "flex", justifyContent: "center", width: "100%", margin: "0 auto" }}>
        <main className="py-6" style={{ width: "65%", maxWidth: "850px" }}>
          <div className="flex flex-col gap-6" style={{ width: "100%" }}>
            {/* User profile header */}
            <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start border-b pb-6">
              <div className="relative h-24 w-24 rounded-full overflow-hidden">
                {profileUser.image ? (
                  <Image
                    src={profileUser.image}
                    alt={profileUser.name || "Profile picture"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-muted">
                    <User className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              <div className="flex flex-col items-center sm:items-start">
                <h1 className="text-2xl font-bold">{profileUser.name}</h1>
                <p className="text-muted-foreground">
                  Member since {new Date(profileUser.createdAt).toLocaleDateString()}
                </p>
                
                {!isOwnProfile && (
                  <div className="mt-4">
                    <Button variant="outline" size="sm">
                      Follow
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            {/* User posts */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Posts</h2>
              
              {userPosts.length > 0 ? (
                <div className="space-y-4">
                  {userPosts.map((post) => (
                    <div key={post.id} className="border rounded-lg p-4">
                      <div className="flex justify-between">
                        <p className="text-sm text-muted-foreground">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="mt-2">{post.content}</p>
                      {post.imageUrl && (
                        <div className="mt-4 relative h-64 rounded-md overflow-hidden">
                          <Image
                            src={post.imageUrl}
                            alt="Post image"
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border rounded-lg">
                  <p className="text-muted-foreground">No posts yet</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Error Loading Profile</h1>
          <p className="text-muted-foreground">
            There was a problem loading this user profile. Please try again later.
          </p>
        </div>
      </div>
    );
  }
}