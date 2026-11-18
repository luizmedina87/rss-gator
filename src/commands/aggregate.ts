import { fetchFeed } from "../lib/rss.js";
import {
  getNextFeedToFetch,
  markFeedFetched,
} from "../lib/db/queries/feeds.js";

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
  const durationStr = args[0] || "";

  if (args.length !== 1 || !regex.test(durationStr)) {
    throw new Error(`Usage: ${cmdName} <time between reqs ${String(regex)}>`);
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

  const feedData = await fetchFeed(feed.url);

  await markFeedFetched(feed.id);

  for (const item of feedData.channel.item) {
    console.log(item.title);
  }
}
