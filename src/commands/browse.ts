import { getPostsForUser } from "../lib/db/queries/posts.js";
import { User } from "../lib/db/schema.js";

export async function handlerBrowse(
  cmdName: string,
  user: User,
  ...args: string[]
) {
  if (args.length > 1) {
    throw new Error(`Usage ${cmdName} <number of posts (default 2)>`);
  }
  const numPosts = Number.parseInt(args[0]) || undefined;

  const posts = await getPostsForUser(user.id, numPosts);

  posts.forEach((post) => {
    console.log(
      `\n${post.title}\nFrom: ${post.feed}\nPublished at ${post.publishedAt?.toLocaleDateString()}\n\n${post.link}\n\n${post.post}\n\n\n`,
    );
  });
}
