"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/database/db"
import { comments, NewComment, posts, reactions, ReactionType } from "@/database/schema/social"
import { and, count, desc, eq, exists, gt, inArray, isNull, or, sql } from "drizzle-orm"
import { headers } from "next/headers"

// Create a new comment
export async function createComment(data: { postId: string; content: string; imageUrl?: string }) {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  if (!session?.user?.id) {
    throw new Error("Not authenticated")
  }

  // Check if post exists
  const post = await db.select().from(posts).where(eq(posts.id, data.postId)).limit(1)
  if (!post.length) {
    throw new Error("Post not found")
  }

  const newComment = await db.insert(comments).values({
    content: data.content,
    imageUrl: data.imageUrl,
    userId: session.user.id,
    postId: data.postId
  }).returning()

  revalidatePath(`/posts/${data.postId}`)
  return newComment[0]
}

// React to a comment (like, dislike, super dislike)
export async function reactToComment(commentId: string, type: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  if (!session?.user?.id) {
    throw new Error("Not authenticated")
  }

  // Validate reaction type
  if (![ReactionType.LIKE, ReactionType.DISLIKE, ReactionType.SUPER_DISLIKE].includes(type as any)) {
    throw new Error("Invalid reaction type")
  }

  // Check if comment exists
  const comment = await db.select().from(comments).where(eq(comments.id, commentId)).limit(1)
  if (!comment.length) {
    throw new Error("Comment not found")
  }

  // Check if user already reacted
  const existingReaction = await db.select().from(reactions)
    .where(and(
      eq(reactions.commentId, commentId),
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
      postId: null,
      commentId
    })
  }

  // Get the post ID to revalidate the page
  const postId = comment[0].postId
  revalidatePath(`/posts/${postId}`)
} 