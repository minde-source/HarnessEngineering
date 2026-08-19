import { NextResponse } from "next/server";
import { requireAdmin, requireUser } from "@/lib/auth";
import { friendlyError, parseJsonObject } from "@/lib/api";
import { recordStore } from "@/lib/records/backend";

export async function GET(request: Request) {
  try {
    await requireUser();
    const url = new URL(request.url);
    const result = await recordStore().list(Number(url.searchParams.get("page")), Number(url.searchParams.get("pageSize")));
    return NextResponse.json(result);
  } catch (error) {
    return friendlyError(error, "Chưa thể tải danh sách hồ sơ.");
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requireAdmin();
    const body = parseJsonObject(await request.json());
    const name = String(body.name ?? "").trim();
    const note = String(body.note ?? "").trim();
    if (name.length < 2 || name.length > 120) {
      return NextResponse.json({ errors: ["Tên hồ sơ phải có từ 2 đến 120 ký tự."] }, { status: 400 });
    }
    if (note.length > 500) return NextResponse.json({ errors: ["Ghi chú không được quá 500 ký tự."] }, { status: 400 });
    const item = await recordStore().create({ name, note, isProtected: body.isProtected === true }, actor);
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return friendlyError(error, "Chưa thể tạo hồ sơ.");
  }
}
