"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { readApiResponse } from "../lib/read-api-response";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function getStatus(request) {
  const value = String(request?.status || request?.state || "pending").toLowerCase();
  return value.includes("complete") || value.includes("approved") ? "completed" : "pending";
}

export default function DashboardPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/demo-requests", { cache: "no-store" });
      const data = await readApiResponse(response, "Could not read demo requests from the server.");
      if (!response.ok || data?.success === false) throw new Error(data?.message || "Could not load demo requests.");
      const list = Array.isArray(data) ? data : (data.requests || data.data || data.items || []);
      setRequests(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err?.message || "Could not load demo requests. Please try again.");
      setRequests([]);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadRequests(); }, [loadRequests]);

  const stats = useMemo(() => {
    const completed = requests.filter((item) => getStatus(item) === "completed").length;
    return { total: requests.length, completed, pending: requests.length - completed };
  }, [requests]);
  const visibleRequests = useMemo(() => filter === "all" ? requests : requests.filter((item) => getStatus(item) === filter), [requests, filter]);

  return (
    <main className="nexa-page nexa-dashboard-page">
      <section className="nexa-page-hero dashboard-page-hero">
        <div className="nexa-page-hero-copy">
          <span className="section-label">NEXA / DASHBOARD</span>
          <p className="nexa-kicker"><span className="status-dot" /> YOUR NEXT CHAPTER STARTS HERE</p>
          <h1>Good ideas.<br /><span>Better business.</span></h1>
          <p>One clear view of your demo requests, what needs attention, and the progress your business is making.</p>
          <div className="nexa-page-actions">
            <button className="button button-dark refresh-button" type="button" onClick={loadRequests} disabled={loading}>{loading ? "Refreshing…" : "Refresh requests ↻"}</button>
            <Link href="/overview" className="text-link">Explore overview <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
        <div className="overview-hero-art dashboard-hero-art" aria-hidden="true"><div className="overview-art-ring ring-one" /><div className="overview-art-ring ring-two" /><div className="overview-art-core">N<span>✳</span></div><div className="overview-art-note note-top">Every request</div><div className="overview-art-note note-bottom">One clear view</div></div>
      </section>

      <section className="dashboard-content-wrap">
        <section className="overview-section-head dashboard-section-head"><div><span className="section-label">YOUR WORKSPACE</span><h2>Demo requests at a glance</h2><p>Review and manage incoming demo requests from the Nexa website.</p></div><span className="overview-live-badge"><i /> {loading ? "Updating" : "Workspace summary"}</span></section>
        <section className="overview-stats-grid" aria-label="Request summary">
          <article className="overview-stat-card"><div className="overview-stat-top"><span>Total requests</span><span className="overview-stat-icon">↗</span></div><strong>{loading ? "—" : stats.total}</strong><p>All received enquiries</p><div className="overview-stat-track"><span style={{ width: stats.total ? "100%" : "0%" }} /></div></article>
          <article className="overview-stat-card"><div className="overview-stat-top"><span>Pending</span><span className="overview-stat-icon">◷</span></div><strong>{loading ? "—" : stats.pending}</strong><p>Awaiting follow-up</p><div className="overview-stat-track"><span style={{ width: stats.total ? `${(stats.pending / stats.total) * 100}%` : "0%" }} /></div></article>
          <article className="overview-stat-card"><div className="overview-stat-top"><span>Completed</span><span className="overview-stat-icon">✓</span></div><strong>{loading ? "—" : stats.completed}</strong><p>Marked as completed</p><div className="overview-stat-track"><span style={{ width: stats.total ? `${(stats.completed / stats.total) * 100}%` : "0%" }} /></div></article>
        </section>

        <section className="requests-panel dashboard-requests-panel" id="requests">
          <div className="requests-heading"><div><span className="section-label">INBOX</span><h2>All demo requests</h2><p>Requests submitted through the Nexa website.</p></div><label className="dashboard-filter"><span className="sr-only">Filter requests</span><select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">All requests</option><option value="pending">Pending</option><option value="completed">Completed</option></select></label></div>
          {error && <div className="dashboard-error" role="alert">{error}</div>}
          {loading ? <div className="dashboard-empty"><span>…</span><h3>Loading requests</h3><p>Please wait while the latest requests are fetched.</p></div> : !error && visibleRequests.length === 0 ? <div className="dashboard-empty"><span>✳</span><h3>No requests found</h3><p>{filter === "all" ? "New demo requests will appear here when submitted." : `There are no ${filter} requests right now.`}</p><button className="button button-dark" type="button" onClick={() => setFilter("all")}>Show all requests</button></div> : <div className="table-scroll"><table><thead><tr><th>NAME</th><th>EMAIL</th><th>COMPANY</th><th>MESSAGE</th><th>STATUS</th><th>SUBMITTED</th></tr></thead><tbody>{visibleRequests.map((item, index) => { const status = getStatus(item); return <tr key={item.id || item.requestId || item.createdAt || index}><td>{item.name || item.fullName || "—"}</td><td>{item.email || "—"}</td><td>{item.company || "—"}</td><td className="request-message">{item.message || item.description || "—"}</td><td><span className={`status-pill ${status === "completed" ? "status-completed" : "status-pending"}`}>{status === "completed" ? "COMPLETED" : "PENDING"}</span></td><td>{formatDate(item.createdAt || item.created_at || item.timestamp || item.submittedAt)}</td></tr>; })}</tbody></table></div>}
        </section>
        <p className="dashboard-disclaimer overview-disclaimer">Dashboard figures reflect the records returned by <code>/api/demo-requests</code>. Status updates require API support.</p>
      </section>
    </main>
  );
}
