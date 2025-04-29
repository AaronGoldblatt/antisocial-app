"use server"

import { z } from "zod"
import { auth } from "@/auth"
import { db } from "@/database/db"
import { posts } from "@/database/schema/social"
import { users } from "@/database/schema/auth"
import { desc, eq, ilike, or } from "drizzle-orm"
import { headers } from "next/headers"

// Search schema
const searchSchema = z.object({
  query: z.string().min(1).max(100)
})

// Search functionality
export async function search(data: z.infer<typeof searchSchema>) {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session?.user?.id) {
    return {
      posts: [],
      users: [],
      error: "You must be logged in to search"
    }
  }
  
  const query = data.query.trim()
  if (!query) {
    return {
      posts: [],
      users: [],
      error: "Search query cannot be empty"
    }
  }

  try {
    // Search for posts using trigram search (using ILIKE for partial matching)
    const searchedPosts = await db.query.posts.findMany({
      where: ilike(posts.content, `%${query}%`),
      orderBy: [desc(posts.createdAt)],
      limit: 20,
      with: {
        user: true,
      },
    });

    // Search for users (by name)
    const searchedUsers = await db.query.users.findMany({
      where: ilike(users.name, `%${query}%`),
      limit: 20,
    });

    return {
      posts: searchedPosts,
      users: searchedUsers,
      success: true
    }
  } catch (error) {
    console.error("Search error:", error);
    return {
      posts: [],
      users: [],
      error: "Failed to perform search"
    }
  }
}

// Get user suggestions for the current user
export async function getUserSuggestions() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  if (!session?.user?.id) {
    return []
  }

  // Placeholder for user suggestions
  // In a real implementation, this would:
  // 1. Find users the current user is not following
  // 2. Sort by some relevance criteria (common follows, activity, etc.)
  // 3. Limit to a reasonable number (e.g., 5-10)
  return {
    users: [],
    message: "User suggestions functionality is not implemented yet. This is a placeholder."
  }
} 