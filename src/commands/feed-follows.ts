import { getFeed } from "../lib/db/queries/feeds.js";
import { normalizeURL } from "../lib/url.js";
import type { User, Feed } from "../lib/db/schema.js";
import {
  createFeedFollow,
  getFeedFollowsForUser,
  deleteFeedFollow,
} from "../lib/db/queries/feed_follows.js";

function printFeed(feed: Feed, user: User) {
  console.log(`* ID:            ${feed.id}`);
  console.log(`* Created:       ${feed.createdAt}`);
  console.log(`* Updated:       ${feed.updatedAt}`);
  console.log(`* name:          ${feed.name}`);
  console.log(`* URL:           ${feed.url}`);
  console.log(`* User:          ${user.name}`);
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

export async function handlerFollow(
  _: string,
  userData: User,
  ...args: string[]
) {
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

export async function handlerFollowing(_: string, userData: User) {
  const userID = userData.id;

  const feedFollowList = await getFeedFollowsForUser(userID);
  feedFollowList.forEach((feed) =>
    console.log(`Feed name: ${feed.feedname}\nFeed URL: ${feed.feedurl}\n`),
  );
}

export async function handlerUnfollow(
  _: string,
  userData: User,
  ...args: string[]
) {
  if (args.length !== 1) throw new Error("Usage: unfollow <feed URL>");
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
  const deleted: boolean = await deleteFeedFollow(userID, feedID);

  if (deleted) {
    console.log(
      `User ${userData.name} succesfully unfollowed ${feedData.name} ${feedData.url}`,
    );
  } else {
    throw new Error("Something went wrong when unfollowing");
  }
}
