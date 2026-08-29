import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { POST } from "@/app/api/auth/login/route";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

const ORIGINAL_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

beforeEach(() => {
  process.env.ADMIN_PASSWORD = "correct-password";
});

afterEach(() => {
  process.env.ADMIN_PASSWORD = ORIGINAL_ADMIN_PASSWORD;
});

function loginRequest(body: unknown) {
  return new NextRequest("http://localhost/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/login", () => {
  it("正しいパスワードならセッションCookieを発行して200を返す", async () => {
    const res = await POST(loginRequest({ password: "correct-password" }));
    expect(res.status).toBe(200);

    const expectedToken = await createSessionToken();
    const cookie = res.cookies.get(SESSION_COOKIE_NAME);
    expect(cookie?.value).toBe(expectedToken);
    expect(cookie?.httpOnly).toBe(true);
  });

  it("誤ったパスワードの場合は401を返しCookieを発行しない", async () => {
    const res = await POST(loginRequest({ password: "wrong-password" }));
    expect(res.status).toBe(401);
    expect(res.cookies.get(SESSION_COOKIE_NAME)).toBeUndefined();
  });

  it("パスワードが未指定の場合は401を返す", async () => {
    const res = await POST(loginRequest({}));
    expect(res.status).toBe(401);
  });

  it("不正なJSONボディの場合も401を返す（例外を投げない）", async () => {
    const request = new NextRequest("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });
    const res = await POST(request);
    expect(res.status).toBe(401);
  });
});
