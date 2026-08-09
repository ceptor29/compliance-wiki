import Parser from "rss-parser";
import * as cheerio from "cheerio";

export type SourceConfig = {
  name: string;
  url: string;
  type: "rss" | "html";
  frameworkSlug?: string;
};

const parser = new Parser({ timeout: 30000 });

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

export async function fetchSourceContent(source: SourceConfig): Promise<string> {
  if (source.type === "rss") {
    return fetchRssText(source.url);
  }
  return fetchHtmlText(source.url);
}

async function fetchRssText(url: string): Promise<string> {
  const feed = await parser.parseURL(url);
  const items = (feed.items ?? []).slice(0, 15);
  return items
    .map((item) => {
      const link = item.link ? ` (${item.link})` : "";
      const pubDate = item.isoDate ?? item.pubDate ?? "";
      return `- ${item.title ?? "Untitled"}${link}\n  ${pubDate}\n  ${(item.contentSnippet ?? item.content ?? "").slice(0, 500)}`;
    })
    .join("\n\n");
}

async function fetchHtmlText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": BROWSER_UA },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);
  $("script, style, nav, footer, header, aside, form").remove();

  const article = $("article").first();
  const main = $("main").first();
  const root = article.length ? article : main.length ? main : $("body");
  const text = root.text().replace(/\s+/g, " ").trim();
  return text.slice(0, 30000);
}
