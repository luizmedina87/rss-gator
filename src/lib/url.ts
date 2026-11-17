export function normalizeURL(urlString: string): string | undefined {
  try {
    const url = new URL(urlString);
    if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;
    return url.href;
  } catch {
    return undefined;
  }
}
