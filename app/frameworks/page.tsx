import { getAllFrameworks } from "../../lib/data";
import FrameworkExplorer from "../components/FrameworkExplorer";

export const dynamic = "force-dynamic";

export default async function FrameworksPage() {
  const allFrameworks = await getAllFrameworks();

  return (
    <div>
      <h1>Compliance Frameworks</h1>
      <p className="muted">
        {allFrameworks.length} frameworks and regulations tracked. Adding a new
        framework is just a data entry — no code changes needed.
      </p>
      <FrameworkExplorer frameworks={allFrameworks} />
    </div>
  );
}
