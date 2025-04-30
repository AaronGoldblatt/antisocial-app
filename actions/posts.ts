"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { db } from "@/database/db"
import { NewPost, posts, reactions, ReactionType, comments, follows } from "@/database/schema/social"
import { and, count, desc, eq, exists, gt, inArray, isNull, not, or, sql } from "drizzle-orm"
import { users } from "@/database/schema/auth"
import { headers } from "next/headers"

// Create a new post
export async function createPost(data: Pick<NewPost, "content" | "imageUrl">) {
  const session = await auth.api.getSession({
    headers: await headers()
  });
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

// Get posts for the feed (showing all posts except the user's own, sorted by dislikes)
export async function getFeedPosts() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  if (!session?.user?.id) {
    throw new Error("Not authenticated")
  }

  // Query posts with user info
  const feedPosts = await db.query.posts.findMany({
    orderBy: [
      // Sort by (dislike + 2*super_dislike) first, then by creation date (newest first)
      desc(sql.raw(`
        (SELECT COUNT(*) FROM "reactions" 
         WHERE "reactions"."post_id" = "posts"."id" 
         AND "reactions"."type" = 'dislike')
        + 2 * (SELECT COUNT(*) FROM "reactions" 
         WHERE "reactions"."post_id" = "posts"."id" 
         AND "reactions"."type" = 'super_dislike')
      `)),
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
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  const userPosts = await db.query.posts.findMany({
    where: eq(posts.userId, userId),
    orderBy: [
      // Sort by (dislike + 2*super_dislike) first, then by creation date
      desc(sql.raw(`
        (SELECT COUNT(*) FROM "reactions" 
         WHERE "reactions"."post_id" = "posts"."id" 
         AND "reactions"."type" = 'dislike')
        + 2 * (SELECT COUNT(*) FROM "reactions" 
         WHERE "reactions"."post_id" = "posts"."id" 
         AND "reactions"."type" = 'super_dislike')
      `)),
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
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
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

  // Get comments sorted by (dislike + 2*super_dislike) first, then by newest first when scores are equal
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
    .orderBy(
      desc(sql.raw(`
        (SELECT COUNT(*) FROM "reactions" 
         WHERE "reactions"."comment_id" = "comments"."id" 
         AND "reactions"."type" = 'dislike')
        + 2 * (SELECT COUNT(*) FROM "reactions" 
         WHERE "reactions"."comment_id" = "comments"."id" 
         AND "reactions"."type" = 'super_dislike')
      `)),
      desc(comments.createdAt)
    )

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

// Check if a user has made any posts
export async function hasUserPosted(userId: string) {
  const postCount = await db.select({ count: count() })
    .from(posts)
    .where(eq(posts.userId, userId))
  
  return postCount[0].count > 0
}

// Get posts from users the current user is following (ordered by newest first)
export async function getFollowingPosts() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session?.user?.id) {
    throw new Error("Not authenticated")
  }

  // First, get the IDs of users that the current user is following
  const followedUsers = await db.select({
    followingId: follows.followingId
  })
  .from(follows)
  .where(eq(follows.followerId, session.user.id));
  
  // Extract the user IDs from the result
  const followedUserIds = followedUsers.map(user => user.followingId);
  
  // If not following anyone, return empty array
  if (followedUserIds.length === 0) {
    return [];
  }

  // Get posts from followed users
  const followingPosts = await db.query.posts.findMany({
    where: inArray(posts.userId, followedUserIds),
    orderBy: [desc(posts.createdAt)], // Order by newest first
    with: {
      user: true
    }
  });

  // Get reaction counts and user's reactions for each post
  const postsWithReactions = await Promise.all(
    followingPosts.map(async (post) => {
      const [likesCount, dislikesCount, superDislikesCount] = await Promise.all([
        db.select({ count: count() }).from(reactions)
          .where(and(eq(reactions.postId, post.id), eq(reactions.type, ReactionType.LIKE))),
        db.select({ count: count() }).from(reactions)
          .where(and(eq(reactions.postId, post.id), eq(reactions.type, ReactionType.DISLIKE))),
        db.select({ count: count() }).from(reactions)
          .where(and(eq(reactions.postId, post.id), eq(reactions.type, ReactionType.SUPER_DISLIKE)))
      ]);

      const commentCount = await db.select({ count: count() })
        .from(comments)
        .where(eq(comments.postId, post.id));

      const userReaction = await db.select().from(reactions)
        .where(and(
          eq(reactions.postId, post.id),
          eq(reactions.userId, session.user.id)
        ))
        .limit(1);

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
      };
    })
  );

  return postsWithReactions;
}

// Count new posts from followed users since a given date
export async function countNewFollowingPosts(since: Date) {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!session?.user?.id) {
    throw new Error("Not authenticated")
  }

  // Get the IDs of users that the current user is following
  const followedUsers = await db.select({
    followingId: follows.followingId
  })
  .from(follows)
  .where(eq(follows.followerId, session.user.id));
  
  // Extract the user IDs from the result
  const followedUserIds = followedUsers.map(user => user.followingId);
  
  // If not following anyone, return zero
  if (followedUserIds.length === 0) {
    return 0;
  }

  // Count posts from followed users newer than the given date
  const newPostsCount = await db.select({ count: count() })
    .from(posts)
    .where(and(
      inArray(posts.userId, followedUserIds),
      gt(posts.createdAt, since)
    ));

  return newPostsCount[0].count;
} 