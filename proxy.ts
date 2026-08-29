import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, isValidSessionToken } from "@/lib/auth";

const ADMIN_LOGIN_PATH = "/admin/login";

function isProtectedInquiriesApiRequest(
  pathname: string,
  method: string,
): boolean {
  const isInquiriesApi =
    pathname === "/api/inquiries" || pathname.startsWith("/api/inquiries/");
  if (!isInquiriesApi) return false;

  // 新規登録(公開フォームからの送信)のみ、未ログインでも呼び出せる
  const isPublicCreate = pathname === "/api/inquiries" && method === "POST";
  return !isPublicCreate;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (isProtectedInquiriesApiRequest(pathname, request.method)) {
    const authed = await isValidSessionToken(token);
    if (!authed) {
      return NextResponse.json({ error: "認証が必要です。" }, { status: 401 });
    }
    return NextResponse.next();
  }

  const isAdminPage = pathname.startsWith("/admin");
  const isLoginPage = pathname === ADMIN_LOGIN_PATH;
  if (isAdminPage && !isLoginPage) {
    const authed = await isValidSessionToken(token);
    if (!authed) {
      return NextResponse.redirect(new URL(ADMIN_LOGIN_PATH, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/inquiries", "/api/inquiries/:path*"],
};
