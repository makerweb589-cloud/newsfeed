"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import BrandLogo from "../components/BrandLogo";

function Icon({ children }) { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>; }
function prettyDate(value) { if (!value) return "Latest"; const d = new Date(value); return Number.isNaN(d.getTime()) ? "Latest" : d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }); }

function NewsArticleContent() {
  const router = useRouter();
  const url = router.isReady ? (Array.isArray(router.query.url) ? router.query.url[0] : router.query.url) || "" : "";
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!url) { setError("This story link is missing."); setLoading(false); return; }
    const controller = new AbortController();
    setLoading(true); setError("");
    fetch(`/api/news?url=${encodeURIComponent(url)}`, { signal: controller.signal, cache: "no-store" })
      .then(async (r) => { const data = await r.json(); if (!r.ok || !data.success) throw new Error(data.message || "This story could not be loaded."); return data.article; })
      .then(setArticle).catch((e) => { if (e.name !== "AbortError") setError(e.message || "Unable to load this story."); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [url]);

  return <main className="news-page news-article-page">
    <header className="news-header page-container"><Link href="/" className="news-wordmark" aria-label="Nexa News home"><BrandLogo className="news-logo"/><span>Nexa<span className="wordmark-news">News</span><i>.</i></span></Link><div className="news-header-right"><span className="edition-label"><span className="live-dot"/> STORY READER</span><Link href="/search" className="header-search-button" aria-label="Search news"><Icon><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></Icon></Link></div></header>
    <section className="article-shell page-container">
      <Link href="/" className="article-back"><Icon><path d="m15 18-6-6 6-6"/></Icon> Back to headlines</Link>
      {loading ? <div className="article-loading"><span className="article-loading-pulse"/><p>Opening this story…</p></div> : error ? <div className="news-empty article-error"><span className="empty-mark">!</span><h3>Story unavailable</h3><p>{error}</p><Link className="button button-primary" href="/">Back to headlines</Link></div> : article ? <article className="article-reader">
        <div className="article-reader-meta"><span className="story-source">{article.source || "News desk"}</span><span className="story-meta-dot"/><span>{article.category || "News"}</span><span className="story-meta-dot"/><time>{prettyDate(article.publishedAt)}</time></div>
        <h1>{article.title}</h1>
        {article.image ? <img className="article-hero-image" src={article.image} alt=""/> : null}
        <div className="article-body"><p className="article-lede">{article.content || article.description || "The publisher has not supplied a summary for this story."}</p><div className="article-attribution"><span className="article-attribution-mark"><BrandLogo className="article-brand-logo"/></span><div><strong>From {article.source || "the original publisher"}</strong><p>This page displays the headline and story text provided through the publisher’s public RSS feed. Some feeds contain only a short summary, so the full report may not be included here.</p></div></div><a className="button button-primary article-source-button" href={article.url} target="_blank" rel="noopener noreferrer">Continue to original report <Icon><path d="M14 4h6v6"/><path d="m20 4-9 9"/><path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6"/></Icon></a></div>
      </article> : null}
    </section>
    <footer className="news-footer page-container"><Link href="/" className="footer-wordmark">NexaNews<span>.</span></Link><span>A more considered way to keep up.</span><Link href="/about">About this project <Icon><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></Icon></Link></footer>
  </main>;
}

export default function NewsArticlePage() { return <NewsArticleContent />; }
