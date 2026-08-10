import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "admin_auth";
const HMAC_KEY = "compliance-wiki-admin";

function adminToken(pass: string) {
  return createHmac("sha256", HMAC_KEY).update(pass).digest("hex");
}

export async function isAdmin(): Promise<boolean> {
  const expected = adminToken(process.env.ADMIN_PASS ?? "");
  if (!expected) return false;

  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token || token.length !== expected.length) return false;

  try {
    return timingSafeEqual(Buffer.from(token, "utf8"), Buffer.from(expected, "utf8"));
  } catch {
    return false;
  }
}

export async function setAdminSession(pass: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, adminToken(pass), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24,
    path: "/",
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
