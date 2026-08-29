import { NextRequest, NextResponse } from "next/server";
import {
  createSessionToken,
  verifyPassword,
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const password =
    typeof (body as Record<string, unknown> | null)?.password === "string"
      ? (body as Record<string, unknown>).password
      : "";

  const ok = await verifyPassword(password as string);
  if (!ok) {
    return NextResponse.json(
      { error: "パスワードが正しくありません。" },
      { status: 401 },
    );
  }

  const token = await createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);
  return res;
}
