import { getRecentChanges } from "../../lib/data";
import { isAdmin } from "../../lib/auth";
import ChangesPanel from "../components/ChangesPanel";
import AdminBar from "../components/AdminBar";

export const dynamic = "force-dynamic";

export default async function ChangesPage() {
  const [changes, canReview] = await Promise.all([getRecentChanges(100), isAdmin()]);

  return (
    <div>
      <div className="section-head">
        <h1>Change Log</h1>
        <AdminBar canReview={canReview} />
      </div>
      <p className="muted">
        Every control change discovered across all monitored frameworks. Items
        flow from the daily AI collection job and stay flagged as{" "}
        <em>unreviewed</em> until the owner confirms them.
      </p>

      {changes.length === 0 ? (
        <p className="muted">No changes yet — the daily collection job will populate this page.</p>
      ) : (
        <ChangesPanel changes={changes} canReview={canReview} />
      )}
    </div>
  );
}
