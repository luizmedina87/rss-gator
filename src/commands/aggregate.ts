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

export async function follow(userID: string, feedID: string) {
  try {
    return await createFeedFollow(userID, feedID);
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(`Error creating feed-follow: ${err.message}`);
    } else {
      console.error(err);
      process.exit(1);
    }
  }
}

export async function handlerAddfeed(_: string, userData: User, ...args: string[]) {
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
      feedData = await createFeed(feedName, feedURL);
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

export async function handlerFollow(_: string, userData: User, ...args: string[]) {
  if (args.length !== 1) throw new Error("Usage: follow <feed URL>");
  const rawFeedURL = args[0];
  const feedURL = normalizeURL(rawFeedURL);
  if (!feedURL) throw new Error("Unvalid URL");

  const feedList = await getFeed(feedURL);
  if (feedList.length === 0) {
    throw new Error(
      `${feedURL} not in the database. Create it through addfeed.`,
    );
  }
  const feedData = feedList[0];
  const feedID = feedData.id;
  const userID = userData.id;

  await follow(userID, feedID);
  console.log(`Successfully saved feed and added to user '${userData.name}'`);
  printFeed(feedData, userData);
}

function printFeed(feed: Feed, user: User) {
  console.log(
    `User name: ${user.name}\nFeed name: ${feed.name}\nFeed url: ${feed.url}`,
  );
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

export async function handlerFollowing(_: string, userData: User) {
  const userID = userData.id;

  const feedFollowList = await getFeedFollowsForUser(userID);
  feedFollowList.forEach((feed) =>
    console.log(`Feed name: ${feed.feedname}\nFeed URL: ${feed.feedurl}\n`),
  );
}
