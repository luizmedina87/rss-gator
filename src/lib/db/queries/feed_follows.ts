import { db } from "../index.js";
import { feeds, users, feed_follows } from "../schema.js";
import { eq, and } from "drizzle-orm";

export async function createFeedFollow(userID: string, feedID: string) {
  const [result] = await db
    .insert(feed_follows)
    .values({
      user_id: userID,
      feed_id: feedID,
    })
    .returning();
  return result;
}

export async function getFeedFollowsForUser(userID: string) {
  return await db
    .select({
      feedname: feeds.name,
      feedurl: feeds.url,
    })
    .from(feeds)
    .innerJoin(feed_follows, eq(feeds.id, feed_follows.feed_id))
    .innerJoin(users, eq(feed_follows.user_id, users.id))
    .where(eq(users.id, userID));
}

export async function deleteFeedFollow(userID: string, feedID: string) {
  const deletedRows = await db
    .delete(feed_follows)
    .where(
      and(eq(feed_follows.user_id, userID), eq(feed_follows.feed_id, feedID)),
    )
    .returning();
  return deletedRows.length > 0;
}
