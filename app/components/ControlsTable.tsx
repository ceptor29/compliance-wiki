"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Control } from "../../db/schema";

type Props = { controls: Control[] };

type SortKey = "controlId" | "title" | "domain";
type SortDir = "asc" | "desc";

export default function ControlsTable({ controls }: Props) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("controlId");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? controls.filter(
          (c) =>
            c.controlId.toLowerCase().includes(q) ||
            c.title.toLowerCase().includes(q) ||
            (c.domain ?? "").toLowerCase().includes(q)
        )
      : controls;

    return [...list].sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      const cmp = String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [controls, query, sortKey, sortDir]);

  function toggle(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function sortArrow(key: SortKey) {
    if (key !== sortKey) return "↕";
    return sortDir === "asc" ? "↑" : "↓";
  }

  return (
    <div>
      <input
        type="search"
        className="search-input table-search"
        placeholder="Search controls…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search controls"
      />
      <table className="table sortable">
        <thead>
          <tr>
            <th>
              <button type="button" className="th-sort" onClick={() => toggle("controlId")}>
                ID <span className="sort-arrow">{sortArrow("controlId")}</span>
              </button>
            </th>
            <th>
              <button type="button" className="th-sort" onClick={() => toggle("title")}>
                Title <span className="sort-arrow">{sortArrow("title")}</span>
              </button>
            </th>
            <th>
              <button type="button" className="th-sort" onClick={() => toggle("domain")}>
                Domain <span className="sort-arrow">{sortArrow("domain")}</span>
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={3} className="muted">
                No controls match your search.
              </td>
            </tr>
          ) : (
            filtered.map((c) => (
              <tr key={c.id} className="row-hover">
                <td>
                  <Link href={`/controls/${c.id}`}>{c.controlId}</Link>
                </td>
                <td>{c.title}</td>
                <td>{c.domain ?? "—"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <p className="muted table-count">
        {filtered.length} of {controls.length} controls
      </p>
    </div>
  );
}
