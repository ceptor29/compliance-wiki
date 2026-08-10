"use client";

import { useMemo, useState, useOptimistic, useTransition } from "react";
import Link from "next/link";
import { applyChangeAction, dismissChangeAction } from "../actions";

export type ChangeItem = {
  id: number;
  type: string;
  summary: string;
  diffText: string | null;
  newTitle: string | null;
  newDescription: string | null;
  newDomain: string | null;
  discoveredAt: Date;
  reviewed: boolean;
  controlId: number;
  controlIdText: string;
  controlTitle: string;
  frameworkId: number;
  frameworkSlug: string;
  frameworkName: string;
};

type Props = { changes: ChangeItem[]; canReview: boolean };

function diffOf(raw: string | null) {
  if (!raw) return null;
  try {
    const d = JSON.parse(raw);
    return { oldTitle: d.oldTitle ?? null, oldDescription: d.oldDescription ?? null };
  } catch {
    return null;
  }
}

export default function ChangesPanel({ changes, canReview }: Props) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [framework, setFramework] = useState("all");
  const [status, setStatus] = useState("all");
  const [toast, setToast] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [optimistic, addOptimistic] = useOptimistic<ChangeItem[], { id: number; action: "apply" | "dismiss" }>(
    changes,
    (state, update) =>
      state.map((c) =>
        c.id === update.id ? { ...c, reviewed: true } : c
      )
  );

  const frameworks = useMemo(
    () =>
      [...new Map(changes.map((c) => [c.frameworkSlug, c.frameworkName])).entries()].sort((a, b) =>
        a[1].localeCompare(b[1])
      ),
    [changes]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return optimistic.filter((c) => {
      if (type !== "all" && c.type !== type) return false;
      if (framework !== "all" && c.frameworkSlug !== framework) return false;
      if (status === "unreviewed" && c.reviewed) return false;
      if (status === "reviewed" && !c.reviewed) return false;
      if (
        q &&
        !c.controlIdText.toLowerCase().includes(q) &&
        !c.controlTitle.toLowerCase().includes(q) &&
        !c.summary.toLowerCase().includes(q) &&
        !c.frameworkName.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [optimistic, query, type, framework, status]);

  const counts = useMemo(
    () => ({
      all: changes.length,
      unreviewed: changes.filter((c) => !c.reviewed).length,
    }),
    [changes]
  );

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2500);
  }

  function review(id: number, action: "apply" | "dismiss") {
    startTransition(() => {
      addOptimistic({ id, action });
      if (action === "apply") {
        applyChangeAction(id);
        showToast("Change applied");
      } else {
        dismissChangeAction(id);
        showToast("Change dismissed");
      }
    });
  }

  return (
    <div>
      <div className="toolbar">
        <input
          type="search"
          className="search-input"
          placeholder="Search controls, summaries…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search changes"
        />
        <select
          className="select-input"
          value={type}
          onChange={(e) => setType(e.target.value)}
          aria-label="Filter by change type"
        >
          <option value="all">All types</option>
          <option value="new">New</option>
          <option value="updated">Updated</option>
          <option value="retired">Retired</option>
        </select>
        <select
          className="select-input"
          value={framework}
          onChange={(e) => setFramework(e.target.value)}
          aria-label="Filter by framework"
        >
          <option value="all">All frameworks</option>
          {frameworks.map(([slug, name]) => (
            <option key={slug} value={slug}>
              {name}
            </option>
          ))}
        </select>
        <select
          className="select-input"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter by review status"
        >
          <option value="all">All statuses</option>
          <option value="unreviewed">Unreviewed ({counts.unreviewed})</option>
          <option value="reviewed">Reviewed</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="muted">No changes match your filters.</p>
      ) : (
        <table className="table sortable">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Framework</th>
              <th>Control</th>
              <th>Summary / Diff</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const diff = diffOf(c.diffText);
              const busy = isPending;
              return (
                <tr key={c.id} className={c.reviewed ? "row-reviewed" : "row-hover"}>
                  <td>{c.discoveredAt.toLocaleDateString()}</td>
                  <td>
                    <span className={`badge badge-${c.type}`}>{c.type}</span>
                  </td>
                  <td>
                    <Link href={`/frameworks/${c.frameworkSlug}`}>{c.frameworkName}</Link>
                  </td>
                  <td>
                    <Link href={`/controls/${c.controlId}`}>
                      {c.controlIdText} {c.controlTitle}
                    </Link>
                  </td>
                  <td>
                    <p className="muted">{c.summary}</p>
                    {diff && (
                      <div className="diff-block">
                        {diff.oldTitle !== c.newTitle && (
                          <p>
                            <span className="muted">Title:</span> {diff.oldTitle} → {c.newTitle}
                          </p>
                        )}
                        {diff.oldDescription !== c.newDescription && c.newDescription && (
                          <p>
                            <span className="muted">Description:</span>{" "}
                            {diff.oldDescription?.slice(0, 120) ?? "—"} →{" "}
                            {c.newDescription.slice(0, 120)}
                            {c.newDescription.length > 120 ? "…" : ""}
                          </p>
                        )}
                      </div>
                    )}
                  </td>
                  <td>
                    {c.reviewed ? (
                      <span className="badge badge-reviewed">reviewed</span>
                    ) : (
                      <span className="badge badge-unreviewed">unreviewed</span>
                    )}
                  </td>
                  <td>
                    {!c.reviewed && canReview && (
                      <div className="action-group">
                        <button
                          type="button"
                          className="btn"
                          disabled={busy}
                          onClick={() => review(c.id, "apply")}
                        >
                          Apply
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline"
                          disabled={busy}
                          onClick={() => review(c.id, "dismiss")}
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
