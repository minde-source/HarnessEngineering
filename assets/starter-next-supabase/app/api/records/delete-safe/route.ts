import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { friendlyError, parseJsonObject } from "@/lib/api";
import { recordStore } from "@/lib/records/backend";

export async function POST(request: Request) {
  try {
    const actor = await requireAdmin();
    const body = parseJsonObject(await request.json());
    const ids = Array.isArray(body.ids) ? [...new Set(body.ids.map(String).filter(Boolean))] : [];
    const reason = String(body.reason ?? "").trim();
    if (ids.length === 0) return NextResponse.json({ errors: ["Vui lòng chọn ít nhất một hồ sơ."] }, { status: 400 });
    if (ids.length > 100) return NextResponse.json({ errors: ["Mỗi lần chỉ được xóa tối đa 100 hồ sơ."] }, { status: 400 });
    if (reason.length < 5 || reason.length > 300) {
      return NextResponse.json({ errors: ["Vui lòng nhập lý do từ 5 đến 300 ký tự."] }, { status: 400 });
    }
    return NextResponse.json(await recordStore().safeDelete({ ids, reason, actor }));
  } catch (error) {
    return friendlyError(error, "Không thể xóa. Có thể hồ sơ được bảo vệ, đã thay đổi, hoặc cần giữ lại ít nhất một hồ sơ.");
  }
}
