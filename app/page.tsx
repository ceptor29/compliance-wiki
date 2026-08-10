import Link from "next/link";
import { getAllFrameworks, getRecentChanges, getDashboardStats, getMostChangedFrameworks } from "../lib/data";
import FrameworkCard from "./components/FrameworkCard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [allFrameworks, recentChanges, stats, mostChanged] = await Promise.all([
    getAllFrameworks(),
    getRecentChanges(8),
    getDashboardStats(),
    getMostChangedFrameworks(5),
  ]);

  const categories = [...new Set(allFrameworks.map((f) => f.category))];

  return (
    <div>
      <section className="hero">
        <h1>One source of truth for compliance</h1>
        <p>
          Every compliance framework, every control, and every change — tracked,
          summarized, and searchable. Follow what changes so you never miss a
          requirement update.
        </p>
        <div className="hero-actions">
          <Link href="/frameworks" className="btn">
            Browse Frameworks
          </Link>
          <Link href="/changes" className="btn btn-outline">
            View Change Log
          </Link>
        </div>
      </section>

      <section className="stats-row">
        <div className="stat-card">
          <span className="stat-value">{stats.frameworkCount}</span>
          <span className="stat-label">Frameworks</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.controlCount}</span>
          <span className="stat-label">Controls tracked</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.sourceCount}</span>
          <span className="stat-label">Monitored sources</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{stats.changesThisWeek}</span>
          <span className="stat-label">Changes this week</span>
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>Frameworks</h2>
          <Link href="/frameworks" className="muted">
            View all →
          </Link>
        </div>
        {categories.map((category) => (
          <div key={category} className="category-block">
            <h3 className="category-title">{category}</h3>
            <div className="card-grid">
              {allFrameworks
                .filter((f) => f.category === category)
                .map((f) => (
                  <FrameworkCard key={f.id} framework={f} />
                ))}
            </div>
          </div>
        ))}
      </section>

      <section>
        <div className="section-head">
          <h2>Latest changes</h2>
          <Link href="/changes" className="muted">
            View all →
          </Link>
        </div>
        {recentChanges.length === 0 ? (
          <p className="muted">
            No changes tracked yet. The daily AI collection job will populate
            this feed.
          </p>
        ) : (
          <ul className="change-list">
            {recentChanges.map((c) => (
              <li key={c.id}>
                <span className={`badge badge-${c.type}`}>{c.type}</span>
                <Link href={`/frameworks/${c.frameworkSlug}`} className="muted">
                  {c.frameworkName}
                </Link>{" "}
                — {c.controlIdText} {c.controlTitle}
                <p className="muted">{c.summary}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {mostChanged.length > 0 && (
        <section>
          <h2>Most active frameworks</h2>
          <div className="top-list">
            {mostChanged.map((m, i) => (
              <Link key={m.frameworkSlug} href={`/frameworks/${m.frameworkSlug}`} className="top-item">
                <span className="top-rank">{i + 1}</span>
                <span className="top-name">
                  {m.frameworkName}
                  <span className="muted"> — {m.frameworkIssuer}</span>
                </span>
                <span className="badge">{m.changeCount} changes</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
