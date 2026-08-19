"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AppUser, AuditItem, PageResult, RecordItem } from "@/lib/contracts";

async function readJson<T>(response: Response): Promise<T> {
  const body = await response.json();
  if (!response.ok) throw new Error(body.errors?.[0] ?? "Không thể hoàn tất thao tác.");
  return body as T;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AppUser | null>(null);
  const [records, setRecords] = useState<PageResult<RecordItem> | null>(null);
  const [audits, setAudits] = useState<PageResult<AuditItem> | null>(null);
  const [page, setPage] = useState(1);
  const [auditPage, setAuditPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const loadRecords = useCallback(async (targetPage: number) => {
    const response = await fetch(`/api/records?page=${targetPage}&pageSize=10`, { cache: "no-store" });
    if (response.status === 401) { router.replace("/login"); return; }
    setRecords(await readJson<PageResult<RecordItem>>(response));
  }, [router]);

  const loadAudits = useCallback(async (targetPage: number) => {
    setAudits(await readJson<PageResult<AuditItem>>(await fetch(`/api/audits?page=${targetPage}&pageSize=10`, { cache: "no-store" })));
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const me = await readJson<{ user: AppUser }>(await fetch("/api/auth/me", { cache: "no-store" }));
        setUser(me.user);
        await loadRecords(1);
        if (me.user.role === "admin") await loadAudits(1);
      } catch {
        router.replace("/login");
      }
    })();
  }, [loadAudits, loadRecords, router]);

  async function createRecord(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setError(""); setMessage("");
    try {
      await readJson(await fetch("/api/records", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, note })
      }));
      setName(""); setNote(""); setPage(1); await loadRecords(1); await loadAudits(1);
      setMessage("Đã tạo hồ sơ.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Chưa thể tạo hồ sơ.");
    } finally { setBusy(false); }
  }

  async function deleteSelected() {
    if (!window.confirm(`Bạn chắc chắn muốn xóa ${selected.length} hồ sơ đã chọn?`)) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const result = await readJson<{ deleted: number }>(await fetch("/api/records/delete-safe", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: selected, reason })
      }));
      setSelected([]); setReason(""); await loadRecords(page); await loadAudits(1);
      setMessage(`Đã xóa an toàn ${result.deleted} hồ sơ và lưu lịch sử.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không thể xóa hồ sơ.");
    } finally { setBusy(false); }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  const pageCount = Math.max(1, Math.ceil((records?.total ?? 0) / (records?.pageSize ?? 10)));
  const auditPageCount = Math.max(1, Math.ceil((audits?.total ?? 0) / (audits?.pageSize ?? 10)));

  return (
    <main className="shell">
      <header className="topbar">
        <div><p className="eyebrow">HARNESS STARTER</p><h1>Quản lý hồ sơ mẫu</h1></div>
        <div className="user-box"><span>{user?.email}</span><button className="secondary" onClick={logout}>Đăng xuất</button></div>
      </header>

      {error && <div className="alert error">{error}</div>}
      {message && <div className="alert success">{message}</div>}

      {user?.role === "admin" && (
        <section className="card">
          <h2>Tạo hồ sơ</h2>
          <form className="form-grid" onSubmit={createRecord}>
            <label>Tên hồ sơ<input value={name} onChange={(event) => setName(event.target.value)} maxLength={120} required /></label>
            <label>Ghi chú<input value={note} onChange={(event) => setNote(event.target.value)} maxLength={500} /></label>
            <button className="primary" disabled={busy}>Thêm hồ sơ</button>
          </form>
        </section>
      )}

      <section className="card">
        <div className="section-heading">
          <div><h2>Danh sách hồ sơ</h2><p className="muted">Tổng cộng: {records?.total ?? 0}</p></div>
          {user?.role === "admin" && <a className="button-link" href="/api/records/export">Tải Excel</a>}
        </div>
        <div className="table-wrap"><table><thead><tr>{user?.role === "admin" && <th>Chọn</th>}<th>Tên</th><th>Ghi chú</th><th>Bảo vệ</th><th>Ngày tạo</th></tr></thead>
          <tbody>{records?.items.map((item) => <tr key={item.id}>
            {user?.role === "admin" && <td><input aria-label={`Chọn ${item.name}`} type="checkbox" disabled={item.isProtected} checked={selected.includes(item.id)} onChange={(event) => setSelected(event.target.checked ? [...selected, item.id] : selected.filter((id) => id !== item.id))} /></td>}
            <td>{item.name}</td><td>{item.note || "—"}</td><td>{item.isProtected ? "Có" : "Không"}</td><td>{new Date(item.createdAt).toLocaleString("vi-VN")}</td>
          </tr>)}</tbody></table></div>
        {!records?.items.length && <p className="empty">Chưa có hồ sơ.</p>}
        <div className="pagination"><button disabled={page <= 1} onClick={() => { const next = page - 1; setPage(next); void loadRecords(next); }}>Trang trước</button><span>Trang {page}/{pageCount}</span><button disabled={page >= pageCount} onClick={() => { const next = page + 1; setPage(next); void loadRecords(next); }}>Trang sau</button></div>
      </section>

      {user?.role === "admin" && (
        <section className="card danger-zone">
          <h2>Xóa hồ sơ đã chọn</h2>
          <p className="muted">Hệ thống kiểm tra lại quyền, hồ sơ bảo vệ và số hồ sơ còn lại trước khi xóa.</p>
          <label>Lý do xóa<input value={reason} onChange={(event) => setReason(event.target.value)} maxLength={300} placeholder="Ví dụ: Hồ sơ nhập thử" /></label>
          <button className="danger" disabled={busy || selected.length === 0 || reason.trim().length < 5} onClick={deleteSelected}>Xóa {selected.length} hồ sơ đã chọn</button>
        </section>
      )}

      {user?.role === "admin" && (
        <section className="card">
          <h2>Lịch sử thao tác</h2>
          <div className="table-wrap"><table><thead><tr><th>Thời gian</th><th>Người thực hiện</th><th>Thao tác</th><th>Lý do</th></tr></thead>
            <tbody>{audits?.items.map((item) => <tr key={item.id}><td>{new Date(item.createdAt).toLocaleString("vi-VN")}</td><td>{item.actorEmail}</td><td>{item.action === "record.create" ? "Tạo hồ sơ" : `Xóa ${item.targetIds.length} hồ sơ`}</td><td>{item.reason}</td></tr>)}</tbody></table></div>
          {!audits?.items.length && <p className="empty">Chưa có lịch sử thao tác.</p>}
          <div className="pagination"><button disabled={auditPage <= 1} onClick={() => { const next = auditPage - 1; setAuditPage(next); void loadAudits(next); }}>Trang trước</button><span>Trang {auditPage}/{auditPageCount}</span><button disabled={auditPage >= auditPageCount} onClick={() => { const next = auditPage + 1; setAuditPage(next); void loadAudits(next); }}>Trang sau</button></div>
        </section>
      )}
    </main>
  );
}
