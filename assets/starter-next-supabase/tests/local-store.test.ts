import { beforeEach, describe, expect, it } from "vitest";
import type { AppUser } from "@/lib/contracts";
import { localRecordStore, resetLocalStoreForTests } from "@/lib/records/local-store";

const admin: AppUser = { id: "test-admin", email: "admin@example.com", role: "admin" };

describe("localRecordStore", () => {
  beforeEach(() => resetLocalStoreForTests());

  it("paginates records", async () => {
    const page = await localRecordStore.list(1, 1);
    expect(page.items).toHaveLength(1);
    expect(page.total).toBe(2);
  });

  it("blocks deletion of protected records", async () => {
    const all = await localRecordStore.list(1, 10);
    const protectedItem = all.items.find((item) => item.isProtected);
    await expect(localRecordStore.safeDelete({ ids: [protectedItem!.id], reason: "Kiểm tra xóa", actor: admin })).rejects.toThrow("được bảo vệ");
  });

  it("archives an audit entry after safe deletion", async () => {
    await localRecordStore.create({ name: "Hồ sơ thứ ba", note: "", isProtected: false }, admin);
    const all = await localRecordStore.list(1, 10);
    const deletable = all.items.find((item) => !item.isProtected);
    const result = await localRecordStore.safeDelete({ ids: [deletable!.id], reason: "Xóa dữ liệu nhập thử", actor: admin });
    const audits = await localRecordStore.listAudits(1, 10);
    expect(result.deleted).toBe(1);
    expect(audits.items[0]).toMatchObject({ action: "record.delete_safe", actorEmail: admin.email });
  });
});
