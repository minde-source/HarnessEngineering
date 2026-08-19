import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { AppRole, AppUser } from "@/lib/contracts";
import { backendMode, requiredEnv } from "@/lib/config";
import { supabaseAdminClient, supabaseAuthClient } from "@/lib/supabase";

export const sessionCookieName = "harness_session";

type SessionPayload = { id: string; email: string; role: AppRole; exp: number; accessToken?: string };

function encode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signature(encodedPayload: string) {
  return createHmac("sha256", requiredEnv("SESSION_SECRET")).update(encodedPayload).digest("base64url");
}

export function createSession(payload: Omit<SessionPayload, "exp">) {
  const encoded = encode(JSON.stringify({ ...payload, exp: Date.now() + 8 * 60 * 60 * 1000 }));
  return `${encoded}.${signature(encoded)}`;
}

function readSession(raw: string): SessionPayload | null {
  const [encoded, suppliedSignature] = raw.split(".");
  if (!encoded || !suppliedSignature) return null;
  const expected = signature(encoded);
  const suppliedBuffer = Buffer.from(suppliedSignature);
  const expectedBuffer = Buffer.from(expected);
  if (suppliedBuffer.length !== expectedBuffer.length || !timingSafeEqual(suppliedBuffer, expectedBuffer)) return null;
  try {
    const payload = JSON.parse(decode(encoded)) as SessionPayload;
    return payload.exp > Date.now() ? payload : null;
  } catch {
    return null;
  }
}

export async function login(emailInput: string, password: string): Promise<{ user: AppUser; session: string } | null> {
  const email = emailInput.trim().toLowerCase();
  if (backendMode() === "local") {
    if (email !== requiredEnv("LOCAL_ADMIN_EMAIL").toLowerCase() || password !== requiredEnv("LOCAL_ADMIN_PASSWORD")) return null;
    const user: AppUser = { id: "local-admin", email, role: "admin" };
    return { user, session: createSession(user) };
  }

  const auth = supabaseAuthClient();
  const authResult = await auth.auth.signInWithPassword({ email, password });
  if (authResult.error || !authResult.data.user || !authResult.data.session) return null;
  const admin = supabaseAdminClient();
  const profile = await admin.from("profiles").select("role").eq("id", authResult.data.user.id).maybeSingle();
  if (profile.error || (profile.data?.role !== "admin" && profile.data?.role !== "staff")) return null;
  const user: AppUser = { id: authResult.data.user.id, email, role: profile.data.role };
  return { user, session: createSession({ ...user, accessToken: authResult.data.session.access_token }) };
}

export async function currentUser(): Promise<AppUser | null> {
  const raw = (await cookies()).get(sessionCookieName)?.value;
  if (!raw) return null;
  const session = readSession(raw);
  if (!session) return null;
  if (backendMode() === "local") return { id: session.id, email: session.email, role: session.role };
  if (!session.accessToken) return null;
  const result = await supabaseAuthClient().auth.getUser(session.accessToken);
  if (result.error || result.data.user?.id !== session.id) return null;
  const profile = await supabaseAdminClient().from("profiles").select("email,role").eq("id", session.id).maybeSingle();
  if (profile.error || (profile.data?.role !== "admin" && profile.data?.role !== "staff")) return null;
  return { id: session.id, email: profile.data.email || session.email, role: profile.data.role };
}

export async function requireUser(): Promise<AppUser> {
  const user = await currentUser();
  if (!user) throw new AuthError(401, "Vui lòng đăng nhập để tiếp tục.");
  return user;
}

export async function requireAdmin(): Promise<AppUser> {
  const user = await requireUser();
  if (user.role !== "admin") throw new AuthError(403, "Bạn không có quyền thực hiện thao tác này.");
  return user;
}

export class AuthError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}
