import { fetchFeed } from "../lib/rss.js";

export async function agg(_: string, ...args: string[]) {
  // const FeedURL = args[0];
  const feedURL = "https://www.wagslane.dev/index.xml"
  const metadata = await fetchFeed(feedURL);
  console.log(JSON.stringify(metadata, null, 2));
}
