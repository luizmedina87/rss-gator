import { db } from "../index.js";
import { feed_follows, feeds, users } from "../schema.js";
import { eq, asc } from "drizzle-orm";

export async function createFeed(name: string, url: string) {
  const [result] = await db
    .insert(feeds)
    .values({ name: name, url: url })
    .returning();
  return result;
}

export async function getFeeds() {
  return await db
    .select({
      username: users.name,
      feedname: feeds.name,
      feedurl: feeds.url,
    })
    .from(feeds)
    .innerJoin(feed_follows, eq(feeds.id, feed_follows.feed_id))
    .innerJoin(users, eq(feed_follows.user_id, users.id))
    .orderBy(asc(users.name));
}

export async function getFeed(url: string) {
  return await db.select().from(feeds).where(eq(feeds.url, url));
}
