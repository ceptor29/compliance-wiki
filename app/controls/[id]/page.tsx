import Link from "next/link";
import { notFound } from "next/navigation";
import { getControlById } from "../../../lib/data";

export const dynamic = "force-dynamic";

export default async function ControlPage({ params }: PageProps<"/controls/[id]">) {
  const { id } = await params;
  const data = await getControlById(Number(id));

  if (!data) notFound();

  const { control, framework, changes } = data;

  return (
    <div>
      <Link href={`/frameworks/${framework?.slug ?? ""}`} className="back-link">
        ← {framework?.name ?? "Framework"}
      </Link>
      <h1>
        {control.controlId} — {control.title}
      </h1>
      <p className="issuer">
        {framework?.name} · version {control.version}
      </p>
      <p>{control.description}</p>

      <section>
        <h2>Change history ({changes.length})</h2>
        {changes.length === 0 ? (
          <p className="muted">No changes recorded for this control yet.</p>
        ) : (
          <ul className="change-list">
            {changes.map((c) => (
              <li key={c.id}>
                <span className={`badge badge-${c.type}`}>{c.type}</span>
                <span className="muted">{c.discoveredAt.toLocaleDateString()}</span>
                {!c.reviewed && <span className="badge">unreviewed</span>}
                <p>{c.summary}</p>
                {c.type === "updated" && c.newTitle && (
                  <p className="muted">
                    New: {c.newTitle}
                    {c.newDescription ? ` — ${c.newDescription.slice(0, 200)}` : ""}
                  </p>
                )}
                {c.sourceUrl && (
                  <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer" className="muted">
                    Source
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
