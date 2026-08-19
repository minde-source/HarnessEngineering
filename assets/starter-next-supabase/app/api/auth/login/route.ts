import { NextResponse } from "next/server";
import { login, sessionCookieName } from "@/lib/auth";
import { friendlyError, parseJsonObject } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const body = parseJsonObject(await request.json());
    const result = await login(String(body.email ?? ""), String(body.password ?? ""));
    if (!result) return NextResponse.json({ errors: ["Email hoặc mật khẩu chưa đúng."] }, { status: 401 });
    const response = NextResponse.json({ user: result.user });
    response.cookies.set(sessionCookieName, result.session, {
      httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 8 * 60 * 60
    });
    return response;
  } catch (error) {
    return friendlyError(error, "Chưa thể đăng nhập. Vui lòng kiểm tra cấu hình hệ thống.");
  }
}
