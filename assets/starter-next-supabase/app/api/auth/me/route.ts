import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { friendlyError } from "@/lib/api";

export async function GET() {
  try {
    return NextResponse.json({ user: await requireUser() });
  } catch (error) {
    return friendlyError(error);
  }
}
