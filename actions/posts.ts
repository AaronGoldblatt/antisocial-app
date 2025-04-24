"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { db } from "@/database/db"
import { NewPost, posts, reactions, ReactionType, comments, follows } from "@/database/schema/social"
import { and, count, desc, eq, exists, gt, inArray, isNull, or, sql } from "drizzle-orm"
import { users } from "@/database/schema/auth"

// Create a new post
export async function createPost(data: Pick<NewPost, "content" | "imageUrl">) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Not authenticated")
  }

  const newPost = await db.insert(posts).values({
    content: data.content,
    imageUrl: data.imageUrl,
    userId: session.user.id
  }).returning()

  revalidatePath("/")
  return newPost[0]
}

// Get posts for the feed (organized by dislikes and following)
export async function getFeedPosts() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Not authenticated")
  }

  // Get IDs of users being followed by the current user
  const followingUsers = await db
    .select({ userId: follows.followingId })
    .from(follows)
    .where(eq(follows.followerId, session.user.id))

  const followingUserIds = followingUsers.map((follow) => follow.userId)
  
  // Include current user's ID to see own posts
  const relevantUserIds = [session.user.id, ...followingUserIds]

  // Query posts with user info, reaction counts, comment counts
  const feedPosts = await db.query.posts.findMany({
    where: inArray(posts.userId, relevantUserIds),
    orderBy: [
      // Sort by engagement (number of dislikes and super dislikes, then creation date)
      desc(sql`
        (SELECT COUNT(*) FROM ${reactions} 
         WHERE ${reactions.postId} = ${posts.id} 
         AND (${reactions.type} = ${ReactionType.DISLIKE} OR ${reactions.type} = ${ReactionType.SUPER_DISLIKE}))
      `),
      desc(posts.createdAt)
    ],
    with: {
      user: true
    }
  })

  // Get reaction counts and user's reactions for each post
  const postsWithReactions = await Promise.all(
    feedPosts.map(async (post) => {
      const [likesCount, dislikesCount, superDislikesCount] = await Promise.all([
        db.select({ count: count() }).from(reactions)
          .where(and(eq(reactions.postId, post.id), eq(reactions.type, ReactionType.LIKE))),
        db.select({ count: count() }).from(reactions)
          .where(and(eq(reactions.postId, post.id), eq(reactions.type, ReactionType.DISLIKE))),
        db.select({ count: count() }).from(reactions)
          .where(and(eq(reactions.postId, post.id), eq(reactions.type, ReactionType.SUPER_DISLIKE)))
      ])

      const commentCount = await db.select({ count: count() })
        .from(comments)
        .where(eq(comments.postId, post.id))

      const userReaction = await db.select().from(reactions)
        .where(and(
          eq(reactions.postId, post.id),
          eq(reactions.userId, session.user.id)
        ))
        .limit(1)

      return {
        ...post,
        _count: {
          comments: commentCount[0].count,
          reactions: {
            like: likesCount[0].count,
            dislike: dislikesCount[0].count,
            superDislike: superDislikesCount[0].count
          }
        },
        userReaction: userReaction[0]?.type || null
      }
    })
  )

  return postsWithReactions
}

// Get posts for a specific user
export async function getUserPosts(userId: string) {
  const session = await auth()
  
  const userPosts = await db.query.posts.findMany({
    where: eq(posts.userId, userId),
    orderBy: [
      // Sort by engagement (number of dislikes and super dislikes, then creation date)
      desc(sql`
        (SELECT COUNT(*) FROM ${reactions} 
         WHERE ${reactions.postId} = ${posts.id} 
         AND (${reactions.type} = ${ReactionType.DISLIKE} OR ${reactions.type} = ${ReactionType.SUPER_DISLIKE}))
      `),
      desc(posts.createdAt)
    ],
    with: {
      user: true
    }
  })

  // Get reaction counts and user's reactions for each post
  const postsWithReactions = await Promise.all(
    userPosts.map(async (post) => {
      const [likesCount, dislikesCount, superDislikesCount] = await Promise.all([
        db.select({ count: count() }).from(reactions)
          .where(and(eq(reactions.postId, post.id), eq(reactions.type, ReactionType.LIKE))),
        db.select({ count: count() }).from(reactions)
          .where(and(eq(reactions.postId, post.id), eq(reactions.type, ReactionType.DISLIKE))),
        db.select({ count: count() }).from(reactions)
          .where(and(eq(reactions.postId, post.id), eq(reactions.type, ReactionType.SUPER_DISLIKE)))
      ])

      const commentCount = await db.select({ count: count() })
        .from(comments)
        .where(eq(comments.postId, post.id))

      const userReaction = session?.user?.id 
        ? await db.select().from(reactions)
            .where(and(
              eq(reactions.postId, post.id),
              eq(reactions.userId, session.user.id)
            ))
            .limit(1)
        : []

      return {
        ...post,
        _count: {
          comments: commentCount[0].count,
          reactions: {
            like: likesCount[0].count,
            dislike: dislikesCount[0].count,
            superDislike: superDislikesCount[0].count
          }
        },
        userReaction: userReaction[0]?.type || null
      }
    })
  )

  return postsWithReactions
}

