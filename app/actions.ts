"use server";

import { revalidatePath } from "next/cache";
import { db } from "../lib/db";
import { subscribers } from "../db/schema";
import { applyChange, dismissChange } from "../lib/apply";
import { isAdmin, setAdminSession, clearAdminSession } from "../lib/auth";

export type SubscribeState = { ok?: boolean; error?: string };
export type AdminState = { ok?: boolean; error?: string };

export async function applyChangeAction(changeId: number) {
  if (!(await isAdmin())) throw new Error("Unauthorized");
  await applyChange(changeId);
  revalidatePath("/changes");
}

export async function dismissChangeAction(changeId: number) {
  if (!(await isAdmin())) throw new Error("Unauthorized");
  await dismissChange(changeId);
  revalidatePath("/changes");
}

export async function adminLogin(
  prevState: AdminState,
  formData: FormData
): Promise<AdminState> {
  const pass = String(formData.get("password") ?? "").trim();
  const expected = process.env.ADMIN_PASS ?? "";

  if (!expected) return { error: "Admin access is not configured." };
  if (!pass || pass !== expected) return { error: "Incorrect password." };

  await setAdminSession(pass);
  return { ok: true };
}

export async function adminLogout() {
  await clearAdminSession();
}

export async function subscribe(
  prevState: SubscribeState,
  formData: FormData
): Promise<SubscribeState> {
  const email = String(formData.get("email") ?? "").trim();
  const ids = formData.getAll("framework").map((v) => Number(v));

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  try {
    await db
      .insert(subscribers)
      .values({ email, frameworkIds: ids })
      .onConflictDoUpdate({
        target: subscribers.email,
        set: { frameworkIds: ids, active: true },
      });
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { error: "Could not save subscription. Try again later." };
  }
}
