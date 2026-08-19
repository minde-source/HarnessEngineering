export type AppRole = "admin" | "staff";

export type AppUser = {
  id: string;
  email: string;
  role: AppRole;
};

export type RecordItem = {
  id: string;
  name: string;
  note: string;
  isProtected: boolean;
  createdAt: string;
};

export type AuditItem = {
  id: string;
  action: "record.create" | "record.delete_safe";
  actorEmail: string;
  targetIds: string[];
  reason: string;
  createdAt: string;
};

export type PageResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type ApiError = { errors: string[] };

export function normalizePagination(page: unknown, pageSize: unknown, maximum = 50) {
  const safePage = Math.max(Number(page) || 1, 1);
  const safePageSize = Math.min(Math.max(Number(pageSize) || 10, 1), maximum);
  return { page: safePage, pageSize: safePageSize };
}
