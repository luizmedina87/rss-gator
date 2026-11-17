import { db } from "../index.js";
import { feeds, users, feed_follows } from "../schema.js";
import { eq } from "drizzle-orm"

export async function createFeedFollow(
  userID: string,
  feedID: string,
) {
  // It should insert a feed follow record, but then return all the
  // fields from the feed follow as well as the names of the linked
  // user and feed.
  const [result] = await db
    .insert(feed_follows)
    .values({
      user_id: userID,
      feed_id: feedID
    })
    .returning();
  return result;
}

export async function getFeedFollowsForUser(userID: string) {
  // Add a getFeedFollowsForUser function. It should return all the
  // feed follows for a given user, and include the names of the
  // feeds and user in the result.
  return await db
  .select({
    feedname: feeds.name,
    feedurl: feeds.url
  })
  .from(feeds)
  .innerJoin(feed_follows, eq(feeds.id, feed_follows.feed_id))
  .innerJoin(users, eq(feed_follows.user_id, users.id))
  .where(eq(users.id, userID))
}