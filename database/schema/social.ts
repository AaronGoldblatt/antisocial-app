import { boolean, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"
import { createSelectSchema, createInsertSchema } from "drizzle-zod"
import { z } from "zod"

import { users } from "./auth"

// Posts table - for user rants
export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
})

// Comments table - for comments on posts
export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  postId: uuid("post_id")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" })
})

// ReactionType enum
export const ReactionType = {
  LIKE: "like",
  DISLIKE: "dislike",
  SUPER_DISLIKE: "super_dislike"
} as const

// Reactions table - for likes, dislikes, and super dislikes
export const reactions = pgTable("reactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: text("type").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  postId: uuid("post_id").references(() => posts.id, { onDelete: "cascade" }),
  commentId: uuid("comment_id").references(() => comments.id, { onDelete: "cascade" })
})

// Follows table - for stalking (following) relationships
export const follows = pgTable("follows", {
  id: uuid("id").primaryKey().defaultRandom(),
  followerId: text("follower_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  followingId: text("following_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow()
})

// Relations
export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(users, { fields: [posts.userId], references: [users.id] }),
  comments: many(comments),
  reactions: many(reactions)
}))

export const commentsRelations = relations(comments, ({ one, many }) => ({
  user: one(users, { fields: [comments.userId], references: [users.id] }),
  post: one(posts, { fields: [comments.postId], references: [posts.id] }),
  reactions: many(reactions)
}))

export const reactionsRelations = relations(reactions, ({ one }) => ({
  user: one(users, { fields: [reactions.userId], references: [users.id] }),
  post: one(posts, { fields: [reactions.postId], references: [posts.id] }),
  comment: one(comments, { fields: [reactions.commentId], references: [comments.id] })
}))

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, { fields: [follows.followerId], references: [users.id] }),
  following: one(users, { fields: [follows.followingId], references: [users.id] })
}))

// Zod schemas for validation
export const selectPostSchema = createSelectSchema(posts)
export const insertPostSchema = createInsertSchema(posts, {
  content: (schema: z.ZodString) => schema.nonempty("Content cannot be empty"),
})

export const selectCommentSchema = createSelectSchema(comments)
export const insertCommentSchema = createInsertSchema(comments, {
  content: (schema: z.ZodString) => schema.nonempty("Content cannot be empty"),
})

export const selectReactionSchema = createSelectSchema(reactions)
export const insertReactionSchema = createInsertSchema(reactions, {
  type: (schema) => z.enum([ReactionType.LIKE, ReactionType.DISLIKE, ReactionType.SUPER_DISLIKE] as const)
})

export const selectFollowSchema = createSelectSchema(follows)
export const insertFollowSchema = createInsertSchema(follows)

// Types
export type Post = z.infer<typeof selectPostSchema>;
export type NewPost = z.infer<typeof insertPostSchema>;

export type Comment = z.infer<typeof selectCommentSchema>;
export type NewComment = z.infer<typeof insertCommentSchema>;

export type Reaction = z.infer<typeof selectReactionSchema>;
export type NewReaction = z.infer<typeof insertReactionSchema>;

export type Follow = z.infer<typeof selectFollowSchema>;
export type NewFollow = z.infer<typeof insertFollowSchema>; 