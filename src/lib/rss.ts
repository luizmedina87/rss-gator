import { XMLParser } from "fast-xml-parser";

export type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

export type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

function validateRssData(rssJsonData: any): void {
  const baseErrorMsg = "Failed to retrieve RSS data";
  if (!rssJsonData) throw new Error(baseErrorMsg);
  if (!rssJsonData?.rss) throw new Error(`${baseErrorMsg}: missing rss`);
  if (!rssJsonData.rss?.channel)
    throw new Error(`${baseErrorMsg}: missing rss.channel`);
  if (!rssJsonData.rss.channel?.title)
    throw new Error(`${baseErrorMsg}: missing rss.channel.title`);
  if (!rssJsonData.rss.channel?.link)
    throw new Error(`${baseErrorMsg}: missing rss.channel.link`);
  if (!rssJsonData.rss.channel?.description)
    throw new Error(`${baseErrorMsg}: missing rss.channel.description`);
}

export async function fetchFeed(FeedURL: string) {
  const res = await fetch(FeedURL, {
    headers: {
      "User-Agent": "gator",
    },
  });

  if (!res.ok) {
    throw new Error(`failed to fetch feed: ${res.status} ${res.statusText}`);
  }

  const rssXmlData = await res.text();
  const parser = new XMLParser({ processEntities: false });
  let rssJsonData = parser.parse(rssXmlData);

  validateRssData(rssJsonData);

  let items: RSSItem[] = [];
  const rssItems = rssJsonData.rss.channel?.item;
  if (rssItems) {
    if (Array.isArray(rssItems)) {
      items = rssItems;
    } else {
      items = rssItems ? [rssItems] : [];
    }
  }

  items = items.filter(
    (item) => item?.title && item?.link && item?.description && item?.pubDate,
  );
  items = items.map((item) => {
    return {
      title: item.title,
      link: item.link,
      description: item.description,
      pubDate: item.pubDate,
    };
  });

  const rss: RSSFeed = {
    channel: {
      title: rssJsonData.rss.channel.title,
      link: rssJsonData.rss.channel.link,
      description: rssJsonData.rss.channel.description,
      item: items,
    },
  };

  return rss;
}
