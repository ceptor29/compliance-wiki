import Link from "next/link";
import { getAllFrameworks, getRecentChanges } from "../lib/data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [allFrameworks, recentChanges] = await Promise.all([
    getAllFrameworks(),
    getRecentChanges(8),
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

      <section>
        <h2>Frameworks</h2>
        {categories.map((category) => (
          <div key={category} className="category-block">
            <h3 className="category-title">{category}</h3>
            <div className="card-grid">
              {allFrameworks
                .filter((f) => f.category === category)
                .map((f) => (
                  <Link key={f.id} href={`/frameworks/${f.slug}`} className="card">
                    <h4>{f.name}</h4>
                    <p className="issuer">{f.issuer}</p>
                    <p className="muted">{f.description}</p>
                  </Link>
                ))}
            </div>
          </div>
        ))}
      </section>

      <section>
        <h2>Latest changes</h2>
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
    </div>
  );
}
