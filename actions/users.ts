"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { db } from "@/database/db"
import { follows, posts, comments, reactions } from "@/database/schema/social"
import { users } from "@/database/schema/auth"
import { and, count, eq, sql } from "drizzle-orm"
import { headers } from "next/headers"

// Get user profile info
export async function getUserProfile(userId: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  // Get user
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId)
  })

  if (!user) {
    throw new Error("User not found")
  }

  // Get follow counts
  const followerCount = await db.select({ count: count() })
    .from(follows)
    .where(eq(follows.followingId, userId))

  const followingCount = await db.select({ count: count() })
    .from(follows)
    .where(eq(follows.followerId, userId))

  // Get post count
  const postCount = await db.select({ count: count() })
    .from(posts)
    .where(eq(posts.userId, userId))

  // Check if current user is following this user
  let isFollowing = false
  if (session?.user?.id && session.user.id !== userId) {
    const followRelation = await db.select()
      .from(follows)
      .where(and(
        eq(follows.followerId, session.user.id),
        eq(follows.followingId, userId)
      ))
      .limit(1)
    
    isFollowing = followRelation.length > 0
  }

  return {
    user,
    followerCount: followerCount[0].count,
    followingCount: followingCount[0].count,
    postCount: postCount[0].count,
    isFollowing,
    isCurrentUser: session?.user?.id === userId
  }
}

// Follow a user
export async function followUser(userId: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  if (!session?.user?.id) {
    throw new Error("Not authenticated")
  }

  if (session.user.id === userId) {
    throw new Error("Cannot follow yourself")
  }

  // Check if user exists
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1)
  if (!user.length) {
    throw new Error("User not found")
  }

  // Check if already following
  const existingFollow = await db.select()
    .from(follows)
    .where(and(
      eq(follows.followerId, session.user.id),
      eq(follows.followingId, userId)
    ))
    .limit(1)

  if (existingFollow.length) {
    return // Already following
  }

  // Create follow relationship
  await db.insert(follows).values({
    followerId: session.user.id,
    followingId: userId
  })

  revalidatePath(`/users/${userId}`)
  revalidatePath("/")
}

// Unfollow a user
export async function unfollowUser(userId: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  if (!session?.user?.id) {
    throw new Error("Not authenticated")
  }

  if (session.user.id === userId) {
    throw new Error("Cannot unfollow yourself")
  }

  // Check if follow exists
  const existingFollow = await db.select()
    .from(follows)
    .where(and(
      eq(follows.followerId, session.user.id),
      eq(follows.followingId, userId)
    ))
    .limit(1)

  if (!existingFollow.length) {
    return // Not following
  }

  // Remove follow relationship
  await db.delete(follows)
    .where(eq(follows.id, existingFollow[0].id))

  revalidatePath(`/users/${userId}`)
  revalidatePath("/")
}

// Get users being followed by a user
export async function getFollowing(userId: string) {
  const followingUsers = await db.select({
    id: users.id,
    name: users.name,
    image: users.image,
    followId: follows.id,
    followedAt: follows.createdAt
  })
  .from(follows)
  .innerJoin(users, eq(follows.followingId, users.id))
  .where(eq(follows.followerId, userId))
  .orderBy(follows.createdAt)

  return followingUsers
}

// Get users following a user
export async function getFollowers(userId: string) {
  const followers = await db.select({
    id: users.id,
    name: users.name,
    image: users.image,
    followId: follows.id,
    followedAt: follows.createdAt
  })
  .from(follows)
  .innerJoin(users, eq(follows.followerId, users.id))
  .where(eq(follows.followingId, userId))
  .orderBy(follows.createdAt)

  return followers
} 