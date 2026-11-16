import { fetchFeed } from "../lib/rss.js";
import { getCurrentUser } from "../config.js";
import { getUser } from "../lib/db/queries/users.js";
import { createFeed } from "../lib/db/queries/feeds.js";
import { isValidURL } from "./utils.js";
import type { User, Feed } from "../lib/db/schema.js";

export async function agg(_: string, ...args: string[]) {
  // const FeedURL = args[0];
  const feedURL = "https://www.wagslane.dev/index.xml";
  const metadata = await fetchFeed(feedURL);
  console.log(JSON.stringify(metadata, null, 2));
}

export async function addfeed(_: string, ...args: string[]) {
  const feedName = args[0];
  const feedURL = args[1];

  if (args.length < 2) throw new Error("Usage: addfeed <feed name> <feed URL>");
  if (!isValidURL(feedURL)) throw new Error(`Not a valid URL: ${feedURL}`);

  const currentUser = getCurrentUser();
  const userData = await getUser(currentUser);
  const userID = userData.id;

  try {
    await createFeed(feedName, feedURL, userID);
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(`Error creating feed: ${err.message}`);
    } else {
      console.error(err);
    }
  }
  console.log("Successfully saved feed.");
  console.log(`${feedName} ${feedURL} ${userID}`);
}

export function printFeed(feed: Feed, user: User) {
  console.log(
    `Feed: ${feed.name} ${feed.id} ${feed.createdAt} ${feed.updatedAt} ${feed.url} ${feed.user_id}`,
  );
  console.log(
    `User: ${user.name} ${user.id} ${user.createdAt} ${user.updatedAt}`,
  );
}

export async function handlerFeeds(_: string) {}
