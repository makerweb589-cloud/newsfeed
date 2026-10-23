"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { readApiResponse } from "../lib/read-api-response";

function statusOf(item) {
  const value = String(item?.status || item?.state || "pending").toLowerCase();
  return value.includes("complete") || value.includes("approved") ? "completed" : "pending";
}

export default function OverviewPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/demo-requests", { cache: "no-store" });
      const data = await readApiResponse(response, "Could not read the latest overview from the server.");
      if (!response.ok || data?.success === false) throw new Error(data?.message || "Could not load the latest overview.");
      const list = Array.isArray(data) ? data : (data.requests || data.data || data.items || []);
      setRequests(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err?.message || "Could not load the latest overview.");
      setRequests([]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadOverview(); }, [loadOverview]);

  const stats = useMemo(() => {
    const completed = requests.filter((item) => statusOf(item) === "completed").length;
    return { total: requests.length, completed, pending: requests.length - completed };
  }, [requests]);

  const recent = useMemo(() => [...requests].sort((a, b) => new Date(b.createdAt || b.created_at || b.timestamp || 0) - new Date(a.createdAt || a.created_at || a.timestamp || 0)).slice(0, 5), [requests]);

  return (
    <main className="nexa-page nexa-overview-page">
      <section className="nexa-page-hero overview-hero">
        <div className="nexa-page-hero-copy"><span className="section-label">NEXA / OVERVIEW</span><p className="nexa-kicker"><span className="status-dot" /> YOUR NEXT CHAPTER STARTS HERE</p><h1>Clarity for the <span>next step.</span></h1><p>See the latest demo enquiries and a quick snapshot of what is happening across your Nexa workspace.</p><div className="nexa-page-actions"><Link href="/dashboard" className="button button-dark">Open dashboard <span aria-hidden="true">↗</span></Link><button className="button overview-refresh" type="button" onClick={loadOverview} disabled={loading}>{loading ? "Refreshing…" : "Refresh overview ↻"}</button></div></div>
        <div className="overview-hero-art" aria-hidden="true"><div className="overview-art-ring ring-one" /><div className="overview-art-ring ring-two" /><div className="overview-art-core">N<span>✳</span></div><div className="overview-art-note note-top">Simple insights</div><div className="overview-art-note note-bottom">Made for momentum</div></div>
      </section>

      <section className="overview-section-head"><div><span className="section-label">AT A GLANCE</span><h2>Your request summary</h2><p>A live summary based on the records returned by your existing demo-request endpoint.</p></div><span className="overview-live-badge"><i /> {loading ? "Updating" : "Latest data"}</span></section>
      <section className="overview-stats-grid" aria-label="Overview statistics">
        <article className="overview-stat-card"><div className="overview-stat-top"><span>Total requests</span><span className="overview-stat-icon">↗</span></div><strong>{loading ? "—" : stats.total}</strong><p>All enquiries received</p><div className="overview-stat-track"><span style={{ width: stats.total ? "100%" : "0%" }} /></div></article>
        <article className="overview-stat-card"><div className="overview-stat-top"><span>Pending</span><span className="overview-stat-icon">◷</span></div><strong>{loading ? "—" : stats.pending}</strong><p>Waiting for follow-up</p><div className="overview-stat-track"><span style={{ width: stats.total ? `${(stats.pending / stats.total) * 100}%` : "0%" }} /></div></article>
        <article className="overview-stat-card"><div className="overview-stat-top"><span>Completed</span><span className="overview-stat-icon">✓</span></div><strong>{loading ? "—" : stats.completed}</strong><p>Marked as completed</p><div className="overview-stat-track"><span style={{ width: stats.total ? `${(stats.completed / stats.total) * 100}%` : "0%" }} /></div></article>
      </section>

      <section className="overview-content-grid">
        <article className="overview-recent-card"><div className="overview-card-heading"><div><span className="section-label">RECENT ACTIVITY</span><h2>Latest enquiries</h2></div><Link href="/dashboard">View all <span aria-hidden="true">→</span></Link></div>
          {error ? <div className="dashboard-error" role="alert">{error}</div> : loading ? <div className="overview-empty">Loading the latest requests…</div> : recent.length === 0 ? <div className="overview-empty"><span className="overview-empty-symbol">✳</span><h3>Nothing here just yet</h3><p>When someone submits a demo request on the Home page, it will show up here.</p><Link href="/#demo" className="text-link">Go to the demo form →</Link></div> : <div className="overview-recent-list">{recent.map((item, index) => { const status = statusOf(item); return <div className="overview-recent-row" key={item.id || item.requestId || item.createdAt || index}><div className="overview-person-mark">{String(item.name || item.fullName || "N").trim().charAt(0).toUpperCase()}</div><div className="overview-person-info"><strong>{item.name || item.fullName || "New enquiry"}</strong><span>{item.company || item.email || "Website enquiry"}</span></div><span className={`status-pill ${status === "completed" ? "status-completed" : "status-pending"}`}>{status === "completed" ? "COMPLETED" : "PENDING"}</span></div>; })}</div>}
        </article>
        <aside className="overview-next-card"><span className="overview-next-spark">✳</span><span className="section-label">A SIMPLE NEXT STEP</span><h2>Keep the good ideas moving.</h2><p>Use the dashboard to review every enquiry, filter requests by status, and follow up with the people who reached out.</p><Link href="/dashboard" className="overview-next-link">Manage requests <span aria-hidden="true">↗</span></Link><div className="overview-next-footer"><span className="overview-next-dot" /> Your workspace is ready</div></aside>
      </section>
      <p className="dashboard-disclaimer overview-disclaimer">Overview figures reflect the data returned by <code>/api/demo-requests</code>. This page does not change request status.</p>
    </main>
  );
}
