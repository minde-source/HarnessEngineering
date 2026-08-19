import { backendMode } from "@/lib/config";
import { localRecordStore } from "@/lib/records/local-store";
import { supabaseRecordStore } from "@/lib/records/supabase-store";

export function recordStore() {
  return backendMode() === "supabase" ? supabaseRecordStore : localRecordStore;
}
