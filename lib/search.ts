import * as cheerio from "cheerio";

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

const SEARCH_PROVIDER = (process.env.SEARCH_PROVIDER ?? "auto").toLowerCase();
const SEARCH_API_KEY = process.env.SEARCH_API_KEY ?? "";
const SEARXNG_URL = process.env.SEARXNG_URL ?? "";

function isCandidateUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (!/^https?:$/.test(u.protocol)) return false;
    const lower = u.hostname.toLowerCase();
    if (/(google\.|youtube\.|facebook\.|instagram\.|linkedin\.|twitter\.|x\.com|t\.co|bing\.com|duckduckgo\.com|mojeek\.com)/i.test(lower)) return false;
    if (/\.(pdf|docx?|pptx?|xlsx?|zip|png|jpe?g|gif|webp)(\?|#|$)/i.test(u.pathname)) return false;
    return true;
  } catch {
    return false;
  }
}

function dedupe(urls: string[]): string[] {
  const out: string[] = [];
  for (const u of urls) {
    if (isCandidateUrl(u) && !out.includes(u)) out.push(u);
  }
  return out;
}

export async function searchWeb(query: string): Promise<string[]> {
  if (SEARCH_API_KEY) {
    try {
      const apiResults = await searchWithApi(query);
      if (apiResults.length > 0) return apiResults;
    } catch {
      // fall through to HTML engines
    }
  }

  const htmlEngines = [searchDuckDuckGo, searchBing, searchMojeek];
  if (SEARXNG_URL) htmlEngines.push(searchSearxng);
  for (const fn of htmlEngines) {
    try {
      const results = await fn(query);
      if (results.length > 0) return results;
    } catch {
      // try next engine
    }
  }
  return [];
}

async function searchWithApi(query: string): Promise<string[]> {
  const providers = SEARCH_PROVIDER === "auto" ? ["tavily", "serper", "brave"] : [SEARCH_PROVIDER];
  for (const provider of providers) {
    try {
      const results =
        provider === "tavily"
          ? await searchTavily(query)
          : provider === "serper"
            ? await searchSerper(query)
            : await searchBrave(query);
      if (results.length > 0) return results;
    } catch {
      // try next provider
    }
  }
  return [];
}

async function searchTavily(query: string): Promise<string[]> {
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: SEARCH_API_KEY, query, max_results: 8 }),
  });
  if (!res.ok) throw new Error(`Tavily search failed: ${res.status}`);
  const data = (await res.json()) as { results?: { url: string }[] };
  return dedupe((data.results ?? []).map((r) => r.url));
}

async function searchSerper(query: string): Promise<string[]> {
  const res = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-KEY": SEARCH_API_KEY },
    body: JSON.stringify({ q: query, num: 8 }),
  });
  if (!res.ok) throw new Error(`Serper search failed: ${res.status}`);
  const data = (await res.json()) as { organic?: { link: string }[] };
  return dedupe((data.organic ?? []).map((r) => r.link));
}

async function searchBrave(query: string): Promise<string[]> {
  const res = await fetch(
    `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=8`,
    { headers: { "X-Subscription-Token": SEARCH_API_KEY, Accept: "application/json" } }
  );
  if (!res.ok) throw new Error(`Brave search failed: ${res.status}`);
  const data = (await res.json()) as { web?: { results?: { url: string }[] } };
  return dedupe((data.web?.results ?? []).map((r) => r.url));
}

async function searchDuckDuckGo(query: string): Promise<string[]> {
  const res = await fetch(
    `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
    { headers: { "User-Agent": BROWSER_UA }, redirect: "follow" }
  );
  if (!res.ok) throw new Error(`DuckDuckGo search failed: ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);
  const urls: string[] = [];
  $("a.result__a").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    let url: string | null = null;
    try {
      if (href.startsWith("http")) {
        url = new URL(href).searchParams.get("uddg")
          ? decodeURIComponent(new URL(href).searchParams.get("uddg")!)
          : href.split("#")[0];
      } else if (href.startsWith("//")) {
        url = `https:${href.split("#")[0]}`;
      }
    } catch {
      url = null;
    }
    if (url) urls.push(url);
  });
  return dedupe(urls);
}

async function searchBing(query: string): Promise<string[]> {
  const res = await fetch(`https://www.bing.com/search?q=${encodeURIComponent(query)}&count=10`, {
    headers: {
      "User-Agent": BROWSER_UA,
      "Accept-Language": "en-US,en;q=0.9",
    },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`Bing search failed: ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);
  const urls: string[] = [];
  $("li.b_algo h2 a").each((_, el) => {
    const href = $(el).attr("href");
    if (href) urls.push(href.split("#")[0]);
  });
  return dedupe(urls);
}

async function searchMojeek(query: string): Promise<string[]> {
  const res = await fetch(`https://www.mojeek.com/search?q=${encodeURIComponent(query)}`, {
    headers: { "User-Agent": BROWSER_UA },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`Mojeek search failed: ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);
  const urls: string[] = [];
  $("ul.results-standard li h2 a").each((_, el) => {
    const href = $(el).attr("href");
    if (href) urls.push(href);
  });
  return dedupe(urls);
}

async function searchSearxng(query: string): Promise<string[]> {
  const res = await fetch(
    `${SEARXNG_URL.replace(/\/$/, "")}/search?q=${encodeURIComponent(query)}&format=json`,
    { headers: { Accept: "application/json", "User-Agent": BROWSER_UA } }
  );
  if (!res.ok) throw new Error(`SearXNG search failed: ${res.status}`);
  const data = (await res.json()) as { results?: { url: string }[] };
  return dedupe((data.results ?? []).map((r) => r.url));
}
