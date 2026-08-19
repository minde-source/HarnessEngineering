import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { friendlyError } from "@/lib/api";
import { recordStore } from "@/lib/records/backend";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const url = new URL(request.url);
    const result = await recordStore().listAudits(Number(url.searchParams.get("page")), Number(url.searchParams.get("pageSize")));
    return NextResponse.json(result);
  } catch (error) {
    return friendlyError(error, "Chưa thể tải lịch sử thao tác.");
  }
}
