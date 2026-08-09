"use client";

import { useActionState } from "react";
import { subscribe, type SubscribeState } from "../actions";
import type { Framework } from "../../db/schema";

const initialState: SubscribeState = {};

export default function SubscribeForm({ frameworks }: { frameworks: Framework[] }) {
  const [state, formAction, pending] = useActionState(subscribe, initialState);

  return (
    <form action={formAction} className="subscribe-form">
      <input
        type="email"
        name="email"
        placeholder="you@company.com"
        required
        autoComplete="email"
      />
      <p className="form-label">Frameworks to follow:</p>
      <div className="checkbox-grid">
        {frameworks.map((f) => (
          <label key={f.id} className="checkbox-item">
            <input type="checkbox" name="framework" value={f.id} />
            {f.name}
          </label>
        ))}
      </div>
      <button type="submit" className="btn" disabled={pending}>
        {pending ? "Subscribing..." : "Subscribe"}
      </button>
      {state.ok && <p className="success">Subscribed! You&apos;ll get the next digest.</p>}
      {state.error && <p className="error">{state.error}</p>}
    </form>
  );
}
