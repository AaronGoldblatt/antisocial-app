import { desc } from "drizzle-orm"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { db } from "@/database/db"
import { posts } from "@/database/schema/social"
import { Button } from "@/components/ui/button"
import { headers } from "next/headers"
export const dynamic = 'force-dynamic'

export default async function AdminPage() {
    const session = await auth.api.getSession({
        headers: await headers()
      });
    
    // Ensure only admin users can access this page
    // For now, we'll just check if the user is authenticated
    if (!session?.user) {
        redirect("/auth/sign-in")
    }
    
    // In a real app, you'd check for admin role
    // if (!session.user.isAdmin) {
    //     redirect("/")
    // }

    const allPosts = await db.query.posts.findMany({
        with: {
            user: {
                columns: {
                    name: true,
                }
            }
        },
        orderBy: [desc(posts.createdAt)]
    });

    // Placeholder for deleting a post (not implemented yet)
    async function deletePost(formData: FormData) {
        "use server"
        const id = formData.get("id") as string
        console.log("Not implemented: Delete post with ID:", id)
        // In a real implementation:
        // await db.delete(posts).where(eq(posts.id, id))
    }

    return (
        <main className="py-8 px-4">
            <section className="container mx-auto">
                <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

                <div className="border rounded-md overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-muted">
                            <tr>
                                <th className="py-2 px-4 text-left">User</th>
                                <th className="py-2 px-4 text-left">Post Content</th>
                                <th className="py-2 px-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allPosts.length === 0 && (
                                <tr>
                                    <td colSpan={3} className="py-2 px-4 text-center">No posts found</td>
                                </tr>
                            )}
                            {allPosts.map((post) => (
                                <tr key={post.id} className="border-t">
                                    <td className="py-2 px-4">{post.user.name}</td>
                                    <td className="py-2 px-4">
                                        {post.content.length > 50 
                                            ? `${post.content.substring(0, 50)}...` 
                                            : post.content}
                                    </td>
                                    <td className="py-2 px-4 text-center">
                                        <form action={deletePost}>
                                            <input type="hidden" name="id" value={post.id} />
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                type="submit"
                                            >
                                                Delete
                                            </Button>
                                        </form>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </main>
    )
} 
