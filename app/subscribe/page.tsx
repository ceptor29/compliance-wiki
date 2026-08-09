import { getAllFrameworks } from "../../lib/data";
import SubscribeForm from "./SubscribeForm";

export const dynamic = "force-dynamic";

export default async function SubscribePage() {
  const frameworks = await getAllFrameworks();

  return (
    <div>
      <h1>Subscribe to change digests</h1>
      <p className="muted">
        Pick the frameworks you care about. When controls change, you get a
        digest email. (Email sending is wired up once you add a provider —
        Resend or Buttondown — and set the API key.)
      </p>
      <SubscribeForm frameworks={frameworks} />
    </div>
  );
}
