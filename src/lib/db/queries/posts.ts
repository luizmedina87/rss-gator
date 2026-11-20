import { url } from "node:inspector";
import { normalizeURL } from "../../url.js";
import { db } from "../index.js";
import { feed_follows, posts, feeds, users } from "../schema.js";
import { eq, desc } from "drizzle-orm";

export async function createPost(
  feedID: string,
  title: string,
  description: string,
  url: string,
  publishedAt?: Date | null,
) {
  const normalizedURL = normalizeURL(url);
  if (!normalizedURL) throw new Error(`Not a valid URL: ${url}`);

  const [result] = await db
    .insert(posts)
    .values({
      title: title,
      description: description,
      url: normalizedURL,
      publishedAt: publishedAt,
      feedID: feedID,
    })
    .onConflictDoNothing({ target: posts.url })
    .returning();

  return result;
}

export async function getPostsForUser(userID: string, numPosts: number = 2) {
  return await db
    .select({
      feed: feeds.name,
      title: posts.title,
      publishedAt: posts.publishedAt,
      link: posts.url,
      post: posts.description,
    })
    .from(posts)
    .innerJoin(feed_follows, eq(posts.feedID, feed_follows.feed_id))
    .innerJoin(feeds, eq(feed_follows.feed_id, feeds.id))
    .where(eq(feed_follows.user_id, userID))
    .orderBy(desc(posts.publishedAt))
    .limit(numPosts);
}
