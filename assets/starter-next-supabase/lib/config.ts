export type BackendMode = "local" | "supabase";

export function backendMode(): BackendMode {
  return process.env.APP_BACKEND_MODE === "supabase" ? "supabase" : "local";
}

export function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required server configuration: ${name}`);
  return value;
}
