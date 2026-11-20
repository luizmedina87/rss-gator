import { fetchFeed, parsePubDate } from "../lib/rss.js";
import {
  getNextFeedToFetch,
  markFeedFetched,
} from "../lib/db/queries/feeds.js";
import { createPost } from "../lib/db/queries/posts.js";

function handleError(err: Error) {
  console.log(`Error when running agg: ${err.message}`);
}

function toMilliseconds(match: RegExpMatchArray): number {
  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case "ms":
      return value;
    case "s":
      return 1000 * value;
    case "m":
      return 60 * 1000 * value;
    case "h":
      return 60 * 60 * 1000 * value;
    default:
      throw new Error(`Unknown unit: ${unit}`);
  }
}

export async function handlerAgg(
  cmdName: string,
  ...args: string[]
): Promise<void> {
  const regex = /^(\d+)(ms|s|m|h)$/;
  const durationStr = args[0] || "10s";

  if (args.length > 1 || !regex.test(durationStr)) {
    throw new Error(
      `Usage: ${cmdName} <time between reqs ${String(regex)} (default: 10s)>`,
    );
  }

  const match = durationStr.match(regex);
  if (match === null) throw new Error("Invalid time between reqs provided");

  console.log(`Collecting feeds every ${match[0]}`);

  const timeBetweenRequests = toMilliseconds(match);

  scrapeFeeds().catch(handleError);

  const interval = setInterval(() => {
    scrapeFeeds().catch(handleError);
  }, timeBetweenRequests);

  await new Promise<void>((resolve) => {
    process.on("SIGINT", () => {
      console.log("Shutting down feed aggregator...");
      clearInterval(interval);
      resolve();
    });
  });
}

async function scrapeFeeds() {
  const feed = await getNextFeedToFetch();
  if (!feed) return;

  let feedData;
  try {
    feedData = await fetchFeed(feed.url);
  } catch (error) {
    await markFeedFetched(feed.id);
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to process feed ${feed.url}: ${message}`, {
      cause: error,
    });
  }

  await markFeedFetched(feed.id);

  for (const item of feedData.channel.item) {
    try {
      createPost(
        feed.id,
        item.title,
        item.description,
        item.link,
        parsePubDate(item.pubDate),
      );
    } catch (err) {
      console.error(
        `Failed to save post ${item.title} from ${feed.name} to database`,
      );
    }
  }
}
