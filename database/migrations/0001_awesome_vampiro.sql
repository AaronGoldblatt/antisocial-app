CREATE INDEX "comments_post_id_idx" ON "comments" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "comments_user_id_idx" ON "comments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "comments_created_at_idx" ON "comments" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "follows_follower_id_idx" ON "follows" USING btree ("follower_id");--> statement-breakpoint
CREATE INDEX "follows_following_id_idx" ON "follows" USING btree ("following_id");--> statement-breakpoint
CREATE UNIQUE INDEX "follows_unique_idx" ON "follows" USING btree ("follower_id","following_id");--> statement-breakpoint
CREATE INDEX "posts_user_id_idx" ON "posts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "reactions_post_id_idx" ON "reactions" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "reactions_comment_id_idx" ON "reactions" USING btree ("comment_id");--> statement-breakpoint
CREATE INDEX "reactions_user_id_idx" ON "reactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "reactions_post_id_user_id_idx" ON "reactions" USING btree ("post_id","user_id");--> statement-breakpoint
CREATE INDEX "reactions_comment_id_user_id_idx" ON "reactions" USING btree ("comment_id","user_id");--> statement-breakpoint
CREATE INDEX "reactions_type_idx" ON "reactions" USING btree ("type");