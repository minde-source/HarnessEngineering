import type { AppUser, AuditItem, PageResult, RecordItem } from "@/lib/contracts";

export type CreateRecordInput = { name: string; note: string; isProtected: boolean };
export type SafeDeleteInput = { ids: string[]; reason: string; actor: AppUser };

export interface RecordStore {
  list(page: number, pageSize: number): Promise<PageResult<RecordItem>>;
  create(input: CreateRecordInput, actor: AppUser): Promise<RecordItem>;
  safeDelete(input: SafeDeleteInput): Promise<{ deleted: number }>;
  listAudits(page: number, pageSize: number): Promise<PageResult<AuditItem>>;
  exportAll(): Promise<RecordItem[]>;
}
