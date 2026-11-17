import { fetchFeed } from "../lib/rss.js";
import { createFeed, getFeeds, getFeed } from "../lib/db/queries/feeds.js";
import { normalizeURL } from "../lib/url.js";
import type { User, Feed } from "../lib/db/schema.js";
import {
  createFeedFollow,
  getFeedFollowsForUser,
} from "../lib/db/queries/feed_follows.js";

export async function handlerAgg(_: string, ...args: string[]) {
  const feedURL = args[0];
  const metadata = await fetchFeed(feedURL);
  console.log(JSON.stringify(metadata, null, 2));
}










