const FEEDS = [
  { url: "https://feeds.bbci.co.uk/news/rss.xml", source: "BBC News", category: "World", weight: 5 },
  { url: "https://feeds.bbci.co.uk/news/world/rss.xml", source: "BBC News", category: "World", weight: 5 },
  { url: "https://feeds.bbci.co.uk/news/business/rss.xml", source: "BBC News", category: "Business", weight: 4 },
  { url: "https://feeds.bbci.co.uk/news/technology/rss.xml", source: "BBC News", category: "Technology", weight: 4 },
  { url: "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml", source: "BBC News", category: "Science", weight: 3 },
  { url: "https://www.aljazeera.com/xml/rss/all.xml", source: "Al Jazeera", category: "World", weight: 4 },
  { url: "https://feeds.npr.org/1001/rss.xml", source: "NPR", category: "World", weight: 3 },
];

function decode(value = "") {
  return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
function tag(xml, name) {
  const match = xml.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i"));
  return match ? decode(match[1]) : "";
}
function imageFrom(xml) {
  const candidates = [
    xml.match(/<media:thumbnail[^>]+url=["']([^"']+)["']/i)?.[1],
    xml.match(/<media:content[^>]+url=["']([^"']+)["']/i)?.[1],
    xml.match(/<enclosure[^>]+url=["']([^"']+)["']/i)?.[1],
    xml.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1],
    xml.match(/<image>\s*<url>([\s\S]*?)<\/url>/i)?.[1],
  ];
  const image = candidates.find((v) => v && /^https?:\/\//i.test(v));
  return image ? decode(image) : "";
}
function parseFeed(xml, feed) {
  const entries = xml.match(/<item(?:\s[^>]*)?>[\s\S]*?<\/item>/gi) || xml.match(/<entry(?:\s[^>]*)?>[\s\S]*?<\/entry>/gi) || [];
  return entries.map((entry) => {
    const title = tag(entry, "title");
    const description = tag(entry, "description") || tag(entry, "summary") || tag(entry, "content:encoded");
    const content = tag(entry, "content:encoded") || description;
    const rawLink = entry.match(/<link[^>]*href=["']([^"']+)["'][^>]*\/?\s*>/i)?.[1] || tag(entry, "link") || tag(entry, "guid");
    const url = decode(rawLink);
    const publishedAt = tag(entry, "pubDate") || tag(entry, "published") || tag(entry, "updated") || tag(entry, "dc:date");
    const date = new Date(publishedAt);
    return { title, description: description.slice(0, 340), content: content.slice(0, 9000), url, image: imageFrom(entry), source: feed.source, category: feed.category, publishedAt: Number.isNaN(date.getTime()) ? "" : date.toISOString(), _weight: feed.weight };
  }).filter((article) => article.title && /^https?:\/\//i.test(article.url));
}

export default async function handler(req, res) {
  const mode = (req.query.mode || "home").toString().toLowerCase();
  const q = (req.query.q || "").toString().trim().toLowerCase();
  const requestedUrl = (req.query.url || "").toString().trim();
  try {
    const responses = await Promise.all(FEEDS.map(async (feed) => {
      try {
        const response = await fetch(feed.url, { headers: { "User-Agent": "NexaNews/1.0 (+public RSS reader)", "Accept": "application/rss+xml, application/xml, text/xml, */*" }, signal: AbortSignal.timeout(9000) });
        if (!response.ok) return [];
        const xml = await response.text();
        return parseFeed(xml, feed);
      } catch { return []; }
    }));
    const unique = new Map();
    for (const article of responses.flat()) {
      const key = article.url.split("?")[0];
      if (!unique.has(key)) unique.set(key, article);
    }
    let articles = [...unique.values()];
    if (requestedUrl) {
      const wanted = requestedUrl.split("#")[0];
      const article = articles.find((item) => item.url === wanted || item.url.split("?")[0] === wanted.split("?")[0]);
      if (!article) res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120"); return res.status(404).json({ success: false, message: "This story is no longer available in the publisher feed.", article: null });
      const { _weight, ...safeArticle } = article;
      res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600"); return res.status(200).json({ success: true, article: safeArticle });
    }
    const now = Date.now();
    const hoursOld = (a) => a.publishedAt ? Math.max(0, (now - new Date(a.publishedAt).getTime()) / 3600000) : 120;
    articles = articles.map((a) => ({ ...a, _score: a._weight * 2 + Math.max(0, 48 - hoursOld(a)) / 8 + (a.image ? 0.25 : 0) }));
    if (q) articles = articles.filter((a) => `${a.title} ${a.description} ${a.source} ${a.category}`.toLowerCase().includes(q));
    if (mode === "explore") {
      // Prioritize recent stories, then shuffle within a rolling group for discovery.
      articles.sort((a, b) => (hoursOld(a) - hoursOld(b)) || (Math.random() - 0.5));
    } else if (mode === "trending") {
      articles.sort((a, b) => b._score - a._score);
    } else {
      articles.sort((a, b) => (hoursOld(a) - hoursOld(b)) || (b._score - a._score));
    }
    articles = articles.slice(0, 36).map(({ _score, _weight, ...article }) => article);
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600"); return res.status(200).json({ success: true, mode, query: q, articles, updatedAt: new Date().toISOString(), sourceCount: FEEDS.length });
  } catch (error) {
    return res.status(502).json({ success: false, message: "The public news feeds are temporarily unavailable.", articles: [] });
  }
}