// Get a single post with comments
export async function getPost(postId: string) {
  const session = await auth()
  
  const post = await db.query.posts.findFirst({
    where: eq(posts.id, postId),
    with: {
      user: true
    }
  })

  if (!post) {
    throw new Error("Post not found")
  }

  // Get reaction counts and user's reactions
  const [likesCount, dislikesCount, superDislikesCount] = await Promise.all([
    db.select({ count: count() }).from(reactions)
      .where(and(eq(reactions.postId, post.id), eq(reactions.type, ReactionType.LIKE))),
    db.select({ count: count() }).from(reactions)
      .where(and(eq(reactions.postId, post.id), eq(reactions.type, ReactionType.DISLIKE))),
    db.select({ count: count() }).from(reactions)
      .where(and(eq(reactions.postId, post.id), eq(reactions.type, ReactionType.SUPER_DISLIKE)))
  ])

  const commentCount = await db.select({ count: count() })
    .from(comments)
    .where(eq(comments.postId, post.id))

  const userReaction = session?.user?.id 
    ? await db.select().from(reactions)
        .where(and(
          eq(reactions.postId, post.id),
          eq(reactions.userId, session.user.id)
        ))
        .limit(1)
    : []

  const postComments = await db.select({
    id: comments.id,
    content: comments.content,
    imageUrl: comments.imageUrl,
    createdAt: comments.createdAt,
    updatedAt: comments.updatedAt,
    userId: comments.userId,
    postId: comments.postId,
    user: {
      id: users.id,
      name: users.name,
      image: users.image
    }
  }).from(comments)
    .innerJoin(users, eq(comments.userId, users.id))
    .where(eq(comments.postId, post.id))
    .orderBy(desc(comments.createdAt))

  // Get reaction counts for each comment
  const commentsWithReactions = await Promise.all(
    postComments.map(async (comment) => {
      const [likesCount, dislikesCount, superDislikesCount] = await Promise.all([
        db.select({ count: count() }).from(reactions)
          .where(and(eq(reactions.commentId, comment.id), eq(reactions.type, ReactionType.LIKE))),
        db.select({ count: count() }).from(reactions)
          .where(and(eq(reactions.commentId, comment.id), eq(reactions.type, ReactionType.DISLIKE))),
        db.select({ count: count() }).from(reactions)
          .where(and(eq(reactions.commentId, comment.id), eq(reactions.type, ReactionType.SUPER_DISLIKE)))
      ])

      const userReaction = session?.user?.id 
        ? await db.select().from(reactions)
            .where(and(
              eq(reactions.commentId, comment.id),
              eq(reactions.userId, session.user.id)
            ))
            .limit(1)
        : []

      return {
        ...comment,
        _count: {
          reactions: {
            like: likesCount[0].count,
            dislike: dislikesCount[0].count,
            superDislike: superDislikesCount[0].count
          }
        },
        userReaction: userReaction[0]?.type || null
      }
    })
  )

  return {
    ...post,
    _count: {
      comments: commentCount[0].count,
      reactions: {
        like: likesCount[0].count,
        dislike: dislikesCount[0].count,
        superDislike: superDislikesCount[0].count
      }
    },
    userReaction: userReaction[0]?.type || null,
    comments: commentsWithReactions
  }
}

// React to a post (like, dislike, super dislike)
export async function reactToPost(postId: string, type: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Not authenticated")
  }

  // Validate reaction type
  if (![ReactionType.LIKE, ReactionType.DISLIKE, ReactionType.SUPER_DISLIKE].includes(type as any)) {
    throw new Error("Invalid reaction type")
  }

  // Check if post exists
  const post = await db.select().from(posts).where(eq(posts.id, postId)).limit(1)
  if (!post.length) {
    throw new Error("Post not found")
  }

  // Check if user already reacted
  const existingReaction = await db.select().from(reactions)
    .where(and(
      eq(reactions.postId, postId),
      eq(reactions.userId, session.user.id)
    ))
    .limit(1)

  // If user already reacted with the same type, remove the reaction
  if (existingReaction.length && existingReaction[0].type === type) {
    await db.delete(reactions)
      .where(eq(reactions.id, existingReaction[0].id))
  } 
  // If user reacted with a different type, update the reaction
  else if (existingReaction.length) {
    await db.update(reactions)
      .set({ type, updatedAt: new Date() })
      .where(eq(reactions.id, existingReaction[0].id))
  } 
  // If user didn't react yet, create a new reaction
  else {
    await db.insert(reactions).values({
      type,
      userId: session.user.id,
      postId,
      commentId: null
    })
  }

  revalidatePath(`/posts/${postId}`)
  revalidatePath("/")
} 