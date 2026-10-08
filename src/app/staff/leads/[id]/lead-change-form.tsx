"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const nextStatus: Record<string, string[]> = {
  NEW: ["CONTACTED"], CONTACTED: ["QUALIFYING", "LOST"],
  QUALIFYING: ["QUOTATION_PREPARING", "LOST"],
  QUOTATION_SENT: ["FOLLOW_UP"], FOLLOW_UP: ["WON", "LOST"],
  WON: ["CLOSED"], LOST: ["CLOSED"],
};

export function LeadChangeForm({ lead, canAssignSelf, membershipId }: {
  lead: { id: string; status: string; version: number; assignedTo: string | null };
  canAssignSelf: boolean; membershipId: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(() => crypto.randomUUID());

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    const body = Object.fromEntries([...form.entries()].filter(([, value]) => value !== ""));
    if (body.assignSelf) { body.assignee = membershipId; delete body.assignSelf; }
    if (body.dueAt) body.dueAt = new Date(String(body.dueAt)).toISOString();
    try {
      const response = await fetch(`/api/internal/v1/leads/${lead.id}/changes`, {
        method: "POST", headers: { "content-type": "application/json", "if-match": `"${lead.version}"`, "idempotency-key": retryKey },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        setError(response.status === 412 ? "This lead changed. Reload it and try again." : "The change could not be saved. Check the required follow-up and try again.");
        return;
      }
      setRetryKey(crypto.randomUUID());
      router.refresh();
    } catch { setError("Connection failed. Retry when online."); }
    finally { setBusy(false); }
  }

  return <form className="staff-form" onSubmit={submit}>
    <label>Status <select name="status" defaultValue=""><option value="">Keep current status</option>
      {(nextStatus[lead.status] ?? []).map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}
    </select></label>
    {canAssignSelf ? <label><input type="checkbox" name="assignSelf" value="yes" /> Assign to me</label> : null}
    <label>Next action <input name="nextAction" minLength={2} maxLength={500} placeholder="What needs to happen next?" /></label>
    <label>Due date and time <input type="datetime-local" name="dueAt" /></label>
    <label>Reason for loss or change <input name="reason" minLength={2} maxLength={500} /></label>
    <label>Outcome evidence <input name="evidence" minLength={2} maxLength={500} /></label>
    {error ? <p className="staff-error" role="alert">{error}</p> : null}
    <button className="dk-button dk-button-primary" type="submit" disabled={busy}>{busy ? "Saving…" : "Save change"}</button>
  </form>;
}
