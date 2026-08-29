import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { proxy } from "@/proxy";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";

const ORIGINAL_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

beforeEach(() => {
  process.env.ADMIN_PASSWORD = "test-password";
});

afterEach(() => {
  process.env.ADMIN_PASSWORD = ORIGINAL_ADMIN_PASSWORD;
});

function requestWithCookie(
  url: string,
  init: { method?: string } = {},
  token?: string,
) {
  const request = new NextRequest(url, init);
  if (token) {
    request.cookies.set(SESSION_COOKIE_NAME, token);
  }
  return request;
}

describe("proxy", () => {
  describe("問い合わせAPIの保護", () => {
    it("未ログインでGET /api/inquiriesを呼ぶと401を返す", async () => {
      const res = await proxy(
        requestWithCookie("http://localhost/api/inquiries"),
      );
      expect(res.status).toBe(401);
    });

    it("未ログインでもPOST /api/inquiries（新規登録）は通す", async () => {
      const res = await proxy(
        requestWithCookie("http://localhost/api/inquiries", { method: "POST" }),
      );
      expect(res.status).toBe(200);
    });

    it("未ログインでGET /api/inquiries/1を呼ぶと401を返す", async () => {
      const res = await proxy(
        requestWithCookie("http://localhost/api/inquiries/1"),
      );
      expect(res.status).toBe(401);
    });

    it("未ログインでDELETE /api/inquiries/1を呼ぶと401を返す", async () => {
      const res = await proxy(
        requestWithCookie("http://localhost/api/inquiries/1", {
          method: "DELETE",
        }),
      );
      expect(res.status).toBe(401);
    });

    it("正しいセッションCookieがあればGET /api/inquiriesを通す", async () => {
      const token = await createSessionToken();
      const res = await proxy(
        requestWithCookie("http://localhost/api/inquiries", {}, token),
      );
      expect(res.status).toBe(200);
    });

    it("不正なセッションCookieの場合は401を返す", async () => {
      const res = await proxy(
        requestWithCookie(
          "http://localhost/api/inquiries",
          {},
          "invalid-token",
        ),
      );
      expect(res.status).toBe(401);
    });
  });

  describe("管理者ページの保護", () => {
    it("未ログインで/adminにアクセスすると/admin/loginへリダイレクトする", async () => {
      const res = await proxy(requestWithCookie("http://localhost/admin"));
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toBe("http://localhost/admin/login");
    });

    it("正しいセッションCookieがあれば/adminへのアクセスを通す", async () => {
      const token = await createSessionToken();
      const res = await proxy(
        requestWithCookie("http://localhost/admin", {}, token),
      );
      expect(res.status).toBe(200);
    });

    it("未ログインでも/admin/loginへのアクセスは通す（無限リダイレクト防止）", async () => {
      const res = await proxy(
        requestWithCookie("http://localhost/admin/login"),
      );
      expect(res.status).toBe(200);
    });
  });
});
