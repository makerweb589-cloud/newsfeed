"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import BrandLogo from "./BrandLogo";

function Icon({ name, size = 18 }) {
  const paths = {
    search: <><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/></>,
    arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    trend: <><path d="m3 17 6-6 4 3 8-8"/><path d="M15 6h6v6"/></>,
    globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18"/><path d="M12 3a15 15 0 0 0 0 18"/></>,
    refresh: <><path d="M20 7v5h-5"/><path d="M4 17v-5h5"/><path d="M5.5 9a7 7 0 0 1 11.8-2L20 12M4 12l2.7 5a7 7 0 0 0 11.8-2"/></>,
    external: <><path d="M14 4h6v6"/><path d="m20 4-9 9"/><path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6"/></>,
    bookmark: <><path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-4-6 4V4.5Z"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.globe}</svg>;
}

function formatDate(value) {
  if (!value) return "Latest";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Latest";
  const diff = Math.max(0, Date.now() - date.getTime());
  if (diff < 3600000) return `${Math.max(1, Math.floor(diff / 60000))}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function StoryCard({ story, featured = false, index = 0 }) {
  const [imageFailed, setImageFailed] = useState(false);
  const source = story.source || "News desk";
  const articleHref = `/article?url=${encodeURIComponent(story.url)}`;
  return <article className={`story-card edge-glow-target${featured ? " story-card--featured" : ""}`}>
    <Link className={`story-image${!story.image || imageFailed ? " story-image--placeholder" : ""}`} href={articleHref} aria-label={`Read ${story.title}`}>
      {story.image && !imageFailed ? <img src={story.image} alt="" loading={index < 2 ? "eager" : "lazy"} onError={() => setImageFailed(true)} /> : <span className="story-image-mark">N<span>.</span></span>}
      <span className="story-image-open"><Icon name="external" size={16}/></span>
    </Link>
    <div className="story-card-body">
      <div className="story-meta"><span className="story-source">{source}</span><span className="story-meta-dot"/><time>{formatDate(story.publishedAt)}</time></div>
      <h2><Link href={articleHref}>{story.title}</Link></h2>
      {story.description ? <p>{story.description}</p> : null}
      <div className="story-card-footer"><span className="story-category">{story.category || "World"}</span><Link href={articleHref} className="story-read-link">Read story <Icon name="arrow" size={15}/></Link></div>
    </div>
  </article>;
}

const pageCopy = {
  home: { eyebrow: "THE DAILY BRIEFING", title: <>The world, <span>in focus.</span></>, description: "A clearer view of the stories shaping today. Curated headlines from trusted newsrooms, all in one place.", label: "Recommended for you" },
  search: { eyebrow: "FIND YOUR STORY", title: <>Search the <span>headlines.</span></>, description: "Search recent headlines by topic, person, place, or keyword.", label: "Search results" },
  explore: { eyebrow: "FOLLOW YOUR CURIOSITY", title: <>Explore beyond <span>the obvious.</span></>, description: "Discover a fresh mix of current stories from around the world.", label: "Stories to explore" },
  trending: { eyebrow: "WHAT'S MOVING NOW", title: <>The stories <span>gaining momentum.</span></>, description: "A fast-moving view of recent headlines across world news, business, science, and technology.", label: "Trending now" },
};

export default function NewsFeed({ mode = "home" }) {
  const copy = pageCopy[mode] || pageCopy.home;
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [history, setHistory] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    try { setHistory(JSON.parse(localStorage.getItem("nexa-news-search-history") || "[]").slice(0, 8)); } catch { setHistory([]); }
  }, []);

  const loadStories = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams({ mode, ...(submittedQuery ? { q: submittedQuery } : {}) });
      const response = await fetch(`/api/news?${params.toString()}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || "News is temporarily unavailable.");
      setStories(Array.isArray(data.articles) ? data.articles : []);
    } catch (e) { setError(e.message || "Unable to load news. Please try again."); setStories([]); }
    finally { setLoading(false); }
  }, [mode, submittedQuery, refreshKey]);

  useEffect(() => { loadStories(); }, [loadStories]);

  function search(event) {
    event.preventDefault();
    const term = query.trim();
    if (!term) return;
    const next = [term, ...history.filter((item) => item.toLowerCase() !== term.toLowerCase())].slice(0, 8);
    setHistory(next);
    try { localStorage.setItem("nexa-news-search-history", JSON.stringify(next)); } catch {}
    setSubmittedQuery(term);
  }

  function useHistory(term) { setQuery(term); setSubmittedQuery(term); }
  const heading = mode === "search" && submittedQuery ? `Results for “${submittedQuery}”` : copy.label;
  const visibleStories = useMemo(() => stories, [stories]);

  return <main className={`news-page news-page--${mode}`}>
    <header className="news-header page-container">
      <Link href="/" className="news-wordmark" aria-label="Nexa News home"><BrandLogo className="news-logo"/><span>Nexa<span className="wordmark-news">News</span><i>.</i></span></Link>
      <div className="news-header-right"><span className="edition-label"><span className="live-dot"/> LIVE NEWS FEED</span><Link href="/search" className="header-search-button" aria-label="Search news"><Icon name="search" size={19}/></Link></div>
    </header>

    <section className="news-hero page-container">
      <div className="news-hero-copy"><span className="eyebrow"><span className="eyebrow-line"/>{copy.eyebrow}</span><h1>{copy.title}</h1><p>{copy.description}</p>
      {mode === "search" ? <form className="news-search-form" onSubmit={search}><Icon name="search" size={20}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search headlines, topics, people..." aria-label="Search news"/><button type="submit">Search <Icon name="arrow" size={16}/></button></form> : <div className="hero-actions"><Link className="button button-primary" href="/trending">See what's trending <Icon name="arrow" size={16}/></Link><span className="hero-small-note"><Icon name="globe" size={16}/> Headlines from public RSS feeds</span></div>}
      </div>
      <aside className="news-hero-aside"><span className="aside-index">N / 01</span><div className="aside-orbit"><span className="orbit-ring orbit-ring-one"/><span className="orbit-ring orbit-ring-two"/><span className="orbit-core">N<span>.</span></span><span className="orbit-point"/></div><span className="aside-caption">INDEPENDENT CURIOSITY.<br/>CONNECTED PERSPECTIVES.</span></aside>
    </section>

    {mode === "search" && history.length > 0 && !submittedQuery ? <section className="search-history page-container"><div className="search-history-heading"><h2><Icon name="clock" size={17}/> Recent searches</h2><button type="button" onClick={() => { setHistory([]); try { localStorage.removeItem("nexa-news-search-history"); } catch {} }}>Clear history</button></div><div className="history-chips">{history.map((term) => <button key={term} type="button" onClick={() => useHistory(term)}>{term}<Icon name="arrow" size={13}/></button>)}</div></section> : null}

    <section className="news-results page-container">
      <div className="section-topline"><div><span className="section-kicker">THE LATEST</span><h2>{heading}</h2></div><button className="refresh-button" type="button" onClick={() => setRefreshKey((v) => v + 1)} disabled={loading}><Icon name="refresh" size={16}/><span>{loading ? "Updating" : "Refresh"}</span></button></div>
      {mode !== "search" || !submittedQuery ? <div className="topic-strip"><span>ON THE RADAR</span><Link href="/explore">World <b>↗</b></Link><Link href="/explore">Business <b>↗</b></Link><Link href="/explore">Technology <b>↗</b></Link><Link href="/explore">Science <b>↗</b></Link></div> : null}
      {loading ? <div className="stories-grid story-skeleton-grid" aria-label="Loading news">{Array.from({length: 6}).map((_, i) => <div className="story-skeleton" key={i}><div/><span/><span/><span/></div>)}</div> : error ? <div className="news-empty"><span className="empty-mark">!</span><h3>We couldn't load the latest stories.</h3><p>{error} Check your connection and try again.</p><button type="button" className="button button-primary" onClick={() => setRefreshKey((v) => v + 1)}>Try again <Icon name="refresh" size={16}/></button></div> : visibleStories.length ? <div className="stories-grid">{visibleStories.map((story, i) => <StoryCard key={`${story.url}-${i}`} story={story} featured={mode === "home" && i === 0} index={i}/>)}</div> : <div className="news-empty"><span className="empty-mark"><Icon name="search" size={22}/></span><h3>{mode === "search" ? "No stories found" : "No headlines available right now"}</h3><p>{mode === "search" ? "Try a broader keyword or pick a recent search." : "The public news feeds may be temporarily unavailable."}</p>{mode === "search" && submittedQuery ? <button className="button button-primary" onClick={() => {setSubmittedQuery(""); setQuery("");}}>Clear search</button> : null}</div>}
      <p className="feed-disclaimer">Headlines are collected from public RSS feeds. Story content and reporting belong to their original publishers.</p>
    </section>

    <footer className="news-footer page-container"><Link href="/" className="footer-wordmark">NexaNews<span>.</span></Link><span>A more considered way to keep up.</span><Link href="/about">About this project <Icon name="arrow" size={14}/></Link></footer>
  </main>;
}
