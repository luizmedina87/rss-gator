import { createFeed, getFeeds, getFeed } from "../lib/db/queries/feeds.js";
import { normalizeURL } from "../lib/url.js";
import { follow } from "./feed-follows.js";
import type { User } from "../lib/db/schema.js";

export async function handlerAddfeed(
  _: string,
  userData: User,
  ...args: string[]
) {
  const feedName = args[0];
  const rawFeedURL = args[1];
  const userID = userData.id;

  if (args.length < 2) throw new Error("Usage: addfeed <feed name> <feed URL>");
  const feedURL = normalizeURL(rawFeedURL);
  if (!feedURL) throw new Error(`Not a valid URL: ${rawFeedURL}`);

  const feedList = await getFeed(feedURL);

  let feedData, feedID, feedFollowData;

  if (feedList.length === 0) {
    try {
      feedData = await createFeed(feedName, feedURL, userID);
      feedID = feedData.id;
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(`Error creating feed: ${err.message}`);
      } else {
        console.error(err);
        process.exit(1);
      }
    }
  } else {
    feedData = feedList[0];
    feedID = feedData.id;
  }

  feedFollowData = await follow(userID, feedID);

  console.log(`Successfully saved feed and added to user '${userData.name}'`);
  console.log(`${feedData.url} ${feedFollowData.createdAt}`);
}

export async function handlerFeeds(_: string, ...args: string[]) {
  if (args.length > 0) throw new Error("Usage: feeds");

  try {
    const feeds = await getFeeds();
    for (const feed of feeds) {
      const name = feed.username;
      const feedName = feed.feedname;
      const feedURL = feed.feedurl;
      console.log(`User: ${name}\nFeed: ${feedName}\nURL:  ${feedURL}\n\n`);
    }
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    } else {
      console.error(`Could not read from database: ${err}`);
      process.exit(1);
    }
  }
}
