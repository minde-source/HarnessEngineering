import { NextResponse } from "next/server";
import writeXlsxFile, { type SheetData } from "write-excel-file/node";
import { requireAdmin } from "@/lib/auth";
import { friendlyError } from "@/lib/api";
import { recordStore } from "@/lib/records/backend";

export async function GET() {
  try {
    await requireAdmin();
    const items = await recordStore().exportAll();
    const rows = [
      ["STT", "Tên hồ sơ", "Ghi chú", "Được bảo vệ", "Ngày tạo"],
      ...items.map((item, index) => [index + 1, item.name, item.note, item.isProtected ? "Có" : "Không", item.createdAt])
    ];
    const sheet: SheetData = rows.map((row, rowIndex) => row.map((value) => ({
      value, fontWeight: rowIndex === 0 ? "bold" : undefined, wrap: true
    })));
    const buffer = await writeXlsxFile(sheet, {
      sheet: "Hồ sơ", columns: [{ width: 8 }, { width: 28 }, { width: 45 }, { width: 16 }, { width: 24 }], stickyRowsCount: 1
    }).toBuffer();
    const stamp = new Date().toISOString().slice(0, 16).replaceAll(":", "-");
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="records-${stamp}.xlsx"`,
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    return friendlyError(error, "Chưa thể xuất Excel.");
  }
}
