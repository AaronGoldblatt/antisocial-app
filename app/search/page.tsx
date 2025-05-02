"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { search } from "@/actions/search"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Search, User, FileText } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// Define types for the data structures
interface PostUser {
  id: string
  image: string | null
  name: string
  createdAt: Date
  updatedAt: Date
  email: string
  emailVerified: boolean
}

interface Post {
  id: string
  content: string
  imageUrl: string | null
  createdAt: Date
  updatedAt: Date
  userId: string
  user: PostUser
}

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [posts, setPosts] = useState<Post[]>([])
  const [users, setUsers] = useState<PostUser[]>([])
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [hasSearched, setHasSearched] = useState(false)

  // Search as you type
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim()) {
        setLoading(true)
        setError("")
        setHasSearched(true)
        
        try {
          const result = await search({ query })
          
          if (result.error) {
            setError(result.error)
          } else {
            setPosts(result.posts || [])
            setUsers(result.users || [])
          }
        } catch (err) {
          console.error("Search error:", err)
          setError("Failed to perform search")
        } finally {
          setLoading(false)
        }
      } else {
        // Clear results when query is empty
        setPosts([])
        setUsers([])
        setHasSearched(false)
      }
    }, 300) // 300ms delay to avoid excessive API calls

    return () => clearTimeout(delayDebounceFn)
  }, [query])

  return (
    <div style={{ display: "flex", justifyContent: "center", width: "100%", margin: "0 auto" }}>
      <main className="py-6" style={{ width: "65%", maxWidth: "850px" }}>
        <div className="flex flex-col gap-6" style={{ width: "100%" }}>
          <h1 className="text-3xl font-bold">Search</h1>
          
          <div className="flex w-full">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for posts or users..."
              className="flex-1"
            />
            {loading && <Loader2 className="h-5 w-5 animate-spin ml-2 self-center" />}
          </div>
          
          {error && (
            <div className="text-red-500">{error}</div>
          )}
          
          {(posts.length > 0 || users.length > 0) && (
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 bg-[#111111] border border-[#333333]">
                <TabsTrigger 
                  value="all" 
                  className="relative group cursor-pointer transition-all hover:bg-[#222222] data-[state=active]:bg-[#222222] data-[state=active]:text-[#FF9900] data-[state=active]:font-bold"
                >
                  All Results
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-[#FF6600] transition-all duration-300 group-hover:w-4/5 group-data-[state=active]:w-full group-data-[state=active]:h-[3px] group-data-[state=active]:bg-[#FF9900]"></span>
                </TabsTrigger>
                <TabsTrigger 
                  value="posts" 
                  className="relative group cursor-pointer transition-all hover:bg-[#222222] data-[state=active]:bg-[#222222] data-[state=active]:text-[#FF9900] data-[state=active]:font-bold"
                >
                  Posts ({posts.length})
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-[#FF6600] transition-all duration-300 group-hover:w-4/5 group-data-[state=active]:w-full group-data-[state=active]:h-[3px] group-data-[state=active]:bg-[#FF9900]"></span>
                </TabsTrigger>
                <TabsTrigger 
                  value="users" 
                  className="relative group cursor-pointer transition-all hover:bg-[#222222] data-[state=active]:bg-[#222222] data-[state=active]:text-[#FF9900] data-[state=active]:font-bold"
                >
                  Users ({users.length})
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-[#FF6600] transition-all duration-300 group-hover:w-4/5 group-data-[state=active]:w-full group-data-[state=active]:h-[3px] group-data-[state=active]:bg-[#FF9900]"></span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-4 mt-4">
                {users.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-3">Users</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {users.slice(0, 4).map((user) => (
                        <UserCard key={user.id} user={user} />
                      ))}
                    </div>
                    {users.length > 4 && (
                      <Button 
                        variant="ghost" 
                        className="mt-2 w-full"
                        onClick={() => setActiveTab("users")}
                      >
                        View all {users.length} users
                      </Button>
                    )}
                  </div>
                )}
                
                {posts.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-3">Posts</h2>
                    <div className="flex flex-col gap-4">
                      {posts.slice(0, 3).map((post) => (
                        <PostCard key={post.id} post={post} />
                      ))}
                    </div>
                    {posts.length > 3 && (
                      <Button 
                        variant="ghost" 
                        className="mt-2 w-full"
                        onClick={() => setActiveTab("posts")}
                      >
                        View all {posts.length} posts
                      </Button>
                    )}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="users" className="space-y-4 mt-4">
                <h2 className="text-xl font-semibold">Users</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {users.map((user) => (
                    <UserCard key={user.id} user={user} />
                  ))}
                </div>
                {users.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No users found matching &quot;{query}&quot;
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="posts" className="space-y-4 mt-4">
                <h2 className="text-xl font-semibold">Posts</h2>
                <div className="flex flex-col gap-4">
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
                {posts.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No posts found matching &quot;{query}&quot;
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
          
          {!loading && hasSearched && query && posts.length === 0 && users.length === 0 && !error && (
            <div className="text-center py-8 text-muted-foreground">
              No results found for &quot;{query}&quot;
            </div>
          )}
          
          {!query && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-2xl font-medium mb-2">Search for Posts & Users</h3>
              <p className="text-muted-foreground">
                Enter a search term to find relevant content and users
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

// User Card Component
function UserCard({ user }: { user: PostUser }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.image || ""} alt={user.name} />
          <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-base">{user.name}</CardTitle>
        </div>
      </CardHeader>
      <CardFooter className="pt-2">
        <Link href={`/users/${user.id}`} passHref>
          <Button variant="secondary" size="sm" className="w-full">
            <User className="h-4 w-4 mr-2" />
            View Profile
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

// Post Card Component
function PostCard({ post }: { post: Post }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={post.user?.image || ""} alt={post.user?.name} />
            <AvatarFallback>{post.user?.name?.charAt(0)}</AvatarFallback>
          </Avatar>
          <Link href={`/users/${post.user?.id}`}>
            <CardTitle className="text-sm font-medium">{post.user?.name}</CardTitle>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2">
          {new Date(post.createdAt).toLocaleDateString()}
        </p>
        <p className="line-clamp-3">{post.content}</p>
        {post.imageUrl && (
          <div className="mt-2 relative h-48 w-full overflow-hidden rounded-md">
            <Image
              src={post.imageUrl}
              alt="Post image"
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              className="object-cover"
            />
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Link href={`/posts/${post.id}`} passHref>
          <Button variant="secondary" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            View Post
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
} 