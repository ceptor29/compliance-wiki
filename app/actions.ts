"use server";

import { revalidatePath } from "next/cache";
import { db } from "../lib/db";
import { subscribers } from "../db/schema";
import { applyChange, dismissChange } from "../lib/apply";

export type SubscribeState = { ok?: boolean; error?: string };

export async function applyChangeAction(changeId: number) {
  await applyChange(changeId);
  revalidatePath("/changes");
}

export async function dismissChangeAction(changeId: number) {
  await dismissChange(changeId);
  revalidatePath("/changes");
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
