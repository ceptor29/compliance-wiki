import Link from "next/link";
import { getAllFrameworks } from "../../lib/data";

export const dynamic = "force-dynamic";

export default async function FrameworksPage() {
  const allFrameworks = await getAllFrameworks();
  const categories = [...new Set(allFrameworks.map((f) => f.category))];

  return (
    <div>
      <h1>Compliance Frameworks</h1>
      <p className="muted">
        {allFrameworks.length} frameworks and regulations tracked. Adding a new
        framework is just a data entry — no code changes needed.
      </p>

      {categories.map((category) => (
        <div key={category} className="category-block">
          <h2 className="category-title">{category}</h2>
          <div className="card-grid">
            {allFrameworks
              .filter((f) => f.category === category)
              .map((f) => (
                <Link key={f.id} href={`/frameworks/${f.slug}`} className="card">
                  <h3>{f.name}</h3>
                  <p className="issuer">{f.issuer}</p>
                  <p className="muted">{f.description}</p>
                </Link>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
