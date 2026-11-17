import { fetchFeed } from "../lib/rss.js";
import { getCurrentUser } from "../config.js";
import { getUser } from "../lib/db/queries/users.js";
import { createFeed, getFeeds, getFeed } from "../lib/db/queries/feeds.js";
import { isValidURL } from "./utils.js";
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

export async function handlerAddfeed(_: string, ...args: string[]) {
  const feedName = args[0];
  const feedURL = args[1];

  if (args.length < 2) throw new Error("Usage: addfeed <feed name> <feed URL>");
  if (!isValidURL(feedURL)) throw new Error(`Not a valid URL: ${feedURL}`);

  const currentUser = getCurrentUser();
  const userData = await getUser(currentUser);
  const userID = userData.id;

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

  console.log(`Successfully saved feed and added to user '${currentUser}'`);
  console.log(`${feedData.url} ${feedFollowData.createdAt}`);
}

export async function handlerFollow(_: string, ...args: string[]) {
  if (args.length !== 1) throw new Error("Usage: follow <feed URL>");
  const feedURL = args[0];
  if (!isValidURL(feedURL)) throw new Error("Unvalid URL");

  const feedList = await getFeed(feedURL);
  if (feedList.length === 0) {
    throw new Error(
      `${feedURL} not in the database. Create it through addfeed.`,
    );
  }
  const feedData = feedList[0];
  const feedID = feedData.id;

  const currentUser = getCurrentUser();
  const userData = await getUser(currentUser);
  const userID = userData.id;

  const feedFollowData = await follow(userID, feedID);
  console.log(`Successfully saved feed and added to user '${currentUser}'`);
  // console.log(`${feedData.url} ${feedFollowData.createdAt}`);
  printFeed(feedData, userData);
}

function printFeed(feed: Feed, user: User) {
  console.log(
    `Feed: ${feed.name} ${feed.id} ${feed.createdAt} ${feed.updatedAt} ${feed.url}`,
  );
  console.log(
    `User: ${user.name} ${user.id} ${user.createdAt} ${user.updatedAt}`,
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

export async function handlerFollowing(_: string) {
  const currentUser = getCurrentUser();
  const userData = await getUser(currentUser);
  const userID = userData.id;

  console.log(await getFeedFollowsForUser(userID));
}
