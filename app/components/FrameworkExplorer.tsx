"use client";

import { useMemo, useState } from "react";
import type { Framework } from "../../db/schema";
import FrameworkCard from "./FrameworkCard";

type Props = { frameworks: Framework[] };

export default function FrameworkExplorer({ frameworks }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const categories = useMemo(
    () => [...new Set(frameworks.map((f) => f.category))].sort(),
    [frameworks]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return frameworks.filter((f) => {
      const inCategory = category === "all" || f.category === category;
      const matches =
        q === "" ||
        f.name.toLowerCase().includes(q) ||
        f.issuer.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q);
      return inCategory && matches;
    });
  }, [frameworks, query, category]);

  const grouped = useMemo(() => {
    const map = new Map<string, Framework[]>();
    for (const f of filtered) {
      const list = map.get(f.category) ?? [];
      list.push(f);
      map.set(f.category, list);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <div>
      <div className="toolbar">
        <input
          type="search"
          className="search-input"
          placeholder="Search frameworks, issuers, keywords…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search frameworks"
        />
        <div className="dropdown">
          <select
            className="select-input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter by category"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="muted">No frameworks match your search.</p>
      ) : (
        grouped.map(([cat, list]) => (
          <div key={cat} className="category-block">
            <h2 className="category-title">
              {cat} <span className="count-pill">{list.length}</span>
            </h2>
            <div className="card-grid">
              {list.map((f) => (
                <FrameworkCard key={f.id} framework={f} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
