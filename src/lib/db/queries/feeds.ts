import { db } from "../index.js";
import { feed_follows, feeds, users } from "../schema.js";
import { eq, asc } from "drizzle-orm";
import { normalizeURL } from "../../url.js";

export async function createFeed(name: string, url: string) {
  const normalizedURL = normalizeURL(url);
  if (!normalizedURL) throw new Error(`Not a valid URL: ${url}`);

  const [result] = await db
    .insert(feeds)
    .values({ name: name, url: normalizedURL })
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
  const normalizedURL = normalizeURL(url);
  if (!normalizedURL) throw new Error(`Not a valid URL: ${url}`);

  return await db.select().from(feeds).where(eq(feeds.url, normalizedURL));
}
