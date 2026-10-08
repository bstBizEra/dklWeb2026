"use client";

import { useState } from "react";

type Source = { id: string; title: string; source_uri: string; source_revision: string; language: string; excerpt: string };

export function StaffKnowledgeSearch() {
  const [query, setQuery] = useState("");
  const [sources, setSources] = useState<Source[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function search(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setSources([]);
    setMessage("");
    try {
      const response = await fetch("/api/internal/v1/knowledge/search", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query }),
      });
      const result = await response.json();
      if (!result.ok) setMessage(result.error.message);
      else { setSources(result.data); setMessage(result.message); }
    } catch { setMessage("Verified knowledge is unavailable. Please ask a responsible staff member."); }
    finally { setBusy(false); }
  }

  return <>
    <form className="staff-form" onSubmit={search}>
      <label htmlFor="knowledge-query">Question or exact term</label>
      <input id="knowledge-query" value={query} onChange={(event) => setQuery(event.target.value)} minLength={2} maxLength={200} required />
      <button className="dk-button dk-button-primary" disabled={busy} type="submit">{busy ? "Searching" : "Search verified sources"}</button>
    </form>
    {message ? <p role="status">{message}</p> : null}
    {sources.length ? <ul className="staff-source-list">{sources.map((source) => <li key={source.id}>
      <h2>{source.title}</h2>
      <p>Revision {source.source_revision} · {source.language}</p>
      <blockquote>{source.excerpt}</blockquote>
      <p>Source reference: {source.source_uri}</p>
    </li>)}</ul> : null}
  </>;
}
