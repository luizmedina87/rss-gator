import { db } from "../index.js";
import { feeds, users } from "../schema.js";
import { eq, asc } from "drizzle-orm";

export async function createFeed(name: string, url: string, user_id: string) {
  const [result] = await db
    .insert(feeds)
    .values({ name: name, url: url, user_id: user_id })
    .returning();
  return result;
}

export async function getFeeds() {
  return await db
    .select({
      username: users.name,
      feed: feeds,
    })
    .from(feeds)
    .innerJoin(users, eq(feeds.user_id, users.id))
    .orderBy(asc(users.name));
}
