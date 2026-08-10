"use client";

import { useActionState, useState } from "react";
import { adminLogin, adminLogout, type AdminState } from "../actions";

const initialState: AdminState = {};

export default function AdminBar({ canReview }: { canReview: boolean }) {
  const [state, formAction, pending] = useActionState(adminLogin, initialState);
  const [open, setOpen] = useState(false);

  if (canReview) {
    return (
      <form action={adminLogout} className="admin-bar">
        <span className="badge badge-reviewed">Admin</span>
        <button type="submit" className="btn btn-outline">
          Logout
        </button>
      </form>
    );
  }

  return (
    <div className="admin-bar">
      <button type="button" className="btn btn-outline" onClick={() => setOpen((o) => !o)}>
        Admin login
      </button>
      {open && (
        <form action={formAction} className="admin-login">
          <input
            type="password"
            name="password"
            placeholder="Admin password"
            required
            autoComplete="current-password"
          />
          <button type="submit" className="btn" disabled={pending}>
            {pending ? "Unlocking…" : "Unlock"}
          </button>
          {state.error && <span className="error">{state.error}</span>}
        </form>
      )}
    </div>
  );
}
