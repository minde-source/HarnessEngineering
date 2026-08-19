"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password })
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.errors?.[0] ?? "Chưa thể đăng nhập.");
      router.replace("/");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Chưa thể đăng nhập.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-shell">
      <form className="card login-card" onSubmit={submit}>
        <p className="eyebrow">HARNESS STARTER</p>
        <h1>Đăng nhập quản trị</h1>
        <p className="muted">Dùng tài khoản local trong file môi trường hoặc tài khoản Supabase.</p>
        {error && <div className="alert error">{error}</div>}
        <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></label>
        <label>Mật khẩu<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" /></label>
        <button className="primary" disabled={loading}>{loading ? "Đang đăng nhập..." : "Đăng nhập"}</button>
      </form>
    </main>
  );
}
