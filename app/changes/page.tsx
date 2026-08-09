import Link from "next/link";
import { getRecentChanges } from "../../lib/data";
import { applyChangeAction, dismissChangeAction } from "../actions";

export const dynamic = "force-dynamic";

function diffOf(raw: string | null) {
  if (!raw) return null;
  try {
    const d = JSON.parse(raw);
    return { oldTitle: d.oldTitle ?? null, oldDescription: d.oldDescription ?? null };
  } catch {
    return null;
  }
}

export default async function ChangesPage() {
  const changes = await getRecentChanges(100);

  return (
    <div>
      <h1>Change Log</h1>
      <p className="muted">
        Every control change discovered across all monitored frameworks. Items
        flow from the daily AI collection job and stay flagged as{" "}
        <em>unreviewed</em> until a human confirms them. Use{" "}
        <strong>Apply</strong> to write the change into the control record, or{" "}
        <strong>Dismiss</strong> to mark it reviewed without applying.
      </p>

      {changes.length === 0 ? (
        <p className="muted">No changes yet — the daily collection job will populate this page.</p>
      ) : (
        <table className="table">
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
            {changes.map((c) => {
              const diff = diffOf(c.diffText);
              return (
                <tr key={c.id}>
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
                            <span className="muted">Title:</span> {diff.oldTitle} →{" "}
                            {c.newTitle}
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
                  <td>{c.reviewed ? "reviewed" : <span className="badge">unreviewed</span>}</td>
                  <td>
                    {!c.reviewed && (
                      <div className="action-group">
                        <form action={applyChangeAction.bind(null, c.id)}>
                          <button type="submit" className="btn">
                            Apply
                          </button>
                        </form>
                        <form action={dismissChangeAction.bind(null, c.id)}>
                          <button type="submit" className="btn btn-outline">
                            Dismiss
                          </button>
                        </form>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
