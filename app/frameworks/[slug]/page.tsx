import Link from "next/link";
import { notFound } from "next/navigation";
import { getFrameworkControls, getFrameworkSources, getFrameworkBySlug } from "../../../lib/data";
import ControlsTable from "../../components/ControlsTable";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const framework = await getFrameworkBySlug(slug);
  return {
    title: framework ? `${framework.name} — Compliance Wiki` : "Framework — Compliance Wiki",
    description: framework?.description,
  };
}

export default async function FrameworkPage({ params }: PageProps<"/frameworks/[slug]">) {
  const { slug } = await params;
  const data = await getFrameworkControls(slug);
  const sourcesData = await getFrameworkSources(slug);

  if (!data) notFound();

  const { framework, controls } = data;

  return (
    <div>
      <Link href="/frameworks" className="back-link">
        ← All frameworks
      </Link>
      <h1>{framework.name}</h1>
      <p className="issuer">
        Issuer: {framework.issuer}
        {framework.sourceUrl && (
          <>
            {" · "}
            <a href={framework.sourceUrl} target="_blank" rel="noopener noreferrer">
              Official source
            </a>
          </>
        )}
      </p>
      <p>{framework.description}</p>

      <section>
        <h2>Controls ({controls.length})</h2>
        {controls.length === 0 ? (
          <p className="muted">
            Control catalog not yet populated. The AI collection job will parse
            and populate controls from the official source.
          </p>
        ) : (
          <ControlsTable controls={controls} />
        )}
      </section>

      {sourcesData && sourcesData.sources.length > 0 && (
        <section>
          <h2>Monitored sources</h2>
          <ul className="change-list">
            {sourcesData.sources.map((s) => (
              <li key={s.id}>
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.name}
                </a>{" "}
                <span className="muted">({s.type})</span>
                {s.lastCheckedAt && (
                  <span className="muted"> — last checked {s.lastCheckedAt.toLocaleDateString()}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
