import { NextResponse } from "next/server";
import { AuthError } from "@/lib/auth";

export function friendlyError(error: unknown, fallback = "Không thể hoàn tất thao tác. Vui lòng thử lại.") {
  if (error instanceof AuthError) return NextResponse.json({ errors: [error.message] }, { status: error.status });
  console.error(error);
  return NextResponse.json({ errors: [fallback] }, { status: 500 });
}

export function parseJsonObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
