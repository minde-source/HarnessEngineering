import "server-only";
import type { AuditItem, RecordItem } from "@/lib/contracts";
import { normalizePagination } from "@/lib/contracts";
import type { RecordStore } from "@/lib/records/store";
import { supabaseAdminClient } from "@/lib/supabase";

type RecordRow = { id: string; name: string; note: string; is_protected: boolean; created_at: string };
type AuditRow = { id: string; action: AuditItem["action"]; actor_email: string; target_ids: string[]; reason: string; created_at: string };

function toRecord(row: RecordRow): RecordItem {
  return { id: row.id, name: row.name, note: row.note, isProtected: row.is_protected, createdAt: row.created_at };
}

function toAudit(row: AuditRow): AuditItem {
  return { id: row.id, action: row.action, actorEmail: row.actor_email, targetIds: row.target_ids, reason: row.reason, createdAt: row.created_at };
}

export const supabaseRecordStore: RecordStore = {
  async list(pageInput, pageSizeInput) {
    const { page, pageSize } = normalizePagination(pageInput, pageSizeInput);
    const from = (page - 1) * pageSize;
    const result = await supabaseAdminClient()
      .from("starter_records")
      .select("id,name,note,is_protected,created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, from + pageSize - 1);
    if (result.error) throw result.error;
    return { items: (result.data as RecordRow[]).map(toRecord), total: result.count ?? 0, page, pageSize };
  },

  async create(input, actor) {
    const client = supabaseAdminClient();
    const result = await client
      .from("starter_records")
      .insert({ name: input.name, note: input.note, is_protected: input.isProtected, created_by: actor.id })
      .select("id,name,note,is_protected,created_at")
      .single();
    if (result.error) throw result.error;
    const item = toRecord(result.data as RecordRow);
    const audit = await client.from("starter_audit_logs").insert({
      action: "record.create", actor_id: actor.id, actor_email: actor.email, target_ids: [item.id], reason: "Tạo hồ sơ"
    });
    if (audit.error) throw audit.error;
    return item;
  },

  async safeDelete({ ids, reason, actor }) {
    const result = await supabaseAdminClient().rpc("starter_safe_delete_records", {
      p_ids: [...new Set(ids)], p_actor_id: actor.id, p_actor_email: actor.email, p_reason: reason
    });
    if (result.error) throw result.error;
    return { deleted: Number(result.data) };
  },

  async listAudits(pageInput, pageSizeInput) {
    const { page, pageSize } = normalizePagination(pageInput, pageSizeInput);
    const from = (page - 1) * pageSize;
    const result = await supabaseAdminClient()
      .from("starter_audit_logs")
      .select("id,action,actor_email,target_ids,reason,created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, from + pageSize - 1);
    if (result.error) throw result.error;
    return { items: (result.data as AuditRow[]).map(toAudit), total: result.count ?? 0, page, pageSize };
  },

  async exportAll() {
    const result = await supabaseAdminClient()
      .from("starter_records")
      .select("id,name,note,is_protected,created_at")
      .order("created_at", { ascending: false })
      .limit(10000);
    if (result.error) throw result.error;
    return (result.data as RecordRow[]).map(toRecord);
  }
};
