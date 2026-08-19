import { randomUUID } from "node:crypto";
import type { AuditItem, RecordItem } from "@/lib/contracts";
import { normalizePagination } from "@/lib/contracts";
import type { RecordStore } from "@/lib/records/store";

type LocalState = { records: Map<string, RecordItem>; audits: AuditItem[] };

const globalState = globalThis as typeof globalThis & { __harnessStarterState?: LocalState };

function seedState(): LocalState {
  const now = new Date().toISOString();
  const records = [
    { id: randomUUID(), name: "Hồ sơ mẫu được bảo vệ", note: "Dòng này minh họa dữ liệu không được phép xóa.", isProtected: true, createdAt: now },
    { id: randomUUID(), name: "Hồ sơ mẫu có thể xóa", note: "Chọn dòng này để thử luồng xóa an toàn.", isProtected: false, createdAt: now }
  ];
  return { records: new Map(records.map((item) => [item.id, item])), audits: [] };
}

function state() {
  globalState.__harnessStarterState ??= seedState();
  return globalState.__harnessStarterState;
}

export const localRecordStore: RecordStore = {
  async list(pageInput, pageSizeInput) {
    const { page, pageSize } = normalizePagination(pageInput, pageSizeInput);
    const items = [...state().records.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const start = (page - 1) * pageSize;
    return { items: items.slice(start, start + pageSize), total: items.length, page, pageSize };
  },

  async create(input, actor) {
    const item: RecordItem = { id: randomUUID(), ...input, createdAt: new Date().toISOString() };
    state().records.set(item.id, item);
    state().audits.unshift({
      id: randomUUID(), action: "record.create", actorEmail: actor.email, targetIds: [item.id], reason: "Tạo hồ sơ", createdAt: item.createdAt
    });
    return item;
  },

  async safeDelete({ ids, reason, actor }) {
    const uniqueIds = [...new Set(ids)];
    const selected = uniqueIds.map((id) => state().records.get(id));
    if (selected.some((item) => !item)) throw new Error("Một hồ sơ đã thay đổi hoặc không còn tồn tại.");
    if (selected.some((item) => item?.isProtected)) throw new Error("Danh sách có hồ sơ được bảo vệ và không thể xóa.");
    if (state().records.size - uniqueIds.length < 1) throw new Error("Phải giữ lại ít nhất một hồ sơ.");
    for (const id of uniqueIds) state().records.delete(id);
    state().audits.unshift({
      id: randomUUID(), action: "record.delete_safe", actorEmail: actor.email, targetIds: uniqueIds, reason, createdAt: new Date().toISOString()
    });
    return { deleted: uniqueIds.length };
  },

  async listAudits(pageInput, pageSizeInput) {
    const { page, pageSize } = normalizePagination(pageInput, pageSizeInput);
    const items = state().audits;
    const start = (page - 1) * pageSize;
    return { items: items.slice(start, start + pageSize), total: items.length, page, pageSize };
  },

  async exportAll() {
    return [...state().records.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
};

export function resetLocalStoreForTests() {
  globalState.__harnessStarterState = seedState();
}
